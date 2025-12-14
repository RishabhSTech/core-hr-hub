import { useEffect, useState } from 'react';
import { Building2, Users, CreditCard, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import SuperAdminLayout from './SuperAdminLayout';

interface DashboardStats {
  totalCompanies: number;
  activeCompanies: number;
  totalUsers: number;
  totalRevenue: number;
}

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    activeCompanies: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch companies count
        const { count: totalCompanies } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true });

        const { count: activeCompanies } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Fetch users count
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch total revenue from billing
        const { data: billingData } = await supabase
          .from('billing_history')
          .select('amount')
          .eq('status', 'paid');

        const totalRevenue = billingData?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;

        setStats({
          totalCompanies: totalCompanies || 0,
          activeCompanies: activeCompanies || 0,
          totalUsers: totalUsers || 0,
          totalRevenue,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Companies',
      value: stats.totalCompanies,
      icon: Building2,
      description: `${stats.activeCompanies} active`,
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      description: 'Across all companies',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: CreditCard,
      description: 'All time',
    },
    {
      title: 'Growth',
      value: '+12%',
      icon: TrendingUp,
      description: 'This month',
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your SaaS platform</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? (
                    <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  ) : (
                    stat.value
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                View and manage recent company registrations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Monitor subscription status across companies
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
