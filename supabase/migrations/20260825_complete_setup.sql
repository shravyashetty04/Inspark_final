-- ==========================================
-- COMPLETE INSPARK PORTAL DATABASE SETUP
-- Run this entire script in the SQL Editor
-- ==========================================

-- 1. Create employee_profiles table
CREATE TABLE IF NOT EXISTS public.employee_profiles (
    id uuid references auth.users on delete cascade not null primary key,
    employee_id text UNIQUE,
    full_name text,
    email text unique,
    role text default 'employee' check (role in ('employee', 'hr', 'admin')),
    dob date,
    emergency_contact text,
    permanent_address text,
    current_address text,
    id_proof_url text,
    base_salary numeric DEFAULT 0,
    hourly_rate numeric DEFAULT 0,
    status text DEFAULT 'PENDING_ADMIN_APPROVAL',
    is_approved boolean default false,
    must_change_password boolean DEFAULT false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read for profiles" ON public.employee_profiles
FOR SELECT USING (true);
CREATE POLICY "Allow users to update own profile" ON public.employee_profiles
FOR UPDATE USING (auth.uid() = id);


-- 2. Create onboarding_requests table
CREATE TABLE IF NOT EXISTS public.onboarding_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name text NOT NULL,
    email text NOT NULL UNIQUE,
    dob date,
    emergency_contact text,
    permanent_address text,
    current_address text,
    id_proof_url text,
    status text DEFAULT 'PENDING_ADMIN_APPROVAL',
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for onboarding
ALTER TABLE public.onboarding_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert to onboarding_requests" ON public.onboarding_requests
FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated to view onboarding_requests" ON public.onboarding_requests
FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated to update onboarding_requests" ON public.onboarding_requests
FOR UPDATE USING (auth.role() = 'authenticated');


-- 3. Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
    id uuid default uuid_generate_v4() primary key,
    employee_id uuid references public.employee_profiles(id) on delete cascade not null,
    date date not null,
    check_in timestamp with time zone,
    check_out timestamp with time zone,
    status text default 'present' check (status in ('present', 'absent', 'half_day', 'on_leave')),
    work_location text CHECK (work_location IN ('WFO', 'WFH')) DEFAULT 'WFO',
    working_hours numeric,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(employee_id, date)
);

-- Enable RLS for attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read own attendance" ON public.attendance
FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Allow users to insert own attendance" ON public.attendance
FOR INSERT WITH CHECK (auth.uid() = employee_id);
CREATE POLICY "Allow users to update own attendance" ON public.attendance
FOR UPDATE USING (auth.uid() = employee_id);


-- 4. Create leave_requests table
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id uuid default uuid_generate_v4() primary key,
    employee_id uuid references public.employee_profiles(id) on delete cascade not null,
    type text not null check (type in ('casual', 'sick', 'earned', 'other')),
    start_date date not null,
    end_date date not null,
    days numeric not null,
    reason text not null,
    status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for leaves
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow users to read own leaves" ON public.leave_requests
FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Allow users to insert own leaves" ON public.leave_requests
FOR INSERT WITH CHECK (auth.uid() = employee_id);


-- 5. Trigger to automatically create employee profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.employee_profiles (id, email, full_name, is_approved, status)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', false, 'PENDING_ADMIN_APPROVAL');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
