import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
} from 'lucide-react';
import { mockLeaveRequests } from '@/lib/mock-data';
import { LeaveRequest, LeaveStatus, AIExplanation } from '@/lib/types';
import { cn } from '@/lib/utils';

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
}: { 
  request: LeaveRequest;
  onExplain: () => void;
}) {
  const [comment, setComment] = useState('');

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

          {request.status === 'pending' && (
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
                {request.aiExplanation && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onExplain}
                    className="gap-2"
                  >
                    <Info className="w-4 h-4" />
                    Explain Decision
                  </Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" size="sm">
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                  <Button variant="stable" size="sm">
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
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedExplanation, setSelectedExplanation] = useState<AIExplanation | undefined>();
  const [showExplanation, setShowExplanation] = useState(false);

  const filteredRequests = mockLeaveRequests.filter(
    r => statusFilter === 'all' || r.status === statusFilter
  );

  const handleExplain = (request: LeaveRequest) => {
    setSelectedExplanation(request.aiExplanation);
    setShowExplanation(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 section-fade-in">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-1.5">
            Review leave applications with AI-supported decision insights
          </p>
        </div>
        <Button>Request Leave</Button>
      </div>

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredRequests.map((request) => (
          <LeaveRequestCard 
            key={request.id} 
            request={request}
            onExplain={() => handleExplain(request)}
          />
        ))}
      </div>

      {filteredRequests.length === 0 && (
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
    </div>
  );
}
