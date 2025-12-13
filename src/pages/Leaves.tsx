import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LeaveRequestForm } from '@/components/leaves/LeaveRequestForm';
import { LeaveBalance } from '@/components/leaves/LeaveBalance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { LeaveRequest, LeaveBalance as LeaveBalanceType } from '@/types/hrms';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Leaves() {
  const { user, isAdmin, isManager } = useAuth();
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalanceType | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [requestsResult, balanceResult] = await Promise.all([
        isAdmin 
          ? supabase
              .from('leave_requests')
              .select('*, profile:profiles(first_name, last_name)')
              .order('created_at', { ascending: false })
          : supabase
              .from('leave_requests')
              .select('*, profile:profiles(first_name, last_name)')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false }),
        supabase
          .from('leave_balances')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (requestsResult.data) {
        setRequests(requestsResult.data as unknown as LeaveRequest[]);
      }
      if (balanceResult.data) {
        setBalance(balanceResult.data as LeaveBalanceType);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, isAdmin]);

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ 
          status: 'approved', 
          approved_by: user?.id, 
          approved_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Leave request approved');
      fetchData();
    } catch (error) {
      console.error('Error approving leave:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ 
          status: 'rejected', 
          approved_by: user?.id, 
          approved_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      toast.success('Leave request rejected');
      fetchData();
    } catch (error) {
      console.error('Error rejecting leave:', error);
      toast.error('Failed to reject request');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    }
  };

  const getLeaveTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      casual: 'bg-blue-100 text-blue-700',
      sick: 'bg-red-100 text-red-700',
      paid: 'bg-green-100 text-green-700',
      unpaid: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
          <p className="text-muted-foreground mt-1">
            Request and manage your leaves
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {isAdmin ? 'All Leave Requests' : 'My Leave Requests'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-center py-8 text-muted-foreground">Loading...</p>
                ) : requests.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No leave requests</p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div 
                        key={request.id} 
                        className="flex items-center justify-between p-4 rounded-lg border border-border"
                      >
                        <div className="flex-1">
                          {isAdmin && (
                            <p className="font-medium text-foreground mb-1">
                              {request.profile?.first_name} {request.profile?.last_name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={getLeaveTypeBadge(request.leave_type)}>
                              {request.leave_type}
                            </Badge>
                            {getStatusBadge(request.status)}
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(request.start_date), 'MMM d, yyyy')} - {format(new Date(request.end_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          {request.reason && (
                            <p className="text-sm text-muted-foreground mt-2">{request.reason}</p>
                          )}
                        </div>
                        {isAdmin && request.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-100"
                              onClick={() => handleApprove(request.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-red-100"
                              onClick={() => handleReject(request.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <LeaveBalance balance={balance} />
            <LeaveRequestForm onSuccess={fetchData} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
