import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { Profile } from '@/types/hrms';
import { mapDatabaseError } from '@/utils/errorMapper';

interface PayrollConfig {
  pf_enabled: boolean;
  pf_percentage: number;
  esic_enabled: boolean;
  esic_percentage: number;
  epf_enabled: boolean;
  epf_percentage: number;
}

interface Adjustment {
  id?: string;
  name: string;
  amount: number;
  type: 'addition' | 'deduction';
}

interface ProcessPayrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Profile;
  month: number;
  year: number;
  onSuccess: () => void;
}

export function ProcessPayrollDialog({
  open,
  onOpenChange,
  employee,
  month,
  year,
  onSuccess,
}: ProcessPayrollDialogProps) {
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(true);
  const [config, setConfig] = useState<PayrollConfig | null>(null);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [newAdjustment, setNewAdjustment] = useState<Adjustment>({ name: '', amount: 0, type: 'addition' });
  const [attendanceData, setAttendanceData] = useState({
    workingDays: 0,
    presentDays: 0,
    halfDays: 0,
    paidLeaveDays: 0,
    unpaidLeaveDays: 0,
  });
  const [existingPayroll, setExistingPayroll] = useState<any>(null);

  const baseSalary = Number(employee.monthly_salary || 0);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, employee, month, year]);

  const fetchData = async () => {
    setCalculating(true);
    try {
      // Fetch payroll config
      const { data: settingsData } = await supabase
        .from('company_settings')
        .select('setting_value')
        .eq('setting_key', 'payroll_config')
        .maybeSingle();

      if (settingsData?.setting_value) {
        setConfig(settingsData.setting_value as unknown as PayrollConfig);
      }

      // Check for existing payroll
      const { data: payrollData } = await supabase
        .from('payroll')
        .select('*')
        .eq('user_id', employee.user_id)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      if (payrollData) {
        setExistingPayroll(payrollData);
        setAttendanceData({
          workingDays: payrollData.working_days || 0,
          presentDays: payrollData.present_days || 0,
          halfDays: 0,
          paidLeaveDays: payrollData.paid_leave_days || 0,
          unpaidLeaveDays: payrollData.unpaid_leave_days || 0,
        });

        // Fetch existing adjustments
        const { data: adjData } = await supabase
          .from('payroll_adjustments')
          .select('*')
          .eq('payroll_id', payrollData.id);

        if (adjData) {
          setAdjustments(adjData.map(a => ({
            id: a.id,
            name: a.name,
            amount: Number(a.amount),
            type: a.adjustment_type as 'addition' | 'deduction',
          })));
        }
      } else {
        // Calculate from attendance
        const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
        const endOfMonth = new Date(year, month, 0).toISOString().split('T')[0];

        const { data: attendanceRecords } = await supabase
          .from('attendance_sessions')
          .select('*')
          .eq('user_id', employee.user_id)
          .gte('sign_in_time', startOfMonth)
          .lte('sign_in_time', endOfMonth + 'T23:59:59');

        const presentDays = attendanceRecords?.filter(a => a.status === 'present').length || 0;
        const halfDays = attendanceRecords?.filter(a => a.status === 'half_day').length || 0;
        const lateDays = attendanceRecords?.filter(a => a.status === 'late').length || 0;

        // Fetch approved leaves
        const { data: leaveRecords } = await supabase
          .from('leave_requests')
          .select('*')
          .eq('user_id', employee.user_id)
          .eq('status', 'approved')
          .gte('start_date', startOfMonth)
          .lte('end_date', endOfMonth);

        let paidLeaveDays = 0;
        let unpaidLeaveDays = 0;

        leaveRecords?.forEach(leave => {
          const start = new Date(Math.max(new Date(leave.start_date).getTime(), new Date(startOfMonth).getTime()));
          const end = new Date(Math.min(new Date(leave.end_date).getTime(), new Date(endOfMonth).getTime()));
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          
          if (leave.leave_type === 'unpaid') {
            unpaidLeaveDays += days;
          } else {
            paidLeaveDays += days;
          }
        });

        // Calculate working days in month (weekdays)
        const workingDays = getWorkingDaysInMonth(year, month);

        setAttendanceData({
          workingDays,
          presentDays: presentDays + lateDays + (halfDays * 0.5),
          halfDays,
          paidLeaveDays,
          unpaidLeaveDays,
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setCalculating(false);
    }
  };

  const getWorkingDaysInMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
    return workingDays;
  };

  const addAdjustment = () => {
    if (!newAdjustment.name.trim()) {
      toast.error('Please enter adjustment name');
      return;
    }
    setAdjustments(prev => [...prev, { ...newAdjustment }]);
    setNewAdjustment({ name: '', amount: 0, type: 'addition' });
  };

  const removeAdjustment = (index: number) => {
    setAdjustments(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate salary
  const perDaySalary = baseSalary / attendanceData.workingDays || 0;
  const effectiveDays = attendanceData.presentDays + attendanceData.paidLeaveDays;
  const grossSalary = perDaySalary * effectiveDays;
  
  const pfDeduction = config?.pf_enabled ? (grossSalary * (config.pf_percentage / 100)) : 0;
  const esicDeduction = config?.esic_enabled ? (grossSalary * (config.esic_percentage / 100)) : 0;
  
  const totalAdditions = adjustments.filter(a => a.type === 'addition').reduce((sum, a) => sum + a.amount, 0);
  const totalCustomDeductions = adjustments.filter(a => a.type === 'deduction').reduce((sum, a) => sum + a.amount, 0);
  const totalDeductions = pfDeduction + esicDeduction + totalCustomDeductions;
  
  const netSalary = grossSalary + totalAdditions - totalDeductions;

  const handleProcess = async () => {
    setLoading(true);
    try {
      const payrollData = {
        user_id: employee.user_id,
        month,
        year,
        working_days: attendanceData.workingDays,
        present_days: attendanceData.presentDays,
        paid_leave_days: attendanceData.paidLeaveDays,
        unpaid_leave_days: attendanceData.unpaidLeaveDays,
        base_salary: baseSalary,
        gross_salary: Math.round(grossSalary),
        pf_amount: Math.round(pfDeduction),
        esic_amount: Math.round(esicDeduction),
        total_additions: Math.round(totalAdditions),
        total_deductions: Math.round(totalDeductions),
        deductions: Math.round(totalDeductions),
        net_salary: Math.round(netSalary),
        status: 'processed',
        processed_at: new Date().toISOString(),
      };

      let payrollId: string;

      if (existingPayroll) {
        const { error } = await supabase
          .from('payroll')
          .update(payrollData)
          .eq('id', existingPayroll.id);
        if (error) throw error;
        payrollId = existingPayroll.id;

        // Delete existing adjustments
        await supabase.from('payroll_adjustments').delete().eq('payroll_id', payrollId);
      } else {
        const { data, error } = await supabase
          .from('payroll')
          .insert([payrollData])
          .select()
          .single();
        if (error) throw error;
        payrollId = data.id;
      }

      // Insert new adjustments
      if (adjustments.length > 0) {
        const { error: adjError } = await supabase.from('payroll_adjustments').insert(
          adjustments.map(adj => ({
            payroll_id: payrollId,
            adjustment_type: adj.type,
            name: adj.name,
            amount: adj.amount,
          }))
        );
        if (adjError) throw adjError;
      }

      toast.success(`Payroll processed for ${employee.first_name} ${employee.last_name}`);
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(mapDatabaseError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Process Payroll - {employee.first_name} {employee.last_name}
          </DialogTitle>
        </DialogHeader>

        {calculating ? (
          <div className="py-8 text-center text-muted-foreground">Calculating...</div>
        ) : (
          <div className="space-y-6">
            {/* Attendance Summary */}
            <div>
              <Label className="text-sm font-medium">Attendance Summary</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                <div className="p-3 rounded-lg bg-accent/50 text-center">
                  <p className="text-xs text-muted-foreground">Working Days</p>
                  <p className="text-lg font-bold">{attendanceData.workingDays}</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 text-center">
                  <p className="text-xs text-muted-foreground">Present</p>
                  <p className="text-lg font-bold text-green-700">{attendanceData.presentDays}</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 text-center">
                  <p className="text-xs text-muted-foreground">Paid Leave</p>
                  <p className="text-lg font-bold text-blue-700">{attendanceData.paidLeaveDays}</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 text-center">
                  <p className="text-xs text-muted-foreground">Unpaid Leave</p>
                  <p className="text-lg font-bold text-red-700">{attendanceData.unpaidLeaveDays}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Salary Calculation */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Salary Breakdown</Label>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Salary</span>
                  <span>₹{baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Day Rate</span>
                  <span>₹{Math.round(perDaySalary).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Effective Days ({attendanceData.presentDays} + {attendanceData.paidLeaveDays})</span>
                  <span>{effectiveDays}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Gross Salary</span>
                  <span>₹{Math.round(grossSalary).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Statutory Deductions */}
            {(config?.pf_enabled || config?.esic_enabled) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Statutory Deductions</Label>
                  <div className="space-y-2 text-sm">
                    {config?.pf_enabled && (
                      <div className="flex justify-between text-destructive">
                        <span>PF ({config.pf_percentage}%)</span>
                        <span>- ₹{Math.round(pfDeduction).toLocaleString()}</span>
                      </div>
                    )}
                    {config?.esic_enabled && (
                      <div className="flex justify-between text-destructive">
                        <span>ESIC ({config.esic_percentage}%)</span>
                        <span>- ₹{Math.round(esicDeduction).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Custom Adjustments */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Additions & Deductions</Label>
              
              {adjustments.length > 0 && (
                <div className="space-y-2">
                  {adjustments.map((adj, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border border-border">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${adj.type === 'addition' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {adj.type === 'addition' ? '+' : '-'}
                        </span>
                        <span className="text-sm">{adj.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${adj.type === 'addition' ? 'text-green-600' : 'text-destructive'}`}>
                          {adj.type === 'addition' ? '+' : '-'}₹{adj.amount.toLocaleString()}
                        </span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeAdjustment(index)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Name (e.g., Bonus, Advance)"
                  value={newAdjustment.name}
                  onChange={(e) => setNewAdjustment(prev => ({ ...prev, name: e.target.value }))}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Amount"
                  value={newAdjustment.amount || ''}
                  onChange={(e) => setNewAdjustment(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-28"
                />
                <select
                  value={newAdjustment.type}
                  onChange={(e) => setNewAdjustment(prev => ({ ...prev, type: e.target.value as 'addition' | 'deduction' }))}
                  className="px-2 border rounded-md text-sm bg-background"
                >
                  <option value="addition">Add</option>
                  <option value="deduction">Deduct</option>
                </select>
                <Button variant="outline" size="icon" onClick={addAdjustment}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Final Summary */}
            <div className="p-4 rounded-lg bg-accent/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Gross Salary</span>
                <span>₹{Math.round(grossSalary).toLocaleString()}</span>
              </div>
              {totalAdditions > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Total Additions</span>
                  <span>+ ₹{totalAdditions.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-destructive">
                <span>Total Deductions</span>
                <span>- ₹{Math.round(totalDeductions).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Net Salary</span>
                <span className="text-green-600">₹{Math.round(netSalary).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleProcess} disabled={loading}>
                {loading ? 'Processing...' : existingPayroll ? 'Update Payroll' : 'Process Payroll'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}