import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Info,
  Plus,
} from 'lucide-react';
import { LeaveRequest, LeaveStatus, AIExplanation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { PageShell } from '@/components/layout/PageShell';
import { leaveAPI } from '@/lib/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

function ImpactIndicator({ impact }: { impact: 'positive' | 'negative' | 'neutral' }) {
  if (impact === 'positive') return <ThumbsUp className="w-4 h-4 text-stable" />;
  if (impact === 'negative') return <ThumbsDown className="w-4 h-4 text-critical" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function ExplanationPanel({ 
  explanation, 
  isOpen, 
  onClose 
}: { 
  explanation: AIExplanation | undefined; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  if (!explanation) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            Decision Explanation
          </SheetTitle>
          <SheetDescription>
            This decision was supported by the following factors
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {/* Decision Summary */}
          <div className="p-4 rounded-lg bg-secondary/50">
            <p className="text-sm font-medium text-muted-foreground">AI Recommendation</p>
            <p className="text-lg font-semibold mt-1">{explanation.decision}</p>
          </div>

          {/* Factors */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Supporting Factors</h4>
            {explanation.factors.map((factor, i) => (
              <div 
                key={i} 
                className={cn(
                  "p-4 rounded-lg border transition-all duration-200",
                  factor.impact === 'positive' && "border-stable/30 bg-stable-muted/30",
                  factor.impact === 'negative' && "border-critical/30 bg-critical-muted/30",
                  factor.impact === 'neutral' && "border-border bg-muted/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <ImpactIndicator impact={factor.impact} />
                  <div>
                    <p className="font-medium text-sm">{factor.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{factor.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground pt-4 border-t border-border/50">
            AI supports decision-making. Final decisions rest with HR managers based on organizational context and policies.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function LeaveRequestCard({ 
  request,
  onExplain,
  onApprove,
  onReject,
  isHR,
}: { 
  request: any;
  onExplain: () => void;
  onApprove: (comment?: string) => void;
  onReject: (comment?: string) => void;
  isHR: boolean;
}) {
  const [comment, setComment] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);

  const statusConfig: Record<LeaveStatus, { icon: React.ElementType; variant: 'stable' | 'attention' | 'secondary' }> = {
    pending: { icon: HelpCircle, variant: 'attention' },
    approved: { icon: CheckCircle2, variant: 'stable' },
    rejected: { icon: XCircle, variant: 'secondary' },
  };

  const config = statusConfig[request.status];
  const StatusIcon = config.icon;

  const statusIndicator = request.status === 'pending' ? 'status-indicator-attention' : 
                          request.status === 'approved' ? 'status-indicator-stable' : 
                          'status-indicator-critical';
  
  return (
    <Card className={`card-tier-3 overflow-hidden section-fade-in ${statusIndicator}`}>
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <span className="text-sm font-medium">
                  {request.employeeName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-medium">{request.employeeName}</p>
                <p className="text-sm text-muted-foreground">
                  {request.type.charAt(0).toUpperCase() + request.type.slice(1)} Leave
                </p>
              </div>
            </div>
            <Badge variant={config.variant} className="shrink-0">
              <StatusIcon className="w-3 h-3 mr-1" />
              {request.status}
            </Badge>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Start Date</p>
              <p className="font-medium">{request.startDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">End Date</p>
              <p className="font-medium">{request.endDate}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-muted-foreground text-sm">Reason</p>
            <p className="text-sm mt-1">{request.reason}</p>
          </div>

          {isHR && request.status === 'pending' && (
            <>
              <div className="mt-4">
                <Textarea
                  placeholder="Add a comment (optional)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="resize-none"
                  rows={2}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setShowExplanation(true);
                    onExplain();
                  }}
                  className="gap-2"
                >
                  <Info className="w-4 h-4" />
                  Explain Decision
                </Button>
                <div className="flex gap-2 ml-auto">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onReject(comment)}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button 
                    variant="stable" 
                    size="sm"
                    onClick={() => onApprove(comment)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Leave() {
  const { user } = useAuth();
  const isHR = user?.role === 'hr' || user?.role === 'admin';
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExplanation, setSelectedExplanation] = useState<AIExplanation | undefined>();
  const [showExplanation, setShowExplanation] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Apply leave form state
  const [leaveType, setLeaveType] = useState<'annual' | 'sick' | 'personal' | 'unpaid'>('annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
  }, [user, statusFilter]);

  const fetchLeaveRequests = async () => {
    try {
      setIsLoading(true);
      setError('');
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const data = await leaveAPI.list(status);
      setLeaveRequests(data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch leave requests');
      console.error('Error fetching leave requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      setError('Please fill all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await leaveAPI.apply({
        type: leaveType,
        startDate,
        endDate,
        reason,
      });
      setShowApplyDialog(false);
      setLeaveType('annual');
      setStartDate('');
      setEndDate('');
      setReason('');
      await fetchLeaveRequests();
    } catch (err: any) {
      setError(err?.message || 'Failed to apply for leave');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (id: string, comment?: string) => {
    try {
      await leaveAPI.approve(id, comment);
      await fetchLeaveRequests();
    } catch (err: any) {
      setError(err?.message || 'Failed to approve leave');
    }
  };

  const handleReject = async (id: string, comment?: string) => {
    try {
      await leaveAPI.reject(id, comment);
      await fetchLeaveRequests();
    } catch (err: any) {
      setError(err?.message || 'Failed to reject leave');
    }
  };

  const handleExplain = async (requestId: string) => {
    try {
      const explanation = await leaveAPI.getExplanation(requestId);
      setSelectedExplanation(explanation);
      setShowExplanation(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch explanation');
    }
  };

  const filteredRequests = leaveRequests.filter(
    r => statusFilter === 'all' || r.status === statusFilter
  );

  return (
    <PageShell
      title={isHR ? "Leave Management" : "My Leave"}
      description={
        isHR
          ? "Review leave applications with AI-supported decision insights."
          : "Request time off and track approvals in one calm view."
      }
      actions={
        !isHR ? (
          <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>
                  Fill in the details to submit your leave request
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleApplyLeave} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="leaveType">Leave Type</Label>
                  <Select value={leaveType} onValueChange={(value: any) => setLeaveType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="sick">Sick</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for leave..."
                    required
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowApplyDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        ) : null
      }
      maxWidthClassName="max-w-5xl"
    >
      {error && (
        <Alert variant="destructive" className="section-fade-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filter */}
      <Card className="card-tier-1 section-fade-in">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Filter by status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="card-tier-3">
              <CardContent className="p-5">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRequests.map((request) => (
            <LeaveRequestCard 
              key={request.id} 
              request={request}
              onExplain={() => handleExplain(request.id)}
              onApprove={(comment) => handleApprove(request.id, comment)}
              onReject={(comment) => handleReject(request.id, comment)}
              isHR={isHR}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">No leave requests found</p>
          </CardContent>
        </Card>
      )}

      {/* Explanation Panel */}
      <ExplanationPanel 
        explanation={selectedExplanation}
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
      />
    </PageShell>
  );
}
