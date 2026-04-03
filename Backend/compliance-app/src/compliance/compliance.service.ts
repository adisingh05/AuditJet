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
  [FrameworkType.DPDP]: {
    name: 'Digital Personal Data Protection Act 2023',
    description:
      "India's Digital Personal Data Protection Act 2023 - Compliance Framework",
    controls: [
      {
        controlId: 'DPDP-1',
        name: 'Consent Management',
        category: 'Data Principal Rights',
        description:
          'Obtain free, specific, informed and unambiguous consent from Data Principals before processing personal data.',
      },
      {
        controlId: 'DPDP-2',
        name: 'Notice to Data Principal',
        category: 'Data Principal Rights',
        description:
          'Provide clear and plain language notice to Data Principals about personal data being collected and the purpose of processing.',
      },
      {
        controlId: 'DPDP-3',
        name: 'Purpose Limitation',
        category: 'Data Processing',
        description:
          'Process personal data only for the specified, explicit and legitimate purpose for which consent was obtained.',
      },
      {
        controlId: 'DPDP-4',
        name: 'Data Minimisation',
        category: 'Data Processing',
        description:
          'Collect only such personal data that is necessary for the specified purpose of processing.',
      },
      {
        controlId: 'DPDP-5',
        name: 'Data Accuracy',
        category: 'Data Quality',
        description:
          'Ensure personal data is accurate and updated. Take reasonable steps to ensure data is correct and not misleading.',
      },
      {
        controlId: 'DPDP-6',
        name: 'Storage Limitation',
        category: 'Data Retention',
        description:
          'Retain personal data only as long as necessary for the specified purpose. Delete data after purpose is fulfilled.',
      },
      {
        controlId: 'DPDP-7',
        name: 'Right to Access',
        category: 'Data Principal Rights',
        description:
          'Enable Data Principals to access summary of personal data being processed and processing activities undertaken.',
      },
      {
        controlId: 'DPDP-8',
        name: 'Right to Correction & Erasure',
        category: 'Data Principal Rights',
        description:
          'Enable Data Principals to correct inaccurate personal data and erase personal data where consent is withdrawn.',
      },
      {
        controlId: 'DPDP-9',
        name: 'Right to Grievance Redressal',
        category: 'Data Principal Rights',
        description:
          'Establish effective grievance redressal mechanism for Data Principals to raise complaints within 48 hours.',
      },
      {
        controlId: 'DPDP-10',
        name: 'Data Fiduciary Obligations',
        category: 'Organisational Measures',
        description:
          'Fulfil all obligations as a Data Fiduciary including security safeguards, breach notification and accountability.',
      },
      {
        controlId: 'DPDP-11',
        name: 'Personal Data Breach Notification',
        category: 'Incident Management',
        description:
          'Notify the Data Protection Board and affected Data Principals of any personal data breach without delay.',
      },
      {
        controlId: 'DPDP-12',
        name: 'Data Localisation',
        category: 'Data Residency',
        description:
          'Ensure certain categories of personal data are stored and processed only within the territory of India.',
      },
      {
        controlId: 'DPDP-13',
        name: "Children's Data Protection",
        category: 'Special Categories',
        description:
          'Obtain verifiable parental consent before processing personal data of children below 18 years of age.',
      },
      {
        controlId: 'DPDP-14',
        name: 'Significant Data Fiduciary Obligations',
        category: 'Organisational Measures',
        description:
          'If classified as Significant Data Fiduciary, appoint a Data Protection Officer and conduct Data Protection Impact Assessment.',
      },
      {
        controlId: 'DPDP-15',
        name: 'Cross-Border Data Transfer',
        category: 'Data Transfer',
        description:
          'Ensure cross-border transfer of personal data is only to countries notified by the Central Government.',
      },
    ],
  },
  [FrameworkType.RBI]: {
    name: 'RBI IT Security Framework',
    description:
      'Reserve Bank of India IT Security Framework for Regulated Entities',
    controls: [
      {
        controlId: 'RBI-1',
        name: 'IT Governance',
        category: 'Governance',
        description:
          'Establish IT governance framework with Board oversight and IT Strategy Committee.',
      },
      {
        controlId: 'RBI-2',
        name: 'Information Security Policy',
        category: 'Policy',
        description:
          'Formulate and implement comprehensive Information Security Policy approved by the Board.',
      },
      {
        controlId: 'RBI-3',
        name: 'Cyber Security Policy',
        category: 'Policy',
        description:
          'Implement a robust Cyber Security Policy addressing current and emerging cyber threats.',
      },
      {
        controlId: 'RBI-4',
        name: 'IT Risk Management',
        category: 'Risk Management',
        description:
          'Implement IT Risk Management framework to identify, assess and mitigate IT risks.',
      },
      {
        controlId: 'RBI-5',
        name: 'Data Security & Privacy',
        category: 'Data Protection',
        description:
          'Ensure customer data privacy and implement data security controls across all systems.',
      },
      {
        controlId: 'RBI-6',
        name: 'Business Continuity Planning',
        category: 'Resilience',
        description:
          'Implement BCP and Disaster Recovery with RTO/RPO targets approved by the Board.',
      },
      {
        controlId: 'RBI-7',
        name: 'Cyber Incident Response',
        category: 'Incident Management',
        description:
          'Establish Cyber Crisis Management Plan and report incidents to RBI within prescribed timelines.',
      },
      {
        controlId: 'RBI-8',
        name: 'Vendor Risk Management',
        category: 'Third Party Risk',
        description:
          'Assess and manage risks from IT vendors and outsourced service providers.',
      },
      {
        controlId: 'RBI-9',
        name: 'Audit Trail & Logging',
        category: 'Monitoring',
        description:
          'Maintain audit trails for all critical systems and ensure logs are tamper-proof.',
      },
      {
        controlId: 'RBI-10',
        name: 'Network Security',
        category: 'Technical Controls',
        description:
          'Implement network security controls including firewalls, IDS/IPS and network segmentation.',
      },
    ],
  },
  [FrameworkType.SEBI]: {
    name: 'SEBI Cyber Security & Cyber Resilience Framework',
    description:
      'SEBI CSCRF for Regulated Entities in Indian Securities Market',
    controls: [
      {
        controlId: 'SEBI-1',
        name: 'Cyber Security Governance',
        category: 'Governance',
        description:
          'Establish cyber security governance with designated Chief Information Security Officer (CISO).',
      },
      {
        controlId: 'SEBI-2',
        name: 'Asset Management',
        category: 'Asset Management',
        description:
          'Maintain inventory of all critical assets and classify them based on sensitivity.',
      },
      {
        controlId: 'SEBI-3',
        name: 'Access Control',
        category: 'Technical Controls',
        description:
          'Implement role-based access control and privileged access management.',
      },
      {
        controlId: 'SEBI-4',
        name: 'Vulnerability Assessment & Penetration Testing',
        category: 'Technical Controls',
        description:
          'Conduct VAPT at least once a year and address critical vulnerabilities within 30 days.',
      },
      {
        controlId: 'SEBI-5',
        name: 'Cyber Incident Reporting',
        category: 'Incident Management',
        description:
          'Report cyber incidents to SEBI within 6 hours of detection.',
      },
      {
        controlId: 'SEBI-6',
        name: 'Cyber Resilience',
        category: 'Resilience',
        description:
          'Implement cyber resilience measures including backup, recovery and business continuity.',
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
      DPDP: 'Digital Personal Data Protection Act 2023',
      RBI: 'RBI IT Security Framework',
      SEBI: 'SEBI Cyber Security & Cyber Resilience Framework',
      CUSTOM: 'Custom Framework',
    };

    const framework = this.frameworkRepo.create({
      type,
      name: customData?.name || template?.name || frameworkNames[type] || type,
      description:
        customData?.description ||
        template?.description ||
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
