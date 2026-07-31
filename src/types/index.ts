export interface Lead {
  _id?: string;
  fullName: string;
  email: string;
  phone: string;
  loanAmount: number;
  loanPurpose: string;
  employmentStatus: string;
  monthlyIncome: number;
  creditScoreRange: string;
  status: LeadStatus;
  notes?: string;
  assignedTo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "approved"
  | "rejected"
  | "closed";

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserRole = "admin" | "manager" | "agent";

export interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  approvedLeads: number;
  conversionRate: number;
  totalLoanVolume: number;
  leadsByStatus: Record<LeadStatus, number>;
  leadsByDay: { date: string; count: number }[];
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  status?: LeadStatus;
  assignedTo?: string;
}
