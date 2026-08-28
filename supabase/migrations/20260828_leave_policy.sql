-- Add lop_days to leave_requests
ALTER TABLE public.leave_requests ADD COLUMN IF NOT EXISTS lop_days numeric DEFAULT 0;

-- Update defaults for employee_profiles so new employees don't start with 12
ALTER TABLE public.employee_profiles ALTER COLUMN casual_leave_balance SET DEFAULT 1;
ALTER TABLE public.employee_profiles ALTER COLUMN sick_leave_balance SET DEFAULT 0;
ALTER TABLE public.employee_profiles ALTER COLUMN earned_leave_balance SET DEFAULT 0;

-- We could reset existing balances if they are untouched, but it's safer to leave existing data as is or just reset everyone's to a base level. 
-- Assuming they are just starting, we'll reset everyone to 1 Casual and 0 Sick for the current month if they still have the default 12.
UPDATE public.employee_profiles 
SET casual_leave_balance = 1, sick_leave_balance = 0, earned_leave_balance = 0 
WHERE casual_leave_balance = 12 AND sick_leave_balance = 12;

-- Function to accrue monthly leaves (+1 Sick, +1 Casual)
CREATE OR REPLACE FUNCTION public.accrue_monthly_leaves()
RETURNS void AS $$
BEGIN
  -- Add 1 Casual and 1 Sick leave to all approved employees
  UPDATE public.employee_profiles
  SET 
    casual_leave_balance = casual_leave_balance + 1,
    sick_leave_balance = sick_leave_balance + 1
  WHERE is_approved = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
