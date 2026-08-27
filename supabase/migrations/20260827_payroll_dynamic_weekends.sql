-- ==========================================
-- DYNAMIC WEEKENDS & COMPANY SETTINGS SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS public.company_settings (
    id uuid default uuid_generate_v4() primary key,
    saturday_policy text not null default 'weekly_off' check (saturday_policy in ('weekly_off', 'working_day')),
    sunday_policy text not null default 'weekly_off' check (sunday_policy in ('weekly_off', 'working_day')),
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default row if empty
INSERT INTO public.company_settings (saturday_policy, sunday_policy)
SELECT 'weekly_off', 'weekly_off'
WHERE NOT EXISTS (SELECT 1 FROM public.company_settings);

-- RLS
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read company settings" ON public.company_settings 
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin update company settings" ON public.company_settings 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'hr')
  )
);

-- Alter payroll_records to add new detailed tracking columns
ALTER TABLE public.payroll_records 
ADD COLUMN IF NOT EXISTS calendar_days numeric not null default 30,
ADD COLUMN IF NOT EXISTS weekly_off_days numeric not null default 0;
