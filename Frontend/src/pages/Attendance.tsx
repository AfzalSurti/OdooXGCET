import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { mockAttendanceRecords } from '@/lib/mock-data';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { PageShell } from '@/components/layout/PageShell';

export default function Attendance() {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(true);
  const [checkInTime] = useState('08:55 AM');
  const isHR = user?.role === 'hr' || user?.role === 'admin';
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const handleCheckAction = () => {
    setIsCheckedIn(!isCheckedIn);
  };

  const visibleRecords = isHR
    ? mockAttendanceRecords
    : mockAttendanceRecords.filter(r => r.employeeId === user?.employeeId);

  const recentRecords = visibleRecords.slice(0, 10);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'stable' | 'attention' | 'critical' | 'secondary' }> = {
      present: { variant: 'stable' },
      late: { variant: 'attention' },
      absent: { variant: 'critical' },
      holiday: { variant: 'secondary' },
      'half-day': { variant: 'attention' },
    };
    return <Badge variant={config[status]?.variant || 'secondary'}>{status}</Badge>;
  };

  return (
    <PageShell
      title="Attendance"
      description={isHR ? "A clear view of check-ins, absences, and patterns." : "Your live status and attendance history at a glance."}
      maxWidthClassName="max-w-5xl"
    >

      {/* Check In/Out Card */}
      <Card className="card-tier-3 section-fade-in">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">Current Status</p>
              <div className="flex items-center gap-3 mt-2">
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  isCheckedIn ? "bg-stable animate-pulse" : "bg-muted-foreground"
                )} />
                <span className="text-xl font-semibold">
                  {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                </span>
              </div>
              {isCheckedIn && (
                <p className="text-sm text-muted-foreground mt-1">
                  Since {checkInTime}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-3xl font-semibold tracking-data">
                  {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
              </div>

              <Button 
                size="lg"
                variant={isCheckedIn ? 'outline' : 'default'}
                onClick={handleCheckAction}
                className="min-w-32"
              >
                <Clock className="w-4 h-4 mr-2" />
                {isCheckedIn ? 'Check Out' : 'Check In'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 section-fade-in">
        <Card className="card-tier-1 kpi-accent-green">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold tracking-data">4</p>
            <p className="text-sm text-muted-foreground">Days Present</p>
          </CardContent>
        </Card>
        <Card className="card-tier-1 kpi-accent-teal">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold tracking-data">32.5h</p>
            <p className="text-sm text-muted-foreground">Hours Worked</p>
          </CardContent>
        </Card>
        <Card className="card-tier-1 kpi-accent-blue">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold tracking-data">0</p>
            <p className="text-sm text-muted-foreground">Late Days</p>
          </CardContent>
        </Card>
        <Card className="card-tier-1 kpi-accent-green">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-semibold tracking-data">8:52</p>
            <p className="text-sm text-muted-foreground">Avg. Check-in</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Records */}
      <Card className="card-tier-2 section-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">Recent Attendance</CardTitle>
          <CardDescription>Your attendance history from the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentRecords.map((record) => {
              const statusIndicator = record.status === 'present' ? 'status-indicator-stable' : 
                                      record.status === 'late' ? 'status-indicator-attention' : 
                                      record.status === 'absent' ? 'status-indicator-critical' : '';
              
              return (
              <div 
                key={record.id} 
                className={`flex items-center justify-between py-3 border-b border-border/50 last:border-0 pl-2 ${statusIndicator} transition-colors duration-150 hover:bg-accent/30`}
              >
                <div>
                  <p className="font-medium text-sm">{record.date}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {record.checkIn && record.checkOut 
                      ? `${record.checkIn} - ${record.checkOut}` 
                      : record.status === 'holiday' ? 'Holiday' : 'No record'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {record.workHours && (
                    <span className="text-sm text-muted-foreground">{record.workHours}h</span>
                  )}
                  {getStatusBadge(record.status)}
                </div>
              </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
