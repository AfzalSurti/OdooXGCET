import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Clock, 
  CalendarCheck, 
  TrendingUp,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Brain,
} from 'lucide-react';
import { mockDashboardStats, mockLeaveRequests, mockEmployees } from '@/lib/mock-data';
import { Link } from 'react-router-dom';

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  accentColor = 'blue',
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'stable';
  accentColor?: 'blue' | 'green' | 'amber' | 'teal';
}) {
  const accentClasses = {
    blue: 'kpi-accent-blue',
    green: 'kpi-accent-green',
    amber: 'kpi-accent-amber',
    teal: 'kpi-accent-teal',
  };
  
  const iconBgClasses = {
    blue: 'icon-bg-primary',
    green: 'icon-bg-stable',
    amber: 'icon-bg-attention',
    teal: 'icon-bg-teal',
  };
  
  return (
    <Card className={`card-tier-1 ${accentClasses[accentColor]}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-semibold mt-2 tracking-data">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>
            )}
          </div>
          <div className={`w-10 h-10 rounded-lg ${iconBgClasses[accentColor]} flex items-center justify-center shrink-0 ml-3`}>
            <Icon className={`w-5 h-5 ${accentColor === 'blue' ? 'text-primary' : accentColor === 'green' ? 'text-stable' : accentColor === 'amber' ? 'text-attention' : 'text-primary'}`} />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/50">
            <TrendingUp className={`w-3.5 h-3.5 ${trend === 'up' ? 'text-stable' : trend === 'down' ? 'text-critical' : 'text-muted-foreground'}`} />
            <span className="text-xs text-muted-foreground">
              {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PendingLeaveItem({ request }: { request: typeof mockLeaveRequests[0] }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 pl-2 status-indicator-attention transition-colors duration-150 hover:bg-accent/30">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{request.employeeName}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {request.type.charAt(0).toUpperCase() + request.type.slice(1)} leave • {request.startDate}
        </p>
      </div>
      <Link to="/leave">
        <Button size="sm" variant="outline" className="hover:bg-primary hover:text-primary-foreground">
          Review
        </Button>
      </Link>
    </div>
  );
}

function AttentionEmployeeItem({ employee }: { employee: typeof mockEmployees[0] }) {
  const statusConfig = {
    attention: { icon: AlertCircle, variant: 'attention' as const, indicator: 'status-indicator-attention' },
    critical: { icon: AlertCircle, variant: 'critical' as const, indicator: 'status-indicator-critical' },
    stable: { icon: CheckCircle2, variant: 'stable' as const, indicator: 'status-indicator-stable' },
  };
  
  const config = statusConfig[employee.status];
  
  return (
    <div className={`flex items-center gap-3 py-3 border-b border-border/50 last:border-0 pl-2 ${config.indicator} transition-colors duration-150 hover:bg-accent/30`}>
      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
        <span className="text-sm font-medium">
          {employee.name.split(' ').map(n => n[0]).join('')}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{employee.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{employee.aiSummary}</p>
      </div>
      <Badge variant={config.variant} className="shrink-0">
        {employee.status}
      </Badge>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const isHR = user?.role === 'hr' || user?.role === 'admin';
  
  const pendingRequests = mockLeaveRequests.filter(r => r.status === 'pending');
  const attentionEmployees = mockEmployees.filter(e => e.status !== 'stable');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="section-fade-in">
        <h1 className="text-2xl font-semibold text-foreground">
          {isHR ? 'HR Dashboard' : 'My Dashboard'}
        </h1>
        <p className="text-muted-foreground mt-1.5">
          {isHR 
            ? "A clear view of your organization's workforce health and activity" 
            : `Welcome back, ${user?.name?.split(' ')[0]}. Here's what matters today`
          }
        </p>
      </div>

      {/* Stats Grid */}
      {isHR ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value={mockDashboardStats.totalEmployees}
            icon={Users}
            trend="stable"
            accentColor="blue"
          />
          <StatCard
            title="Pending Approvals"
            value={mockDashboardStats.pendingApprovals}
            icon={CalendarCheck}
            accentColor="amber"
          />
          <StatCard
            title="Today's Attendance"
            value={mockDashboardStats.todayAttendance}
            subtitle={`of ${mockDashboardStats.totalEmployees} employees`}
            icon={Clock}
            accentColor="teal"
          />
          <StatCard
            title="Attendance Rate"
            value={`${mockDashboardStats.attendanceRate}%`}
            icon={TrendingUp}
            trend="up"
            accentColor="green"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 section-fade-in">
          <Card className="card-tier-1 kpi-accent-blue">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full icon-bg-primary flex items-center justify-center shrink-0">
                  <UserCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Check-in Status</p>
                  <p className="text-lg font-semibold mt-1">Checked In</p>
                  <p className="text-xs text-stable mt-0.5">08:55 AM</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-tier-1 kpi-accent-green">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full icon-bg-stable flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-6 h-6 text-stable" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Leave Balance</p>
                  <p className="text-lg font-semibold mt-1">9 days</p>
                  <p className="text-xs text-muted-foreground mt-0.5">3 used this year</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-tier-1 kpi-accent-teal">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full icon-bg-teal flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">This Week</p>
                  <p className="text-lg font-semibold mt-1">32.5 hrs</p>
                  <p className="text-xs text-muted-foreground mt-0.5">On track</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leave Requests */}
        {isHR && (
          <Card className="card-tier-3 section-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Requests awaiting your review</CardTitle>
                  <CardDescription className="mt-1">{pendingRequests.length} leave applications need attention</CardDescription>
                </div>
                <Link to="/leave">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {pendingRequests.length > 0 ? (
                <div>
                  {pendingRequests.slice(0, 3).map(request => (
                    <PendingLeaveItem key={request.id} request={request} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No pending requests
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Employees Needing Attention */}
        {isHR && (
          <Card className="card-tier-2 section-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">Areas where intervention may help this week</CardTitle>
                    <span className="ai-supported-label">
                      <Brain className="w-3 h-3" />
                      AI-supported
                    </span>
                  </div>
                  <CardDescription>Insights based on attendance patterns and work behavior</CardDescription>
                </div>
                <Link to="/employees">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View all <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {attentionEmployees.length > 0 ? (
                <div>
                  {attentionEmployees.map(employee => (
                    <AttentionEmployeeItem key={employee.id} employee={employee} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  All employees are stable
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Employee View - Recent Activity */}
        {!isHR && (
          <Card className="lg:col-span-2 card-tier-3 section-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Your recent activity</CardTitle>
              <CardDescription>Attendance and leave updates from the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 border-b border-border/50">
                  <div>
                    <p className="text-sm font-medium">Check-in recorded</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Today at 8:55 AM</p>
                  </div>
                  <Badge variant="stable">Present</Badge>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-border/50">
                  <div>
                    <p className="text-sm font-medium">Leave request approved</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Personal leave - Jan 20</p>
                  </div>
                  <Badge variant="stable">Approved</Badge>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">Check-out recorded</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Yesterday at 6:00 PM</p>
                  </div>
                  <Badge variant="secondary">8.9 hrs</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
