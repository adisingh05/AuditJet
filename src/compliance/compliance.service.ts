import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ComplianceFramework,
  ComplianceControl,
  ComplianceRisk,
  FrameworkType,
} from './compliance.entity';

const FRAMEWORK_TEMPLATES = {
  [FrameworkType.SOC2]: {
    name: 'SOC 2 Type II',
    description: 'Service Organization Control 2 - Trust Services Criteria',
    controls: [
      {
        controlId: 'CC1.1',
        name: 'Control Environment',
        category: 'Common Criteria',
        description:
          'The entity demonstrates a commitment to integrity and ethical values.',
      },
      {
        controlId: 'CC2.1',
        name: 'Information & Communication',
        category: 'Common Criteria',
        description:
          'The entity obtains or generates relevant, quality information to support internal control.',
      },
      {
        controlId: 'CC3.1',
        name: 'Risk Assessment',
        category: 'Common Criteria',
        description:
          'The entity specifies objectives to enable identification and assessment of risks.',
      },
      {
        controlId: 'CC6.1',
        name: 'Logical Access Controls',
        category: 'Common Criteria',
        description:
          'The entity implements logical access security software, infrastructure, and architectures.',
      },
      {
        controlId: 'CC7.1',
        name: 'System Operations',
        category: 'Common Criteria',
        description:
          'The entity uses detection and monitoring procedures to meet its objectives.',
      },
      {
        controlId: 'A1.1',
        name: 'Availability',
        category: 'Availability',
        description:
          'The entity maintains, monitors, and evaluates current processing capacity.',
      },
      {
        controlId: 'C1.1',
        name: 'Confidentiality',
        category: 'Confidentiality',
        description:
          'The entity identifies and maintains confidential information.',
      },
      {
        controlId: 'PI1.1',
        name: 'Processing Integrity',
        category: 'Processing Integrity',
        description:
          'The entity obtains, uses, and communicates relevant quality information.',
      },
      {
        controlId: 'P1.0',
        name: 'Privacy Notice',
        category: 'Privacy',
        description: 'The entity provides notice about its privacy practices.',
      },
    ],
  },
  [FrameworkType.ISO27001]: {
    name: 'ISO/IEC 27001:2022',
    description: 'Information Security Management System',
    controls: [
      {
        controlId: 'A.5.1',
        name: 'Policies for information security',
        category: 'Organizational Controls',
        description:
          'Information security policy shall be defined, approved, published and communicated.',
      },
      {
        controlId: 'A.6.1',
        name: 'Screening',
        category: 'People Controls',
        description:
          'Background verification checks on all candidates shall be carried out prior to joining.',
      },
      {
        controlId: 'A.7.1',
        name: 'Physical security perimeters',
        category: 'Physical Controls',
        description:
          'Security perimeters shall be defined and used to protect areas containing information assets.',
      },
      {
        controlId: 'A.8.1',
        name: 'User endpoint devices',
        category: 'Technological Controls',
        description:
          'Information stored on or accessible via user endpoint devices shall be protected.',
      },
      {
        controlId: 'A.8.8',
        name: 'Management of technical vulnerabilities',
        category: 'Technological Controls',
        description:
          'Information about technical vulnerabilities shall be obtained and evaluated.',
      },
      {
        controlId: 'A.8.15',
        name: 'Logging',
        category: 'Technological Controls',
        description:
          'Logs that record activities, exceptions and other relevant events shall be produced.',
      },
      {
        controlId: 'A.8.24',
        name: 'Use of cryptography',
        category: 'Technological Controls',
        description:
          'Rules for the effective use of cryptography and key management shall be defined.',
      },
    ],
  },
  [FrameworkType.GDPR]: {
    name: 'GDPR Compliance',
    description: 'General Data Protection Regulation',
    controls: [
      {
        controlId: 'GDPR.5',
        name: 'Principles of Processing',
        category: 'Data Processing',
        description:
          'Personal data shall be processed lawfully, fairly and in a transparent manner.',
      },
      {
        controlId: 'GDPR.6',
        name: 'Lawfulness of Processing',
        category: 'Legal Basis',
        description:
          'Processing shall be lawful only if at least one legal basis applies.',
      },
      {
        controlId: 'GDPR.13',
        name: 'Information to be provided',
        category: 'Transparency',
        description:
          'Provide information to data subjects at the time of collection.',
      },
      {
        controlId: 'GDPR.17',
        name: 'Right to erasure',
        category: 'Data Subject Rights',
        description:
          'Data subjects have the right to erasure of personal data.',
      },
      {
        controlId: 'GDPR.25',
        name: 'Data protection by design',
        category: 'Privacy by Design',
        description:
          'Implement appropriate technical measures for data protection.',
      },
      {
        controlId: 'GDPR.32',
        name: 'Security of processing',
        category: 'Security',
        description:
          'Implement appropriate technical and organisational security measures.',
      },
      {
        controlId: 'GDPR.33',
        name: 'Breach notification',
        category: 'Incident Response',
        description:
          'Notify supervisory authority of personal data breach within 72 hours.',
      },
      {
        controlId: 'GDPR.35',
        name: 'Data protection impact assessment',
        category: 'DPIA',
        description:
          'Carry out a DPIA where processing is likely to result in high risk.',
      },
    ],
  },
};

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(ComplianceFramework)
    private frameworkRepo: Repository<ComplianceFramework>,
    @InjectRepository(ComplianceControl)
    private controlRepo: Repository<ComplianceControl>,
    @InjectRepository(ComplianceRisk)
    private riskRepo: Repository<ComplianceRisk>,
  ) {}

  async createFramework(
    type: FrameworkType,
    customData?: Partial<ComplianceFramework>,
  ) {
    const template = FRAMEWORK_TEMPLATES[type];
    const frameworkNames: Record<string, string> = {
      SOC2: 'SOC 2 Type II',
      ISO27001: 'ISO/IEC 27001',
      GDPR: 'General Data Protection Regulation',
      HIPAA: 'Health Insurance Portability and Accountability Act',
      PCI_DSS: 'Payment Card Industry Data Security Standard',
      NIST: 'NIST Cybersecurity Framework',
      CUSTOM: 'Custom Framework',
    };

    const framework = this.frameworkRepo.create({
      type,
      name: customData?.name || frameworkNames[type] || type,
      description:
        customData?.description ||
        `${frameworkNames[type] || type} compliance framework`,
    });
    
    const saved = await this.frameworkRepo.save(framework);

    if (template?.controls) {
      const controls = template.controls.map((c) =>
        this.controlRepo.create({ ...c, frameworkId: saved.id }),
      );
      await this.controlRepo.save(controls);
    }
    return saved;
  }

  async getAllFrameworks() {
    return this.frameworkRepo.find();
  }

  async getFrameworkById(id: string) {
    const framework = await this.frameworkRepo.findOne({ where: { id } });
    if (!framework) throw new NotFoundException('Framework not found');
    const controls = await this.controlRepo.find({
      where: { frameworkId: id },
    });
    const stats = this.calcFrameworkStats(controls);
    return { ...framework, controls, stats };
  }

  async getControls(frameworkId?: string) {
    const where = frameworkId ? { frameworkId } : {};
    return this.controlRepo.find({ where });
  }

  async updateControl(id: string, updates: Partial<ComplianceControl>) {
    await this.controlRepo.update(id, updates);
    return this.controlRepo.findOne({ where: { id } });
  }

  async createRisk(data: Partial<ComplianceRisk>) {
    const risk = this.riskRepo.create(data);
    return this.riskRepo.save(risk);
  }

  async getRisks(filters?: {
    frameworkId?: string;
    severity?: string;
    status?: string;
  }) {
    const query = this.riskRepo.createQueryBuilder('risk');
    if (filters?.frameworkId)
      query.andWhere('risk.frameworkId = :fid', { fid: filters.frameworkId });
    if (filters?.severity)
      query.andWhere('risk.severity = :sev', { sev: filters.severity });
    if (filters?.status)
      query.andWhere('risk.status = :status', { status: filters.status });
    return query.orderBy('risk.createdAt', 'DESC').getMany();
  }

  async updateRisk(id: string, updates: Partial<ComplianceRisk>) {
    await this.riskRepo.update(id, updates);
    return this.riskRepo.findOne({ where: { id } });
  }

  async getDashboardStats() {
    const frameworks = await this.frameworkRepo.find();
    const allControls = await this.controlRepo.find();
    const allRisks = await this.riskRepo.find();

    const overallScore = this.calcOverallScore(allControls);
    const riskMatrix = this.buildRiskMatrix(allRisks);
    const frameworkScores = frameworks.map((f) => ({
      ...f,
      stats: this.calcFrameworkStats(
        allControls.filter((c) => c.frameworkId === f.id),
      ),
    }));

    return {
      overallComplianceScore: overallScore,
      totalFrameworks: frameworks.length,
      totalControls: allControls.length,
      totalRisks: allRisks.length,
      openRisks: allRisks.filter((r) => r.status === 'open').length,
      criticalRisks: allRisks.filter((r) => r.severity === 'critical').length,
      frameworkScores,
      riskMatrix,
      controlsByStatus: this.groupBy(allControls, 'status'),
    };
  }

  private calcFrameworkStats(controls: ComplianceControl[]) {
    const total = controls.length;
    const implemented = controls.filter(
      (c) => c.status === 'implemented',
    ).length;
    const inProgress = controls.filter(
      (c) => c.status === 'in_progress',
    ).length;
    const notStarted = controls.filter(
      (c) => c.status === 'not_started',
    ).length;
    const failed = controls.filter((c) => c.status === 'failed').length;
    return {
      total,
      implemented,
      inProgress,
      notStarted,
      failed,
      score: total ? Math.round((implemented / total) * 100) : 0,
    };
  }

  private calcOverallScore(controls: ComplianceControl[]) {
    if (!controls.length) return 0;
    return Math.round(
      (controls.filter((c) => c.status === 'implemented').length /
        controls.length) *
        100,
    );
  }

  private buildRiskMatrix(risks: ComplianceRisk[]) {
    return {
      critical: risks.filter((r) => r.severity === 'critical').length,
      high: risks.filter((r) => r.severity === 'high').length,
      medium: risks.filter((r) => r.severity === 'medium').length,
      low: risks.filter((r) => r.severity === 'low').length,
    };
  }

  private groupBy(arr: any[], key: string) {
    return arr.reduce((acc, item) => {
      acc[item[key]] = (acc[item[key]] || 0) + 1;
      return acc;
    }, {});
  }
}
