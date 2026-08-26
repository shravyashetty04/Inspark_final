-- 1. Alter employee_profiles table to support new fields
ALTER TABLE public.employee_profiles
ADD COLUMN IF NOT EXISTS employee_id text UNIQUE,
ADD COLUMN IF NOT EXISTS dob date,
ADD COLUMN IF NOT EXISTS emergency_contact text,
ADD COLUMN IF NOT EXISTS permanent_address text,
ADD COLUMN IF NOT EXISTS current_address text,
ADD COLUMN IF NOT EXISTS id_proof_url text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'PENDING_ADMIN_APPROVAL',
ADD COLUMN IF NOT EXISTS base_salary numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT 0;

-- 2. Alter attendance table to support work location
ALTER TABLE public.attendance
ADD COLUMN IF NOT EXISTS work_location text CHECK (work_location IN ('WFO', 'WFH')) DEFAULT 'WFO';

-- 3. Reset the trigger so new users start as unapproved again (since we changed this earlier)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.employee_profiles (id, email, full_name, is_approved, status)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', false, 'PENDING_ADMIN_APPROVAL');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: The id_proofs bucket must be created manually in the Supabase Dashboard UI,
-- as SQL bucket creation depends on the exact extensions installed.
-- Go to Storage -> Create Bucket -> Name it "id_proofs". Make it PUBLIC (so admins can view the URL).
