import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditAction } from './audit.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  async log(data: {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    action: AuditAction;
    resource: string;
    resourceId?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    description?: string;
    success?: boolean;
    errorMessage?: string;
  }) {
    const log = this.auditRepo.create({ success: true, ...data });
    return this.auditRepo.save(log);
  }

  async findAll(filters?: {
    userId?: string;
    resource?: string;
    action?: AuditAction;
    from?: Date;
    to?: Date;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 50, from, to, ...rest } = filters || {};
    const query = this.auditRepo.createQueryBuilder('log');

    if (rest.userId)
      query.andWhere('log.userId = :userId', { userId: rest.userId });
    if (rest.resource)
      query.andWhere('log.resource = :resource', { resource: rest.resource });
    if (rest.action)
      query.andWhere('log.action = :action', { action: rest.action });
    if (from && to)
      query.andWhere('log.createdAt BETWEEN :from AND :to', { from, to });

    const [data, total] = await query
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async getActivitySummary(days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const logs = await this.auditRepo.find({
      where: { createdAt: Between(from, new Date()) },
    });

    const byAction = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});

    const byResource = logs.reduce((acc, log) => {
      acc[log.resource] = (acc[log.resource] || 0) + 1;
      return acc;
    }, {});

    return {
      total: logs.length,
      byAction,
      byResource,
      period: `Last ${days} days`,
    };
  }
}
