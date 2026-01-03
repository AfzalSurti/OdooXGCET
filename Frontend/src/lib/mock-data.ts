import { Employee, LeaveRequest, AttendanceRecord, DashboardStats, User, EmployeeInsight, AIExplanation } from './types';

export const mockCurrentUser: User = {
  id: '1',
  email: 'priya.sharma@zarvo.in',
  name: 'Priya Sharma',
  role: 'hr',
  employeeId: 'EMP001',
  department: 'Human Resources',
};

export const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: 'Priya Sharma',
    email: 'priya.sharma@zarvo.in',
    department: 'Human Resources',
    position: 'HR Manager',
    status: 'stable',
    aiSummary: 'Consistent performance with strong attendance record',
    joinDate: '2021-03-15',
    avatar: undefined,
  },
  {
    id: '2',
    employeeId: 'EMP002',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@zarvo.in',
    department: 'Engineering',
    position: 'Senior Developer',
    status: 'stable',
    aiSummary: 'High productivity, excellent code quality metrics',
    joinDate: '2020-08-22',
    manager: 'Priya Sharma',
  },
  {
    id: '3',
    employeeId: 'EMP003',
    name: 'Anjali Patel',
    email: 'anjali.patel@zarvo.in',
    department: 'Marketing',
    position: 'Marketing Specialist',
    status: 'attention',
    aiSummary: 'Recent increase in sick leaves, schedule adjustment recommended',
    joinDate: '2022-01-10',
    manager: 'Priya Sharma',
  },
  {
    id: '4',
    employeeId: 'EMP004',
    name: 'Vikram Singh',
    email: 'vikram.singh@zarvo.in',
    department: 'Engineering',
    position: 'DevOps Engineer',
    status: 'stable',
    aiSummary: 'Reliable attendance, consistent check-in times',
    joinDate: '2021-11-05',
    manager: 'Rajesh Kumar',
  },
  {
    id: '5',
    employeeId: 'EMP005',
    name: 'Meera Reddy',
    email: 'meera.reddy@zarvo.in',
    department: 'Design',
    position: 'UI/UX Designer',
    status: 'stable',
    aiSummary: 'Strong collaboration metrics, balanced workload',
    joinDate: '2022-06-18',
    manager: 'Priya Sharma',
  },
  {
    id: '6',
    employeeId: 'EMP006',
    name: 'Arjun Nair',
    email: 'arjun.nair@zarvo.in',
    department: 'Sales',
    position: 'Account Executive',
    status: 'critical',
    aiSummary: 'Missed check-ins this week, workload review needed',
    joinDate: '2023-02-01',
    manager: 'Priya Sharma',
  },
];

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    employeeId: 'EMP003',
    employeeName: 'Anjali Patel',
    type: 'sick',
    startDate: '2024-01-15',
    endDate: '2024-01-16',
    reason: 'Fever and cold symptoms, need rest',
    status: 'pending',
    createdAt: '2024-01-14T09:00:00Z',
    aiExplanation: {
      decision: 'Approval Recommended',
      factors: [
        {
          title: 'Team Capacity',
          description: 'Marketing team currently at 80% capacity with adequate coverage',
          impact: 'positive',
        },
        {
          title: 'Leave Balance',
          description: 'Employee has 8 sick leave days remaining',
          impact: 'positive',
        },
        {
          title: 'Recent Pattern',
          description: '3rd sick leave request in 2 months - may indicate underlying concern',
          impact: 'neutral',
        },
      ],
    },
  },
  {
    id: '2',
    employeeId: 'EMP002',
    employeeName: 'Rajesh Kumar',
    type: 'annual',
    startDate: '2024-02-10',
    endDate: '2024-02-14',
    reason: 'Family vacation to Goa planned in advance',
    status: 'pending',
    createdAt: '2024-01-10T14:30:00Z',
    aiExplanation: {
      decision: 'Review Required',
      factors: [
        {
          title: 'Project Deadline',
          description: 'Critical release scheduled for Feb 12 - overlapping with leave',
          impact: 'negative',
        },
        {
          title: 'Advance Notice',
          description: 'Request submitted 30 days in advance - good planning',
          impact: 'positive',
        },
        {
          title: 'Team Coverage',
          description: 'Another senior developer available for coverage',
          impact: 'positive',
        },
      ],
    },
  },
  {
    id: '3',
    employeeId: 'EMP005',
    employeeName: 'Meera Reddy',
    type: 'personal',
    startDate: '2024-01-20',
    endDate: '2024-01-20',
    reason: 'Personal appointment',
    status: 'approved',
    createdAt: '2024-01-12T11:00:00Z',
  },
];

export const mockAttendanceRecords: AttendanceRecord[] = [
  { id: '1', employeeId: 'EMP001', date: '2024-01-15', checkIn: '08:55', checkOut: '17:30', status: 'present', workHours: 8.5 },
  { id: '2', employeeId: 'EMP001', date: '2024-01-14', checkIn: '09:05', checkOut: '18:00', status: 'present', workHours: 8.9 },
  { id: '3', employeeId: 'EMP001', date: '2024-01-13', status: 'holiday' },
  { id: '4', employeeId: 'EMP002', date: '2024-01-15', checkIn: '09:15', checkOut: '18:30', status: 'late', workHours: 9.25 },
  { id: '5', employeeId: 'EMP002', date: '2024-01-14', checkIn: '08:45', checkOut: '17:15', status: 'present', workHours: 8.5 },
  { id: '6', employeeId: 'EMP003', date: '2024-01-15', status: 'absent' },
  { id: '7', employeeId: 'EMP006', date: '2024-01-15', checkIn: '10:30', checkOut: '16:00', status: 'late', workHours: 5.5 },
];

export const mockDashboardStats: DashboardStats = {
  totalEmployees: 6,
  pendingApprovals: 2,
  todayAttendance: 5,
  attendanceRate: 83,
};

export const mockEmployeeInsights: EmployeeInsight[] = [
  { category: 'Attendance', insight: '98% attendance rate over last 90 days', trend: 'stable' },
  { category: 'Leave Usage', insight: '3 of 12 annual leave days used', trend: 'stable' },
  { category: 'Workload', insight: 'Consistent 40-42 hour weeks', trend: 'stable' },
  { category: 'Check-in Pattern', insight: 'Average check-in: 8:52 AM', trend: 'up' },
  { category: 'Overall Status', insight: 'No risk signals detected', trend: 'stable' },
];
