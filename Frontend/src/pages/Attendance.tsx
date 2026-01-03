import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { PageShell } from '@/components/layout/PageShell';
import { attendanceAPI } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Attendance() {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [weeklyRecords, setWeeklyRecords] = useState<any[]>([]);
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');
  const isHR = user?.role === 'hr' || user?.role === 'admin';
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    fetchAttendanceData();
  }, [user]);

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [today, weekly, history] = await Promise.all([
        attendanceAPI.getToday(),
        attendanceAPI.getWeekly(),
        isHR ? attendanceAPI.getHistory() : attendanceAPI.getHistory(user?.id),
      ]);
      
      setTodayAttendance(today);
      setWeeklyRecords(weekly || []);
      setAllRecords(history || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch attendance data');
      console.error('Error fetching attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setIsChecking(true);
      setError('');
      await attendanceAPI.checkIn();
      await fetchAttendanceData();
    } catch (err: any) {
      setError(err?.message || 'Failed to check in');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsChecking(true);
      setError('');
      await attendanceAPI.checkOut();
      await fetchAttendanceData();
    } catch (err: any) {
      setError(err?.message || 'Failed to check out');
    } finally {
      setIsChecking(false);
    }
  };

  const isCheckedIn = !!todayAttendance?.checkIn && !todayAttendance?.checkOut;
  const checkInTime = todayAttendance?.checkIn 
    ? new Date(todayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  // Calculate weekly stats
  const daysPresent = weeklyRecords.filter(r => r.status === 'present' || r.status === 'late').length;
  const totalHours = weeklyRecords.reduce((sum, r) => sum + (r.workHours || 0), 0);
  const lateDays = weeklyRecords.filter(r => r.status === 'late').length;
  const avgCheckIn = weeklyRecords.length > 0 
    ? weeklyRecords
        .filter(r => r.checkIn)
        .reduce((sum, r) => {
          const checkIn = new Date(r.checkIn);
          return sum + checkIn.getHours() + checkIn.getMinutes() / 60;
        }, 0) / weeklyRecords.filter(r => r.checkIn).length
    : 0;

  const recentRecords = allRecords.slice(0, 10);

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

      {error && (
        <Alert variant="destructive" className="section-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Check In/Out Card */}
      {!isHR && (
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
                {isCheckedIn && checkInTime && (
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
                  onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                  className="min-w-32"
                  disabled={isChecking || isLoading}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  {isChecking ? 'Processing...' : isCheckedIn ? 'Check Out' : 'Check In'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Summary */}
      {!isHR && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 section-fade-in">
          <Card className="card-tier-1 kpi-accent-green">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold tracking-data">{daysPresent}</p>
              <p className="text-sm text-muted-foreground">Days Present</p>
            </CardContent>
          </Card>
          <Card className="card-tier-1 kpi-accent-teal">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold tracking-data">{totalHours.toFixed(1)}h</p>
              <p className="text-sm text-muted-foreground">Hours Worked</p>
            </CardContent>
          </Card>
          <Card className="card-tier-1 kpi-accent-blue">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold tracking-data">{lateDays}</p>
              <p className="text-sm text-muted-foreground">Late Days</p>
            </CardContent>
          </Card>
          <Card className="card-tier-1 kpi-accent-green">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-semibold tracking-data">
                {avgCheckIn > 0 ? `${Math.floor(avgCheckIn)}:${Math.floor((avgCheckIn % 1) * 60).toString().padStart(2, '0')}` : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground">Avg. Check-in</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Records */}
      <Card className="card-tier-2 section-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">{isHR ? 'All Attendance Records' : 'Recent Attendance'}</CardTitle>
          <CardDescription>
            {isHR ? 'Attendance history for all employees' : 'Your attendance history from the past week'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between py-3 border-b border-border/50">
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-48"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : recentRecords.length > 0 ? (
            <div className="space-y-3">
              {recentRecords.map((record) => {
                const recordDate = new Date(record.date);
                const checkInTime = record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
                const checkOutTime = record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
                
                const statusIndicator = record.status === 'present' ? 'status-indicator-stable' : 
                                        record.status === 'late' ? 'status-indicator-attention' : 
                                        record.status === 'absent' ? 'status-indicator-critical' : '';
                
                return (
                <div 
                  key={record.id} 
                  className={`flex items-center justify-between py-3 border-b border-border/50 last:border-0 pl-2 ${statusIndicator} transition-colors duration-150 hover:bg-accent/30`}
                >
                  <div>
                    <p className="font-medium text-sm">
                      {recordDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {checkInTime && checkOutTime 
                        ? `${checkInTime} - ${checkOutTime}` 
                        : checkInTime 
                        ? `Checked in at ${checkInTime}`
                        : 'No record'
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
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No attendance records found
            </p>
          )}
        </CardContent>
      </Card>
    </PageShell>
  );
}
