export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  jobTitle?: string;
}

export interface ComplianceFramework {
  id: string;
  name: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
  stats?: FrameworkStats;
}

export interface FrameworkStats {
  total: number;
  implemented: number;
  inProgress: number;
  notStarted: number;
  failed: number;
  score: number;
}

export interface ComplianceControl {
  id: string;
  frameworkId: string;
  controlId: string;
  name: string;
  description: string;
  category: string;
  status: string;
  completionPercentage: number;
  notes?: string;
  dueDate?: string;
}

export interface ComplianceRisk {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  likelihood: number;
  impact: number;
  mitigationPlan?: string;
  dueDate?: string;
}

export interface DashboardStats {
  overallComplianceScore: number;
  totalFrameworks: number;
  totalControls: number;
  totalRisks: number;
  openRisks: number;
  criticalRisks: number;
  frameworkScores: any[];
  riskMatrix: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  controlsByStatus: Record<string, number>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  readAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  description?: string;
  success: boolean;
  createdAt: string;
}
