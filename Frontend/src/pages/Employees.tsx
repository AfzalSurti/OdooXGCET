import { useState, useEffect } from 'react';
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
import { Search, Filter, ArrowRight, Building2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { PageShell } from '@/components/layout/PageShell';
import { employeesAPI } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function Employees() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await employeesAPI.list();
      setEmployees(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch employees');
      console.error('Error fetching employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
    const matchesSearch = 
      fullName.toLowerCase().includes(search.toLowerCase()) ||
      employee.email?.toLowerCase().includes(search.toLowerCase()) ||
      employee.employeeId?.toLowerCase().includes(search.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const getStatusBadge = (employee: any) => {
    // Since backend doesn't have status field, we'll use a default or calculate based on other fields
    // For now, show a default badge
    return <Badge variant="secondary" className="text-xs">Active</Badge>;
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

      {error && (
        <Alert variant="destructive" className="section-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Employee Cards - Card-row hybrid layout */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredEmployees.length} of {employees.length} employees
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="card-tier-3">
                <CardContent className="p-5">
                  <div className="animate-pulse flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-3 bg-muted rounded w-48"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          filteredEmployees.map((employee, index) => {
            const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
            const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
            
            return (
              <Card 
                key={employee.id} 
                className={cn(
                  "card-tier-3 overflow-hidden transition-all duration-200 ease-in-out section-fade-in"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Human Data Section */}
                    <div className="flex-1 p-5 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border/50">
                        <span className="text-base font-semibold">
                          {initials}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">{fullName || 'Unknown'}</h3>
                            <p className="text-sm text-muted-foreground truncate mt-0.5">{employee.email || 'N/A'}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              {employee.department && (
                                <div className="flex items-center gap-1.5">
                                  <Building2 className="w-3.5 h-3.5" />
                                  <span>{employee.department}</span>
                                </div>
                              )}
                              {employee.position && (
                                <div className="flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5" />
                                  <span>{employee.position}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {getStatusBadge(employee)}
                            <Link to={`/employees/${employee.id}`}>
                              <Button variant="ghost" size="icon" className="h-9 w-9">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
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
