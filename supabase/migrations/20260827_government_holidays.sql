-- ==========================================
-- GOVERNMENT HOLIDAYS SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS public.government_holidays (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    date date not null,
    year integer not null,
    description text,
    is_active boolean not null default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(date) -- prevent duplicate holidays on the same date
);

-- Alter payroll_records to track holiday days
ALTER TABLE public.payroll_records 
ADD COLUMN IF NOT EXISTS holiday_days numeric not null default 0;

-- RLS
ALTER TABLE public.government_holidays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read government holidays" ON public.government_holidays;
CREATE POLICY "Allow authenticated read government holidays" ON public.government_holidays 
FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow admin manage government holidays" ON public.government_holidays;
CREATE POLICY "Allow admin manage government holidays" ON public.government_holidays 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'hr')
  )
);
