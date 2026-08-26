-- 1. Create onboarding_requests table
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

-- 2. Update employee_profiles table
ALTER TABLE public.employee_profiles
ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false;

-- Add RLS to onboarding_requests
ALTER TABLE public.onboarding_requests ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert (for public signup)
CREATE POLICY "Allow public insert to onboarding_requests" ON public.onboarding_requests
FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view onboarding_requests (Admin will filter in UI)
CREATE POLICY "Allow authenticated to view onboarding_requests" ON public.onboarding_requests
FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to update onboarding_requests
CREATE POLICY "Allow authenticated to update onboarding_requests" ON public.onboarding_requests
FOR UPDATE USING (auth.role() = 'authenticated');
