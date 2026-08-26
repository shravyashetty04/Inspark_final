-- ==========================================
-- PAYROLL & SALARY ENGINE SCHEMA
-- ==========================================

-- 1. Create salary_structures table
CREATE TABLE IF NOT EXISTS public.salary_structures (
    id uuid default uuid_generate_v4() primary key,
    employee_id uuid references public.employee_profiles(id) on delete cascade not null,
    annual_ctc numeric not null default 0,
    basic_salary numeric not null default 0,
    hra numeric not null default 0,
    allowances numeric not null default 0,
    other_earnings numeric not null default 0,
    pf_deduction numeric not null default 0,
    professional_tax numeric not null default 0,
    tds numeric not null default 0,
    other_deductions numeric not null default 0,
    effective_date date not null default CURRENT_DATE,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(employee_id)
);

-- RLS for salary_structures
ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read own salary structure" ON public.salary_structures
FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Allow admins to read all salary structures" ON public.salary_structures
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'hr')
  )
);

CREATE POLICY "Allow admins to insert/update salary structures" ON public.salary_structures
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'hr')
  )
);


-- 2. Create payroll_records table
CREATE TABLE IF NOT EXISTS public.payroll_records (
    id uuid default uuid_generate_v4() primary key,
    employee_id uuid references public.employee_profiles(id) on delete cascade not null,
    payroll_month text not null, -- Format: YYYY-MM
    working_days numeric not null default 0,
    present_days numeric not null default 0,
    paid_leaves numeric not null default 0,
    lop_days numeric not null default 0,
    
    -- Earnings (Snapshot for the month)
    basic_salary numeric not null default 0,
    hra numeric not null default 0,
    allowances numeric not null default 0,
    bonus numeric not null default 0,
    gross_salary numeric not null default 0,
    
    -- Deductions (Snapshot for the month)
    pf_deduction numeric not null default 0,
    professional_tax numeric not null default 0,
    tds numeric not null default 0,
    lop_deduction numeric not null default 0,
    total_deductions numeric not null default 0,
    
    net_salary numeric not null default 0,
    
    status text not null default 'Processing' check (status in ('Pending', 'Processing', 'Paid', 'On Hold')),
    payment_date date,
    
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(employee_id, payroll_month)
);

-- RLS for payroll_records
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to read own payroll records" ON public.payroll_records
FOR SELECT USING (auth.uid() = employee_id);

CREATE POLICY "Allow admins to manage all payroll records" ON public.payroll_records
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'hr')
  )
);
