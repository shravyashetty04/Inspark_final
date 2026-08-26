import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'employee' | 'hr' | 'admin';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day';
export type LeaveType = 'casual' | 'sick' | 'earned' | 'other';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface EmployeeProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: string | null;
  designation: string | null;
  join_date: string | null;
  is_approved: boolean;
  casual_leave_balance: number;
  sick_leave_balance: number;
  earned_leave_balance: number;
  created_at: string;
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus | null;
  working_hours: number | null;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  type: LeaveType;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approved_by: string | null;
  created_at: string;
}
