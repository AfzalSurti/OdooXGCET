import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, ArrowRight, Building2, User, Brain } from 'lucide-react';
import { mockEmployees } from '@/lib/mock-data';
import { Employee, EmployeeStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { PageShell } from '@/components/layout/PageShell';

export default function Employees() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const departments = [...new Set(mockEmployees.map(e => e.department))];

  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusBadge = (status: EmployeeStatus) => {
    return <Badge variant={status} className="text-xs">{status}</Badge>;
  };

  return (
    <PageShell
      title="Employee Directory"
      description="Browse your organization with AI-assisted summaries and health signals."
      actions={<Button>Add Employee</Button>}
    >

      {/* Filters */}
      <Card className="card-tier-1 section-fade-in">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="attention">Attention</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Cards - Card-row hybrid layout */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredEmployees.length} of {mockEmployees.length} employees
          </p>
        </div>

        {filteredEmployees.map((employee, index) => {
          const statusIndicator = employee.status === 'stable' ? 'status-indicator-stable' : 
                                  employee.status === 'attention' ? 'status-indicator-attention' : 
                                  'status-indicator-critical';
          
          return (
            <Card 
              key={employee.id} 
              className={cn(
                "card-tier-3 overflow-hidden transition-all duration-200 ease-in-out section-fade-in",
                statusIndicator
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row">
                  {/* Human Data Section */}
                  <div className="flex-1 p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border/50">
                    <span className="text-base font-semibold">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base truncate">{employee.name}</h3>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">{employee.email}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{employee.department}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />
                            <span>{employee.position}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {getStatusBadge(employee.status)}
                        <Link to={`/employees/${employee.id}`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subtle Divider */}
                <Separator orientation="vertical" className="hidden lg:block" />

                {/* AI Insight Section - Visually Separated */}
                <div className="lg:w-80 p-5 ai-section border-t lg:border-t-0 lg:border-l">
                  <div className="flex items-start gap-2 mb-2.5">
                    <Brain className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="ai-supported-label">AI-supported insight</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {employee.aiSummary}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {filteredEmployees.length === 0 && (
        <Card className="card-tier-1">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No employees found matching your filters.</p>
          </CardContent>
        </Card>
      )}
    </PageShell>
  );
}
