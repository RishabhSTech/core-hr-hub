import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Payroll as PayrollType, Profile } from '@/types/hrms';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function Payroll() {
  const { user, profile, isAdmin } = useAuth();
  const [payrolls, setPayrolls] = useState<PayrollType[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(`${new Date().getMonth() + 1}`);
  const [selectedYear, setSelectedYear] = useState<string>(`${new Date().getFullYear()}`);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayroll = async () => {
      if (!user) return;

      try {
        const query = isAdmin
          ? supabase.from('payroll').select('*').order('created_at', { ascending: false })
          : supabase.from('payroll').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

        const { data } = await query;
        if (data) {
          setPayrolls(data as PayrollType[]);
        }
      } catch (error) {
        console.error('Error fetching payroll:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayroll();
  }, [user, isAdmin]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentPayroll = payrolls.find(
    p => p.month === parseInt(selectedMonth) && p.year === parseInt(selectedYear)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700">Paid</Badge>;
      case 'processed':
        return <Badge className="bg-blue-100 text-blue-700">Processed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">Draft</Badge>;
    }
  };

  // Calculate estimated salary based on profile data
  const estimatedSalary = profile?.monthly_salary || 0;
  const perDaySalary = estimatedSalary / 30;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
            <p className="text-muted-foreground mt-1">
              View your salary and payroll details
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, i) => (
                  <SelectItem key={month} value={`${i + 1}`}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map(year => (
                  <SelectItem key={year} value={`${year}`}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Base Salary</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    ₹{Number(estimatedSalary).toLocaleString()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Per Day Rate</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    ₹{Math.round(perDaySalary).toLocaleString()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-100 text-green-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Salary Type</p>
                  <p className="text-2xl font-bold text-foreground mt-1 capitalize">
                    {profile?.salary_type || 'Fixed'}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Payroll Details - {months[parseInt(selectedMonth) - 1]} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">Loading...</p>
            ) : currentPayroll ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  {getStatusBadge(currentPayroll.status)}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-accent/50">
                    <p className="text-sm text-muted-foreground">Working Days</p>
                    <p className="text-xl font-bold text-foreground">{currentPayroll.working_days}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50">
                    <p className="text-sm text-muted-foreground">Present Days</p>
                    <p className="text-xl font-bold text-green-700">{currentPayroll.present_days}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50">
                    <p className="text-sm text-muted-foreground">Paid Leave</p>
                    <p className="text-xl font-bold text-blue-700">{currentPayroll.paid_leave_days}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50">
                    <p className="text-sm text-muted-foreground">Unpaid Leave</p>
                    <p className="text-xl font-bold text-red-700">{currentPayroll.unpaid_leave_days}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base Salary</span>
                    <span className="font-medium">₹{Number(currentPayroll.base_salary).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-destructive">
                    <span>Deductions</span>
                    <span className="font-medium">- ₹{Number(currentPayroll.deductions).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
                    <span>Net Salary</span>
                    <span className="text-green-600">₹{Number(currentPayroll.net_salary).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-2">No payroll record found for this month</p>
                <p className="text-sm text-muted-foreground">
                  Payroll will be generated based on your attendance and leave records
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
