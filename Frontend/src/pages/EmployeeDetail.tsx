import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Mail,
  Building2,
  Calendar,
  User,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
} from 'lucide-react';
import { mockEmployees, mockEmployeeInsights, mockAttendanceRecords } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-stable" />;
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-critical" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function AttendanceHeatmap() {
  // Generate mock data for the last 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const statuses = ['present', 'present', 'present', 'present', 'late', 'absent', 'holiday'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      date: date.toISOString().split('T')[0],
      day: date.getDate(),
      status,
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-stable/70';
      case 'late': return 'bg-attention/70';
      case 'absent': return 'bg-critical/50';
      case 'holiday': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {days.map((day, i) => (
          <div
            key={i}
            className={cn(
              "w-7 h-7 rounded-md flex items-center justify-center text-xs font-medium transition-all duration-150 hover:scale-110 cursor-default",
              getStatusColor(day.status)
            )}
            title={`${day.date}: ${day.status}`}
          >
            {day.day}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-stable/70" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-attention/70" />
          <span>Late</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-critical/50" />
          <span>Absent</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-muted" />
          <span>Holiday</span>
        </div>
      </div>
    </div>
  );
}

function CheckInTimeline() {
  const records = mockAttendanceRecords.slice(0, 7);
  
  return (
    <div className="space-y-2">
      {records.map((record, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-20 shrink-0">{record.date}</span>
          <div className="flex-1 h-6 bg-muted/50 rounded-md relative overflow-hidden">
            {record.checkIn && record.checkOut && (
              <div 
                className={cn(
                  "absolute top-0 bottom-0 rounded-md",
                  record.status === 'late' ? 'bg-attention/50' : 'bg-stable/50'
                )}
                style={{
                  left: `${(parseInt(record.checkIn.split(':')[0]) - 8) * 10}%`,
                  width: `${(record.workHours || 8) * 10}%`,
                }}
              />
            )}
          </div>
          <span className="text-xs text-muted-foreground w-16 text-right">
            {record.checkIn || '-'} - {record.checkOut || '-'}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function EmployeeDetail() {
  const { id } = useParams();
  const employee = mockEmployees.find(e => e.id === id);

  if (!employee) {
    return (
      <div className="p-6">
        <p>Employee not found</p>
        <Link to="/employees">
          <Button variant="outline" className="mt-4">Back to Employees</Button>
        </Link>
      </div>
    );
  }

  const statusConfig = {
    stable: { label: 'Stable', variant: 'stable' as const },
    attention: { label: 'Needs Attention', variant: 'attention' as const },
    critical: { label: 'Critical', variant: 'critical' as const },
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Back Button */}
      <Link to="/employees" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Employees
      </Link>

      {/* AI Intelligence Summary - Top Card */}
      <Card className="card-tier-2 section-fade-in">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center">
                <Brain className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <CardTitle className="text-lg">Employee Intelligence Summary</CardTitle>
                  <span className="ai-supported-label">
                    <Brain className="w-3 h-3" />
                    AI-supported
                  </span>
                </div>
                <CardDescription>Insights derived from attendance patterns, leave usage, and work behavior</CardDescription>
              </div>
            </div>
            <Badge variant={statusConfig[employee.status].variant}>
              {statusConfig[employee.status].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3.5">
            {mockEmployeeInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-3">
                <TrendIcon trend={insight.trend} />
                <div>
                  <span className="text-sm font-medium">{insight.category}:</span>
                  <span className="text-sm text-muted-foreground ml-1.5">{insight.insight}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-5 pt-4 border-t border-border/50">
            AI supports decision-making. Final decisions rest with HR managers based on organizational context.
          </p>
        </CardContent>
      </Card>

      {/* Profile & Job Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 section-fade-in">
        <Card className="card-tier-1">
          <CardHeader>
            <CardTitle className="text-lg">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border border-border/50">
                <span className="text-2xl font-semibold">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{employee.name}</h3>
                <p className="text-sm text-muted-foreground">{employee.employeeId}</p>
              </div>
            </div>
            <Separator className="opacity-50" />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>{employee.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{employee.position}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Joined {employee.joinDate}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-tier-1">
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border/30">
                <p className="text-2xl font-semibold tracking-data">98%</p>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border/30">
                <p className="text-2xl font-semibold tracking-data">3/12</p>
                <p className="text-sm text-muted-foreground">Leave Days Used</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border/30">
                <p className="text-2xl font-semibold tracking-data">8:52</p>
                <p className="text-sm text-muted-foreground">Avg. Check-in</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border/30">
                <p className="text-2xl font-semibold tracking-data">41.2h</p>
                <p className="text-sm text-muted-foreground">Avg. Weekly Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Work Pattern Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 section-fade-in">
        <Card className="card-tier-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Check-in Timeline</CardTitle>
            </div>
            <CardDescription>Daily work hours visualization</CardDescription>
          </CardHeader>
          <CardContent>
            <CheckInTimeline />
          </CardContent>
        </Card>

        <Card className="card-tier-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Monthly Attendance</CardTitle>
            </div>
            <CardDescription>Last 30 days overview</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceHeatmap />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
