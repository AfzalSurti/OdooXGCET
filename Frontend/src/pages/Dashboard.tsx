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
import { Link } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { dashboardAPI, leaveAPI } from '@/lib/api';
import { useEffect, useState } from 'react';

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

function PendingLeaveItem({ request }: { request: any }) {
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


export default function Dashboard() {
  const { user } = useAuth();
  const isHR = user?.role === 'hr' || user?.role === 'admin';
  
  const [stats, setStats] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [statsData, leaveData, activityData] = await Promise.all([
          dashboardAPI.getStats(user?.role || 'employee'),
          leaveAPI.list('pending'),
          dashboardAPI.getRecentActivity(),
        ]);
        
        setStats(statsData);
        setPendingRequests(leaveData || []);
        setRecentActivity(activityData || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <PageShell
      title={isHR ? 'HR Dashboard' : 'My Dashboard'}
      description={
        isHR
          ? "A calm, accurate view of workforce health and operational signals."
          : `Welcome back, ${user?.name?.split(' ')[0]}. Here’s what matters today.`
      }
    >

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(isHR ? 4 : 3)].map((_, i) => (
            <Card key={i} className="card-tier-1">
              <CardContent className="p-5">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isHR ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Employees"
            value={stats?.totalEmployees || 0}
            icon={Users}
            trend="stable"
            accentColor="blue"
          />
          <StatCard
            title="Pending Approvals"
            value={stats?.pendingApprovals || 0}
            icon={CalendarCheck}
            accentColor="amber"
          />
          <StatCard
            title="Today's Attendance"
            value={stats?.todayAttendance || 0}
            subtitle={stats?.totalEmployees ? `of ${stats.totalEmployees} employees` : undefined}
            icon={Clock}
            accentColor="teal"
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats?.attendanceRate || 0}%`}
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
                  <p className="text-lg font-semibold mt-1">
                    {stats?.checkedIn ? 'Checked In' : 'Not Checked In'}
                  </p>
                  {stats?.checkInTime && (
                    <p className="text-xs text-stable mt-0.5">
                      {new Date(stats.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
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
                  <p className="text-lg font-semibold mt-1">{stats?.leaveBalance || 0} days</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Available</p>
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
                  <p className="text-lg font-semibold mt-1">{stats?.weeklyHours || 0} hrs</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Worked</p>
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


        {/* Employee View - Recent Activity */}
        {!isHR && (
          <Card className="lg:col-span-2 card-tier-3 section-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Your recent activity</CardTitle>
              <CardDescription>Attendance and leave updates from the past week</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.slice(0, 10).map((activity, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(activity.date).toLocaleDateString([], { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <Badge variant={
                        activity.status === 'approved' || activity.status === 'present' ? 'stable' :
                        activity.status === 'pending' ? 'attention' : 'secondary'
                      }>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No recent activity
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
