import { Profile } from '@/types/hrms';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmployeeTableProps {
  employees: Profile[];
  roles?: Record<string, string>;
}

export function EmployeeTable({ employees, roles = {} }: EmployeeTableProps) {
  const navigate = useNavigate();

  const getInitials = (profile: Profile) => {
    return `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase();
  };

  const getRoleBadge = (userId: string) => {
    const role = roles[userId];
    const variants: Record<string, string> = {
      owner: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      manager: 'bg-green-100 text-green-700',
      employee: 'bg-gray-100 text-gray-700',
    };
    return variants[role] || variants.employee;
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No employees found
              </TableCell>
            </TableRow>
          ) : (
            employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(employee)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">
                        {employee.first_name} {employee.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{employee.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {employee.employee_id || '-'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {employee.department?.name || '-'}
                </TableCell>
                <TableCell>
                  <Badge className={getRoleBadge(employee.user_id)}>
                    {roles[employee.user_id] || 'Employee'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {employee.date_of_joining 
                    ? new Date(employee.date_of_joining).toLocaleDateString()
                    : '-'
                  }
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => navigate(`/employees/${employee.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
