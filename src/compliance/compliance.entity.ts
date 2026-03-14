import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum FrameworkType {
  SOC2 = 'SOC2',
  ISO27001 = 'ISO27001',
  GDPR = 'GDPR',
  HIPAA = 'HIPAA',
  PCI_DSS = 'PCI_DSS',
  NIST = 'NIST',
  CUSTOM = 'CUSTOM',
}

export enum FrameworkStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity('compliance_frameworks')
export class ComplianceFramework {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ type: 'enum', enum: FrameworkType }) type: FrameworkType;
  @Column({ type: 'text', nullable: true }) description: string;
  @Column({
    type: 'enum',
    enum: FrameworkStatus,
    default: FrameworkStatus.ACTIVE,
  })
  status: FrameworkStatus;
  @Column({ nullable: true }) version: string;
  @Column({ nullable: true }) certificationBody: string;
  @Column({ nullable: true }) certificationDate: Date;
  @Column({ nullable: true }) expiryDate: Date;
  @Column({ type: 'json', nullable: true }) metadata: Record<string, any>;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('compliance_controls')
export class ComplianceControl {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() frameworkId: string;
  @Column() controlId: string;
  @Column() name: string;
  @Column({ type: 'text' }) description: string;
  @Column({ nullable: true }) category: string;
  @Column({ nullable: true }) subcategory: string;
  @Column({ default: 'not_started' }) status: string;
  @Column({ nullable: true }) ownerId: string;
  @Column({ nullable: true }) evidence: string;
  @Column({ nullable: true }) dueDate: Date;
  @Column({ type: 'int', default: 0 }) completionPercentage: number;
  @Column({ type: 'text', nullable: true }) notes: string;
  @Column({ type: 'json', nullable: true }) aiSuggestions: any[];
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('compliance_risks')
export class ComplianceRisk {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ type: 'text' }) description: string;
  @Column() category: string;
  @Column({ default: 'medium' }) severity: string;
  @Column({ default: 'open' }) status: string;
  @Column({ nullable: true }) frameworkId: string;
  @Column({ nullable: true }) controlId: string;
  @Column({ nullable: true }) assignedToId: string;
  @Column({ nullable: true }) dueDate: Date;
  @Column({ type: 'int', default: 0 }) likelihood: number;
  @Column({ type: 'int', default: 0 }) impact: number;
  @Column({ type: 'text', nullable: true }) mitigationPlan: string;
  @Column({ type: 'json', nullable: true }) aiAnalysis: any;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
