import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, User, Building2, Home } from 'lucide-react';

export default function CompanyAttendance() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendance(dateFilter);
  }, [dateFilter]);

  const fetchAttendance = async (date: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          employee:employee_profiles(full_name, employee_id)
        `)
        .eq('date', date)
        .order('check_in', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (err) {
      console.error('Error fetching company attendance', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Company Attendance</h1>
          <p className="text-[#cbd5e1] text-sm">Monitor daily employee attendance & locations</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2 backdrop-blur-md">
          <CalendarIcon size={18} className="text-[#e879f9]" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="bg-transparent text-white focus:outline-none"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl p-1 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/40 text-[#cbd5e1] text-xs uppercase tracking-wider border-b border-white/10">
                <th className="p-5 font-semibold">Employee</th>
                <th className="p-5 font-semibold text-center">Status</th>
                <th className="p-5 font-semibold text-center">Location</th>
                <th className="p-5 font-semibold text-center">Check In</th>
                <th className="p-5 font-semibold text-center">Check Out</th>
                <th className="p-5 font-semibold text-right">Hours Worked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400">Loading records...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-slate-400">No attendance records found for this date.</td></tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors text-white">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {record.employee?.full_name?.charAt(0) || <User size={16} />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">{record.employee?.full_name}</div>
                          <div className="text-xs text-indigo-300 font-mono">{record.employee?.employee_id || 'ID Pending'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        record.status === 'present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                        record.status === 'absent' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                        'bg-orange-500/20 text-orange-400 border border-orange-500/20'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider ${
                        record.work_location === 'WFH' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                      }`}>
                        {record.work_location === 'WFH' ? <Home size={14} /> : <Building2 size={14} />}
                        {record.work_location}
                      </span>
                    </td>
                    <td className="p-5 text-center text-slate-300 font-medium">
                      {record.check_in ? format(new Date(record.check_in), 'hh:mm a') : '--:--'}
                    </td>
                    <td className="p-5 text-center text-slate-300 font-medium">
                      {record.check_out ? format(new Date(record.check_out), 'hh:mm a') : '--:--'}
                    </td>
                    <td className="p-5 text-right">
                      <div className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                        {record.working_hours ? `${record.working_hours}h` : '-'}
                      </div>
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
