import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private config: ConfigService,
    private eventEmitter: EventEmitter2,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
  ) {
    this.transporter = nodemailer.createTransport({
      host: config.get('SMTP_HOST'),
      port: config.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: config.get('SMTP_USER'),
        pass: config.get('SMTP_PASS'),
      },
    });
  }

  async create(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    priority?: string;
    metadata?: any;
  }) {
    const notif = this.notifRepo.create({ priority: 'normal', ...data });
    const saved = await this.notifRepo.save(notif);
    this.eventEmitter.emit('notification.created', saved);
    return saved;
  }

  async getUserNotifications(userId: string, unreadOnly = false) {
    const query = this.notifRepo
      .createQueryBuilder('n')
      .where('n.userId = :userId', { userId });
    if (unreadOnly) query.andWhere('n.readAt IS NULL');
    return query.orderBy('n.createdAt', 'DESC').take(50).getMany();
  }

  async markAsRead(id: string, userId: string) {
    await this.notifRepo.update({ id, userId }, { readAt: new Date() });
  }

  async markAllRead(userId: string) {
    await this.notifRepo.update({ userId }, { readAt: new Date() });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM'),
        to,
        subject,
        html,
      });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}:`, err.message);
    }
  }

  async sendComplianceAlert(
    to: string,
    data: { controlName: string; issue: string; severity: string },
  ) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2 style="color: ${data.severity === 'critical' ? '#dc2626' : '#d97706'}">
          Compliance Alert: ${data.severity.toUpperCase()}
        </h2>
        <p><strong>Control:</strong> ${data.controlName}</p>
        <p><strong>Issue:</strong> ${data.issue}</p>
        <p>Please log in to the compliance portal to review and address this issue.</p>
      </div>`;
    await this.sendEmail(
      to,
      `[${data.severity.toUpperCase()}] Compliance Alert: ${data.controlName}`,
      html,
    );
  }

  async sendRiskAlert(
    to: string,
    data: { riskTitle: string; severity: string; dueDate?: Date },
  ) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2>Risk Alert</h2>
        <p><strong>Risk:</strong> ${data.riskTitle}</p>
        <p><strong>Severity:</strong> ${data.severity}</p>
        ${data.dueDate ? `<p><strong>Due:</strong> ${data.dueDate.toDateString()}</p>` : ''}
      </div>`;
    await this.sendEmail(to, `Risk Alert: ${data.riskTitle}`, html);
  }
}
