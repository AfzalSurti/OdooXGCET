import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockEmployees } from '@/lib/mock-data';
import { PageShell } from '@/components/layout/PageShell';

export default function Payroll() {
  const { user } = useAuth();
  const isHR = user?.role === 'hr' || user?.role === 'admin';

  const salaryBreakdown = [
    { label: 'Basic Salary', amount: 50000 },
    { label: 'Housing Allowance (HRA)', amount: 15000 },
    { label: 'Transport Allowance', amount: 5000 },
    { label: 'Medical Allowance', amount: 3000 },
    { label: 'Performance Bonus', amount: 7500 },
  ];

  const deductions = [
    { label: 'Income Tax (TDS)', amount: 8000 },
    { label: 'Health Insurance (ESI)', amount: 2000 },
    { label: 'Provident Fund (PF)', amount: 4000 },
  ];

  const grossSalary = salaryBreakdown.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const netSalary = grossSalary - totalDeductions;

  if (isHR) {
  return (
      <PageShell
        title="Payroll"
        description="Payroll overview for all employees with salary details."
        maxWidthClassName="max-w-6xl"
      >
        <Card className="card-tier-2 section-fade-in">
          <CardHeader>
            <CardTitle className="text-lg">January 2024 Payroll</CardTitle>
            <CardDescription>{mockEmployees.length} employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockEmployees.map((emp, idx) => (
                <div
                  key={emp.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 border-b border-border/50 last:border-0"
                  style={{ animationDelay: `${idx * 20}ms` }}
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{emp.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {emp.employeeId} • {emp.department}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="text-right">
                      <p className="font-semibold tracking-data">Net: ₹{netSalary.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-muted-foreground">
                        Gross ₹{grossSalary.toLocaleString('en-IN')} • Ded. ₹{totalDeductions.toLocaleString('en-IN')}
          </p>
        </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Payslip
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Payroll"
      description="View your salary breakdown and download payslips."
      actions={
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Download Payslip
        </Button>
      }
      maxWidthClassName="max-w-4xl"
    >

      {/* Current Month Summary */}
      <Card className="card-tier-3 section-fade-in">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Net Salary - January 2024</p>
            <p className="text-4xl font-semibold mt-2 tracking-data">₹{netSalary.toLocaleString('en-IN')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Gross: ₹{grossSalary.toLocaleString('en-IN')} | Deductions: ₹{totalDeductions.toLocaleString('en-IN')}
            </p>
          </div>
        </CardContent>
      </Card>

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

      {/* Payment History */}
      <Card className="card-tier-2 section-fade-in">
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
          <CardDescription>Your recent payslips</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {['January 2024', 'December 2023', 'November 2023'].map((month, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-sm">{month}</p>
                  <p className="text-xs text-muted-foreground">Paid on {i === 0 ? '28 Jan' : i === 1 ? '28 Dec' : '28 Nov'}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-medium tracking-data">₹{netSalary.toLocaleString('en-IN')}</span>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  );
}
