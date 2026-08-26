import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase, Attendance as AttendanceType } from '../lib/supabase';
import { format } from 'date-fns';

export default function Attendance() {
  const { profile } = useAuth();
  const [records, setRecords] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    if (!profile) return;
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', profile.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching attendance records', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">My Attendance</h1>
          <p className="text-[#cbd5e1] text-sm">View your past attendance records</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-md shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[#cbd5e1] text-sm uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Check In</th>
                <th className="p-4 font-semibold">Check Out</th>
                <th className="p-4 font-semibold text-right">Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">Loading records...</td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">No attendance records found.</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors text-white">
                    <td className="p-4 font-medium">{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        record.status === 'present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                        record.status === 'absent' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                        'bg-orange-500/20 text-orange-400 border border-orange-500/20'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">
                      {record.check_in ? format(new Date(record.check_in), 'hh:mm a') : '--:--'}
                    </td>
                    <td className="p-4 text-gray-300">
                      {record.check_out ? format(new Date(record.check_out), 'hh:mm a') : '--:--'}
                    </td>
                    <td className="p-4 text-right font-medium text-[#e879f9]">
                      {record.working_hours ? `${record.working_hours}h` : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
