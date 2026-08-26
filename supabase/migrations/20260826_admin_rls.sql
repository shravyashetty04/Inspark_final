-- Add policies to allow HR and Admins to manage leave_requests
CREATE POLICY "Allow admins to read all leaves" ON public.leave_requests
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'hr')
  )
);

CREATE POLICY "Allow admins to update all leaves" ON public.leave_requests
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'hr')
  )
);

-- Add policies to allow HR and Admins to read all attendance
CREATE POLICY "Allow admins to read all attendance" ON public.attendance
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'hr')
  )
);

CREATE POLICY "Allow admins to update all attendance" ON public.attendance
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'hr')
  )
);

-- Add policies to allow HR and Admins to update employee profiles (for approving leave balances)
CREATE POLICY "Allow admins to update profiles" ON public.employee_profiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.employee_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'hr')
  )
);
