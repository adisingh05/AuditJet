import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum IntegrationType {
  GITHUB = 'github',
  GOOGLE_WORKSPACE = 'google_workspace',
  AWS = 'aws',
  AZURE = 'azure',
  SLACK = 'slack',
  JIRA = 'jira',
}

export enum IntegrationStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  PENDING = 'pending',
}

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn('uuid') id!: string;
  @Column() organizationId!: string;
  @Column({ type: 'enum', enum: IntegrationType }) type!: IntegrationType;
  @Column({
    type: 'enum',
    enum: IntegrationStatus,
    default: IntegrationStatus.PENDING,
  })
  status!: IntegrationStatus;
  @Column({ nullable: true }) accessToken!: string;
  @Column({ nullable: true }) refreshToken!: string;
  @Column({ nullable: true }) tokenExpiry!: Date;
  @Column({ type: 'json', nullable: true }) metadata!: Record<string, any>;
  @Column({ nullable: true }) lastSyncAt!: Date;
  @Column({ nullable: true }) errorMessage!: string;
  @CreateDateColumn() createdAt!: Date;
  @UpdateDateColumn() updatedAt!: Date;
}
