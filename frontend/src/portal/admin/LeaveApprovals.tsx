import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function LeaveApprovals() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          employee:employee_profiles(full_name, email, casual_leave_balance, sick_leave_balance, earned_leave_balance)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching leaves', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, employee_id: string, type: string, days: number, status: 'approved' | 'rejected') => {
    try {
      // 1. Update the request status
      const { error } = await supabase
        .from('leave_requests')
        .update({ status })
        .eq('id', id);
      if (error) throw error;

      // 2. If approved, deduct the leave balance (except for 'other' leaves)
      if (status === 'approved' && type !== 'other') {
        const balanceField = `${type}_leave_balance`;
        
        // Fetch current balance
        const { data: profile } = await supabase
          .from('employee_profiles')
          .select(balanceField)
          .eq('id', employee_id)
          .single();
          
        if (profile) {
          const newBalance = profile[balanceField] - days;
          await supabase
            .from('employee_profiles')
            .update({ [balanceField]: newBalance })
            .eq('id', employee_id);
        }
      }

      toast.success(`Leave request ${status}`);
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Error processing request');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Leave Approvals</h1>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-md shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[#cbd5e1] text-sm uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Type & Days</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading requests...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No leave requests found.</td></tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/5 transition-colors text-white">
                    <td className="p-4">
                      <div className="font-medium">{req.employee?.full_name}</div>
                      <div className="text-xs text-gray-400">{req.employee?.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium capitalize">{req.type}</div>
                      <div className="text-xs text-[#e879f9]">{req.days} Day(s)</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {format(new Date(req.start_date), 'MMM dd')} - {format(new Date(req.end_date), 'MMM dd')}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-300 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 
                        req.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 
                        'bg-orange-500/20 text-orange-400 border border-orange-500/20'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(req.id, req.employee_id, req.type, req.days, 'approved')}
                            className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl transition-colors"
                            title="Approve"
                          >
                            <CheckCircle2 size={20} />
                          </button>
                          <button
                            onClick={() => handleAction(req.id, req.employee_id, req.type, req.days, 'rejected')}
                            className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                            title="Reject"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Processed</span>
                      )}
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
