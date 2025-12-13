import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Settings2, Shield } from 'lucide-react';

interface PayrollConfig {
  pf_enabled: boolean;
  pf_percentage: number;
  esic_enabled: boolean;
  esic_percentage: number;
  epf_enabled: boolean;
  epf_percentage: number;
}

export default function Settings() {
  const { role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<PayrollConfig>({
    pf_enabled: false,
    pf_percentage: 12,
    esic_enabled: false,
    esic_percentage: 0.75,
    epf_enabled: false,
    epf_percentage: 12,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('company_settings')
        .select('*')
        .eq('setting_key', 'payroll_config')
        .maybeSingle();

      if (data?.setting_value) {
        setConfig(data.setting_value as unknown as PayrollConfig);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (role !== 'owner' && role !== 'admin') {
      toast.error('Only owners and admins can modify settings');
      return;
    }

    setSaving(true);
    try {
      // Check if setting exists
      const { data: existing } = await supabase
        .from('company_settings')
        .select('id')
        .eq('setting_key', 'payroll_config')
        .maybeSingle();

      const jsonValue = JSON.parse(JSON.stringify(config));

      if (existing) {
        const { error } = await supabase
          .from('company_settings')
          .update({
            setting_value: jsonValue,
            updated_at: new Date().toISOString(),
          })
          .eq('setting_key', 'payroll_config');
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_settings')
          .insert([{
            setting_key: 'payroll_config',
            setting_value: jsonValue,
          }]);
        if (error) throw error;
      }
      
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (role !== 'owner' && role !== 'admin') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground">Access Restricted</h2>
            <p className="text-muted-foreground mt-2">Only owners and admins can access settings</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Company Settings</h1>
          <p className="text-muted-foreground mt-1">Configure payroll deductions and company policies</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" />
              Statutory Deductions
            </CardTitle>
            <CardDescription>
              Configure PF, ESIC, and EPF deductions. These will be automatically calculated during payroll processing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : (
              <>
                {/* PF Configuration */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={config.pf_enabled}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, pf_enabled: checked }))}
                      />
                      <Label className="text-base font-medium">Provident Fund (PF)</Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-12">Employee contribution towards PF</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={config.pf_percentage}
                      onChange={(e) => setConfig(prev => ({ ...prev, pf_percentage: parseFloat(e.target.value) || 0 }))}
                      className="w-20 text-right"
                      disabled={!config.pf_enabled}
                      step="0.01"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>

                {/* ESIC Configuration */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={config.esic_enabled}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, esic_enabled: checked }))}
                      />
                      <Label className="text-base font-medium">ESIC</Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-12">Employee State Insurance contribution</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={config.esic_percentage}
                      onChange={(e) => setConfig(prev => ({ ...prev, esic_percentage: parseFloat(e.target.value) || 0 }))}
                      className="w-20 text-right"
                      disabled={!config.esic_enabled}
                      step="0.01"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>

                {/* EPF Configuration */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={config.epf_enabled}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, epf_enabled: checked }))}
                      />
                      <Label className="text-base font-medium">EPF (Employer)</Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-12">Employer contribution to Provident Fund</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={config.epf_percentage}
                      onChange={(e) => setConfig(prev => ({ ...prev, epf_percentage: parseFloat(e.target.value) || 0 }))}
                      className="w-20 text-right"
                      disabled={!config.epf_enabled}
                      step="0.01"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calculation Preview</CardTitle>
            <CardDescription>
              Example calculation for ₹50,000 base salary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Base Salary</span>
                <span className="font-medium">₹50,000</span>
              </div>
              {config.pf_enabled && (
                <div className="flex justify-between py-2 border-b border-border text-destructive">
                  <span>PF Deduction ({config.pf_percentage}%)</span>
                  <span>- ₹{Math.round(50000 * config.pf_percentage / 100).toLocaleString()}</span>
                </div>
              )}
              {config.esic_enabled && (
                <div className="flex justify-between py-2 border-b border-border text-destructive">
                  <span>ESIC Deduction ({config.esic_percentage}%)</span>
                  <span>- ₹{Math.round(50000 * config.esic_percentage / 100).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between py-2 font-semibold text-base">
                <span>Net Salary</span>
                <span className="text-green-600">
                  ₹{(50000 - 
                    (config.pf_enabled ? 50000 * config.pf_percentage / 100 : 0) - 
                    (config.esic_enabled ? 50000 * config.esic_percentage / 100 : 0)
                  ).toLocaleString()}
                </span>
              </div>
              {config.epf_enabled && (
                <div className="mt-4 p-3 rounded-lg bg-accent/50">
                  <p className="text-sm text-muted-foreground">
                    <strong>Employer EPF Contribution:</strong> ₹{Math.round(50000 * config.epf_percentage / 100).toLocaleString()} (not deducted from employee salary)
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}