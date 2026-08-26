import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Check, X, ShieldAlert, FileText, User } from 'lucide-react';

export default function Employees() {
  const [activeEmployees, setActiveEmployees] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Active/Rejected Employees
      const { data: emps, error: empError } = await supabase
        .from('employee_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (empError) throw empError;
      setActiveEmployees(emps || []);

      // Fetch Pending Onboarding Requests
      const { data: requests, error: reqError } = await supabase
        .from('onboarding_requests')
        .select('*')
        .eq('status', 'PENDING_ADMIN_APPROVAL')
        .order('created_at', { ascending: false });
        
      if (reqError) throw reqError;
      setPendingRequests(requests || []);
      
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const loadingToast = toast.loading('Generating credentials and sending email...');
    try {
      const response = await fetch('/api/auth/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: id })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      toast.success(result.message, { id: loadingToast });
      fetchData();
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch('/api/auth/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: id })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      toast.success('Request rejected.');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateRole = async (id: string, role: string) => {
    try {
      const { error } = await supabase.from('employee_profiles').update({ role }).eq('id', id);
      if (error) throw error;
      toast.success('Role updated');
      fetchData();
    } catch (error: any) { toast.error(error.message); }
  };

  const updateSalary = async (id: string, base_salary: string) => {
    try {
      const { error } = await supabase.from('employee_profiles').update({ base_salary: parseFloat(base_salary) }).eq('id', id);
      if (error) throw error;
      toast.success('Salary updated');
    } catch (error: any) { toast.error(error.message); }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white mb-6">Employee Management</h1>

      {/* Pending Onboarding Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6 shadow-xl mb-8">
          <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center gap-2">
            <ShieldAlert /> Pending Onboarding Approvals ({pendingRequests.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-orange-200/50 text-xs uppercase tracking-wider border-b border-orange-500/20">
                  <th className="p-3 font-semibold">Applicant</th>
                  <th className="p-3 font-semibold">Contact & Address</th>
                  <th className="p-3 font-semibold text-center">ID Proof</th>
                  <th className="p-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-500/10">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="text-white">
                    <td className="p-3">
                      <div className="font-bold">{req.full_name}</div>
                      <div className="text-xs text-orange-200">{req.email}</div>
                    </td>
                    <td className="p-3 text-xs text-gray-300">
                      <div><span className="text-gray-500">DOB:</span> {req.dob}</div>
                      <div><span className="text-gray-500">Phone:</span> {req.emergency_contact}</div>
                      <div className="truncate max-w-[150px]" title={req.current_address}><span className="text-gray-500">Addr:</span> {req.current_address}</div>
                    </td>
                    <td className="p-3 text-center">
                      <a href={req.id_proof_url} target="_blank" rel="noreferrer" className="inline-flex p-2 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors" title="View ID Proof">
                        <FileText size={18} />
                      </a>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleApprove(req.id)} className="p-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl transition-colors" title="Approve & Send Credentials">
                          <Check size={18} />
                        </button>
                        <button onClick={() => handleReject(req.id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl transition-colors" title="Reject Application">
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Employees Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-md shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[#cbd5e1] text-sm uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-semibold">Employee</th>
                <th className="p-4 font-semibold">Contact & Address</th>
                <th className="p-4 font-semibold">Role & Salary</th>
                <th className="p-4 font-semibold text-center">ID Proof</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading...</td></tr>
              ) : activeEmployees.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No active employees found.</td></tr>
              ) : (
                activeEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/5 transition-colors text-white">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] flex items-center justify-center font-bold text-sm">
                          {emp.full_name?.charAt(0) || <User size={16} />}
                        </div>
                        <div>
                          <div className="font-bold">{emp.full_name}</div>
                          <div className="text-xs text-gray-400">{emp.employee_id || 'No ID'}</div>
                          <div className="text-xs text-indigo-300">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-gray-300">
                      <div><span className="text-gray-500">DOB:</span> {emp.dob || 'N/A'}</div>
                      <div><span className="text-gray-500">Phone:</span> {emp.emergency_contact || 'N/A'}</div>
                      <div className="truncate max-w-[150px]" title={emp.current_address}><span className="text-gray-500">Addr:</span> {emp.current_address || 'N/A'}</div>
                    </td>
                    <td className="p-4 space-y-2">
                      <select 
                        value={emp.role}
                        onChange={(e) => updateRole(emp.id, e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded py-1 px-2 text-xs text-white focus:outline-none"
                      >
                        <option value="employee">Employee</option>
                        <option value="hr">HR</option>
                        <option value="admin">Admin</option>
                      </select>
                      <input 
                        type="number"
                        placeholder="Base Salary"
                        defaultValue={emp.base_salary}
                        onBlur={(e) => updateSalary(emp.id, e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded py-1 px-2 text-xs text-white focus:outline-none placeholder:text-gray-600"
                      />
                    </td>
                    <td className="p-4 text-center">
                      {emp.id_proof_url ? (
                        <a href={emp.id_proof_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="View ID Proof">
                          <FileText size={20} />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      {emp.status === 'ACTIVE' || emp.is_approved ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/20">
                          Rejected
                        </span>
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
