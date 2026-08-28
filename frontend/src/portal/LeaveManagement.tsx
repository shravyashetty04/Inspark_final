import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { Calendar, Clock, FileText, Send, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function LeaveManagement() {
  const { profile } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'casual',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '18:00',
    reason: '',
  });

  useEffect(() => {
    if (profile) {
      fetchLeaves();
    }
  }, [profile]);

  const fetchLeaves = async () => {
    const { data, error } = await supabase
      .from('leave_requests')
      .select('*')
      .eq('employee_id', profile?.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLeaves(data);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    // Calculate days
    const diffTime = Math.abs(end.getTime() - start.getTime());
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Fetch overlapping active government holidays
    const { data: holidays } = await supabase
      .from('government_holidays')
      .select('date')
      .eq('is_active', true)
      .gte('date', formData.startDate)
      .lte('date', formData.endDate);

    const holidayCount = holidays?.length || 0;
    diffDays = Math.max(0, diffDays - holidayCount);
    
    // If diffDays is 0 after holiday deduction, no need to apply
    if (diffDays === 0) {
      toast.error('The selected date range only contains government holidays.');
      setLoading(false);
      return;
    }
    
    // If it's a single day, check if it's a half day based on time
    if (diffDays === 1 && diffTime === 0) {
      const sTime = parseInt(formData.startTime.replace(':', ''));
      const eTime = parseInt(formData.endTime.replace(':', ''));
      if (eTime - sTime <= 430) { // Approx 4.5 hours
        diffDays = 0.5;
      }
    }

    const { error } = await supabase.from('leave_requests').insert([
      {
        employee_id: profile.id,
        type: formData.type,
        start_date: formData.startDate,
        end_date: formData.endDate,
        days: diffDays,
        reason: `${formData.reason} (Time: ${formData.startTime} to ${formData.endTime})`,
        status: 'pending',
      },
    ]);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Leave application submitted successfully');
      setFormData({ ...formData, reason: '', startDate: '', endDate: '' });
      fetchLeaves();
    }
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved': return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'rejected': return <XCircle size={16} className="text-red-400" />;
      default: return <AlertCircle size={16} className="text-yellow-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Leave Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Leave Application Form */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl">
            <h2 className="text-lg font-bold text-white mb-6">Apply for Leave</h2>
            
            {profile && (
              <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-indigo-300 uppercase tracking-wider mb-1">Casual Balance</p>
                  <p className="text-xl font-bold text-indigo-400">{profile.casual_leave_balance}</p>
                </div>
                <div className="flex-1 bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                  <p className="text-xs text-purple-300 uppercase tracking-wider mb-1">Sick Balance</p>
                  <p className="text-xl font-bold text-purple-400">{profile.sick_leave_balance}</p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Leave Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="casual" className="bg-gray-900">Casual / Paid Leave</option>
                  <option value="sick" className="bg-gray-900">Sick Leave</option>
                  <option value="other" className="bg-gray-900">Other / Unpaid</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Start Time</label>
                  <input
                    type="time"
                    name="startTime"
                    required
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">End Time</label>
                  <input
                    type="time"
                    name="endTime"
                    required
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Reason for Leave</label>
                <textarea
                  name="reason"
                  required
                  rows={3}
                  value={formData.reason}
                  onChange={handleInputChange}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-500"
                  placeholder="Please specify the exact reason..."
                ></textarea>
              </div>

              {(() => {
                if (!formData.startDate || !formData.endDate) return null;
                const start = new Date(formData.startDate);
                const end = new Date(formData.endDate);
                let diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                
                const balance = formData.type === 'casual' ? profile?.casual_leave_balance || 0 : 
                                formData.type === 'sick' ? profile?.sick_leave_balance || 0 : 0;
                
                if (diffDays > balance) {
                  return (
                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex gap-2 text-red-200 mt-4 text-sm">
                      <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-400" />
                      <div>
                        <strong>Warning: Loss of Pay (LOP)</strong>
                        <p>You are requesting {diffDays} days but only have {balance} days of balance. {diffDays - balance} day(s) will be processed as Loss of Pay.</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
                {!loading && <Send size={18} />}
              </button>
            </form>
          </div>
        </div>

        {/* Leave History Table */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-1 backdrop-blur-xl shadow-xl h-full overflow-hidden flex flex-col">
            <div className="p-6 pb-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Leave Status Tracker</h2>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/20 text-[#cbd5e1] text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Applied On</th>
                    <th className="p-4 font-semibold">Type & Duration</th>
                    <th className="p-4 font-semibold hidden md:table-cell">Reason</th>
                    <th className="p-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaves.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-slate-500">
                        <FileText size={48} className="mx-auto mb-3 opacity-20" />
                        No leave requests found.
                      </td>
                    </tr>
                  ) : (
                    leaves.map((leave) => (
                      <tr key={leave.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-sm text-slate-300">
                          {format(new Date(leave.created_at), 'MMM dd, yyyy')}
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-white capitalize">{leave.type} Leave</div>
                          <div className="text-xs text-indigo-300 mt-1 flex items-center gap-1">
                            <Calendar size={12} /> {format(new Date(leave.start_date), 'MMM dd')} - {format(new Date(leave.end_date), 'MMM dd')}
                            <span className="bg-indigo-500/20 px-2 py-0.5 rounded ml-2">{leave.days} Day(s)</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-400 max-w-[200px] truncate hidden md:table-cell" title={leave.reason}>
                          {leave.reason}
                        </td>
                        <td className="p-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            leave.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                            leave.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'
                          }`}>
                            {getStatusIcon(leave.status)}
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
