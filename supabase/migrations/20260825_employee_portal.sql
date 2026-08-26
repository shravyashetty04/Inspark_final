-- Create Enum for user roles
CREATE TYPE public.user_role AS ENUM ('employee', 'hr', 'admin');

-- Create Enum for attendance status
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'half-day');

-- Create Enum for leave types
CREATE TYPE public.leave_type AS ENUM ('casual', 'sick', 'earned', 'other');

-- Create Enum for leave status
CREATE TYPE public.leave_status AS ENUM ('pending', 'approved', 'rejected');

-- Employee Profiles Table
CREATE TABLE public.employee_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text NOT NULL,
  role user_role DEFAULT 'employee'::user_role,
  department text,
  designation text,
  join_date date,
  is_approved boolean DEFAULT false,
  casual_leave_balance numeric DEFAULT 12,
  sick_leave_balance numeric DEFAULT 12,
  earned_leave_balance numeric DEFAULT 15,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Attendance Table
CREATE TABLE public.attendance (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.employee_profiles(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  check_in timestamp with time zone,
  check_out timestamp with time zone,
  status attendance_status,
  working_hours numeric,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(employee_id, date) -- Prevent duplicate check-ins on the same day
);

-- Leave Requests Table
CREATE TABLE public.leave_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id uuid REFERENCES public.employee_profiles(id) ON DELETE CASCADE NOT NULL,
  type leave_type NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  days numeric NOT NULL,
  reason text NOT NULL,
  status leave_status DEFAULT 'pending'::leave_status,
  approved_by uuid REFERENCES public.employee_profiles(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Employees can view their own profile" ON public.employee_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins and HR can view all profiles" ON public.employee_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.employee_profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
);
CREATE POLICY "Admins and HR can update profiles" ON public.employee_profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.employee_profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
);

-- Attendance Policies
CREATE POLICY "Employees can view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Employees can insert own attendance" ON public.attendance FOR INSERT WITH CHECK (auth.uid() = employee_id);
CREATE POLICY "Employees can update own attendance" ON public.attendance FOR UPDATE USING (auth.uid() = employee_id);
CREATE POLICY "Admins and HR can manage all attendance" ON public.attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.employee_profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
);

-- Leave Request Policies
CREATE POLICY "Employees can view own leaves" ON public.leave_requests FOR SELECT USING (auth.uid() = employee_id);
CREATE POLICY "Employees can insert own leaves" ON public.leave_requests FOR INSERT WITH CHECK (auth.uid() = employee_id);
CREATE POLICY "Admins and HR can manage all leaves" ON public.leave_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.employee_profiles WHERE id = auth.uid() AND role IN ('hr', 'admin'))
);

-- Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.employee_profiles (id, email, full_name, is_approved)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', true);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create a profile for a new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
