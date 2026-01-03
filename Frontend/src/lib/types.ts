export type UserRole = 'employee' | 'hr' | 'admin';

export type EmployeeStatus = 'stable' | 'attention' | 'critical';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export type LeaveType = 'annual' | 'sick' | 'personal' | 'unpaid';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  employeeId: string;
  department: string;
  avatar?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: EmployeeStatus;
  aiSummary: string;
  joinDate: string;
  manager?: string;
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'holiday';
  workHours?: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: string;
  aiExplanation?: AIExplanation;
}

export interface AIExplanation {
  decision: string;
  factors: {
    title: string;
    description: string;
    impact: 'positive' | 'negative' | 'neutral';
  }[];
  confidence?: number;
}

export interface EmployeeInsight {
  category: string;
  insight: string;
  trend: 'up' | 'down' | 'stable';
}

export interface DashboardStats {
  totalEmployees: number;
  pendingApprovals: number;
  todayAttendance: number;
  attendanceRate: number;
}
