import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageShell } from '@/components/layout/PageShell';
import { payrollAPI, employeesAPI } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Payroll() {
  const { user } = useAuth();
  const isHR = user?.role === 'hr' || user?.role === 'admin';
  const [payroll, setPayroll] = useState<any>(null);
  const [allPayrolls, setAllPayrolls] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPayrollData();
  }, [user, month, year]);

  const fetchPayrollData = async () => {
    try {
      setIsLoading(true);
      setError('');
      if (isHR) {
        const [payrollsData, employeesData] = await Promise.all([
          payrollAPI.getAll(month, year),
          employeesAPI.list(),
        ]);
        setAllPayrolls(payrollsData || []);
        setEmployees(employeesData || []);
      } else {
        const payrollData = await payrollAPI.getMyPayroll(month, year);
        setPayroll(payrollData);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch payroll data');
      console.error('Error fetching payroll:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPayslip = async (payrollId: string) => {
    try {
      await payrollAPI.downloadPayslip(payrollId);
    } catch (err: any) {
      setError(err?.message || 'Failed to download payslip');
    }
  };

  const salaryBreakdown = payroll ? [
    { label: 'Basic Salary', amount: payroll.basicSalary || 0 },
    { label: 'Housing Allowance (HRA)', amount: payroll.housingAllowance || 0 },
    { label: 'Transport Allowance', amount: payroll.transportAllowance || 0 },
    { label: 'Medical Allowance', amount: payroll.medicalAllowance || 0 },
    { label: 'Performance Bonus', amount: payroll.performanceBonus || 0 },
  ] : [];

  const deductions = payroll ? [
    { label: 'Income Tax (TDS)', amount: payroll.incomeTax || 0 },
    { label: 'Health Insurance (ESI)', amount: payroll.healthInsurance || 0 },
    { label: 'Provident Fund (PF)', amount: payroll.providentFund || 0 },
  ] : [];

  const grossSalary = payroll?.grossSalary || 0;
  const totalDeductions = payroll?.totalDeductions || 0;
  const netSalary = payroll?.netSalary || 0;

  if (isHR) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return (
      <PageShell
        title="Payroll"
        description="Payroll overview for all employees with salary details."
        maxWidthClassName="max-w-6xl"
      >
        {error && (
          <Alert variant="destructive" className="section-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Month/Year Selector */}
        <Card className="card-tier-1 section-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, idx) => (
                    <SelectItem key={idx + 1} value={(idx + 1).toString()}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(5)].map((_, i) => {
                    const y = new Date().getFullYear() - i;
                    return <SelectItem key={y} value={y.toString()}>{y}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="card-tier-2 section-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">{monthNames[month - 1]} {year} Payroll</CardTitle>
            <CardDescription>{allPayrolls.length} employees</CardDescription>
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
                    <div className="h-6 bg-muted rounded w-24"></div>
                  </div>
                ))}
              </div>
            ) : allPayrolls.length > 0 ? (
              <div className="space-y-3">
                {allPayrolls.map((payrollRecord, idx) => {
                  const employee = employees.find(e => e.id === payrollRecord.employeeId);
                  return (
                    <div
                      key={payrollRecord.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-border/50 last:border-0"
                      style={{ animationDelay: `${idx * 20}ms` }}
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {employee?.employeeId || payrollRecord.employeeId} • {employee?.department || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="text-right">
                          <p className="font-semibold tracking-data">
                            Net: ₹{(payrollRecord.netSalary || 0).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Gross ₹{(payrollRecord.grossSalary || 0).toLocaleString('en-IN')} • Ded. ₹{(payrollRecord.totalDeductions || 0).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleDownloadPayslip(payrollRecord.id)}
                        >
                          <Download className="w-4 h-4" />
                          Payslip
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No payroll records found for this period
              </p>
            )}
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <PageShell
      title="Payroll"
      description="View your salary breakdown and download payslips."
      actions={
        payroll ? (
          <Button 
            className="gap-2"
            onClick={() => handleDownloadPayslip(payroll.id)}
          >
            <Download className="w-4 h-4" />
            Download Payslip
          </Button>
        ) : null
      }
      maxWidthClassName="max-w-4xl"
    >
      {error && (
        <Alert variant="destructive" className="section-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Month/Year Selector */}
      <Card className="card-tier-1 section-fade-in">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((name, idx) => (
                  <SelectItem key={idx + 1} value={(idx + 1).toString()}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...Array(5)].map((_, i) => {
                  const y = new Date().getFullYear() - i;
                  return <SelectItem key={y} value={y.toString()}>{y}</SelectItem>;
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Current Month Summary */}
      {isLoading ? (
        <Card className="card-tier-3 section-fade-in">
          <CardContent className="p-6">
            <div className="animate-pulse text-center">
              <div className="h-4 bg-muted rounded w-32 mx-auto mb-2"></div>
              <div className="h-10 bg-muted rounded w-48 mx-auto mb-2"></div>
              <div className="h-3 bg-muted rounded w-64 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      ) : payroll ? (
        <Card className="card-tier-3 section-fade-in">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Net Salary - {monthNames[month - 1]} {year}
              </p>
              <p className="text-4xl font-semibold mt-2 tracking-data">
                ₹{netSalary.toLocaleString('en-IN')}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Gross: ₹{grossSalary.toLocaleString('en-IN')} | Deductions: ₹{totalDeductions.toLocaleString('en-IN')}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-tier-3 section-fade-in">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              No payroll record found for {monthNames[month - 1]} {year}
            </p>
          </CardContent>
        </Card>
      )}

      {payroll && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Earnings */}
          <Card className="card-tier-1 section-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Earnings</CardTitle>
              <CardDescription>Monthly salary breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salaryBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm">{item.label}</span>
                    <span className="font-medium tracking-data">₹{item.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t-2 border-border">
                  <span className="font-semibold">Gross Salary</span>
                  <span className="font-semibold tracking-data">₹{grossSalary.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deductions */}
          <Card className="card-tier-1 section-fade-in">
            <CardHeader>
              <CardTitle className="text-lg">Deductions</CardTitle>
              <CardDescription>Monthly deductions from salary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deductions.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm">{item.label}</span>
                    <span className="font-medium text-critical tracking-data">-₹{item.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 border-t-2 border-border">
                  <span className="font-semibold">Total Deductions</span>
                  <span className="font-semibold text-critical tracking-data">-₹{totalDeductions.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </PageShell>
  );
}
