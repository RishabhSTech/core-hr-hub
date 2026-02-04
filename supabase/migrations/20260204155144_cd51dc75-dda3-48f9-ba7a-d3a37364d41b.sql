-- Add RLS policies for holidays table
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view holidays in their company"
ON public.holidays FOR SELECT
USING (belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Company admins can manage holidays"
ON public.holidays FOR ALL
USING (belongs_to_company(auth.uid(), company_id) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner')))
WITH CHECK (belongs_to_company(auth.uid(), company_id) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner')));

-- Add RLS policies for company_settings table
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view settings in their company"
ON public.company_settings FOR SELECT
USING (belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Company admins can manage settings"
ON public.company_settings FOR ALL
USING (belongs_to_company(auth.uid(), company_id) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner')))
WITH CHECK (belongs_to_company(auth.uid(), company_id) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner')));

-- Add RLS policies for work_sessions table
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view work sessions in their company"
ON public.work_sessions FOR SELECT
USING (belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Company admins can manage work sessions"
ON public.work_sessions FOR ALL
USING (belongs_to_company(auth.uid(), company_id) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner')))
WITH CHECK (belongs_to_company(auth.uid(), company_id) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner')));

-- Add RLS policies for payroll_adjustments table
ALTER TABLE public.payroll_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payroll adjustments in their company"
ON public.payroll_adjustments FOR SELECT
USING (belongs_to_company(auth.uid(), company_id));

CREATE POLICY "Company admins can manage payroll adjustments"
ON public.payroll_adjustments FOR ALL
USING (belongs_to_company(auth.uid(), company_id) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner')))
WITH CHECK (belongs_to_company(auth.uid(), company_id) AND (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'owner')));