import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole } from '@/types/hrms';
import { useAuth } from '@/contexts/AuthContext';

export default function Employees() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    const fetchEmployees = async () => {
      try {
        const [employeesResult, rolesResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('*, department:departments(*)')
            .order('created_at', { ascending: false }),
          supabase.from('user_roles').select('*'),
        ]);

        if (employeesResult.data) {
          setEmployees(employeesResult.data as unknown as Profile[]);
        }

        if (rolesResult.data) {
          const rolesMap: Record<string, string> = {};
          rolesResult.data.forEach((r: UserRole) => {
            rolesMap[r.user_id] = r.role;
          });
          setRoles(rolesMap);
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [isAdmin, navigate]);

  const filteredEmployees = employees.filter(emp => {
    const searchLower = search.toLowerCase();
    return (
      emp.first_name.toLowerCase().includes(searchLower) ||
      emp.last_name.toLowerCase().includes(searchLower) ||
      emp.email.toLowerCase().includes(searchLower) ||
      emp.employee_id?.toLowerCase().includes(searchLower)
    );
  });

  if (!isAdmin) return null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground mt-1">
              Manage your organization's workforce
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : (
          <EmployeeTable employees={filteredEmployees} roles={roles} />
        )}
      </div>
    </AppLayout>
  );
}
