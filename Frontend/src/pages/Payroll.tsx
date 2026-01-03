import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function Payroll() {
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 section-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Payroll</h1>
          <p className="text-muted-foreground mt-1.5">
            View your salary breakdown and download payslips
          </p>
        </div>
        <Button className="gap-2">
          <Download className="w-4 h-4" />
          Download Payslip
        </Button>
      </div>

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
    </div>
  );
}
