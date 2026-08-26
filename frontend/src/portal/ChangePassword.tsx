import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to change your password.');

      // 1. Update Password in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (authError) throw authError;

      // 2. Remove the must_change_password flag
      const { error: dbError } = await supabase
        .from('employee_profiles')
        .update({ must_change_password: false })
        .eq('id', user.id);

      if (dbError) throw dbError;

      toast.success('Password changed successfully! Welcome to the portal.');

      // Fetch role to redirect correctly
      const { data: profile } = await supabase
        .from('employee_profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      if (profile?.role === 'admin' || profile?.role === 'hr') {
        navigate('/portal/admin/dashboard');
      } else {
        navigate('/portal/dashboard');
      }

    } catch (err: any) {
      toast.error(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0E2B] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 mb-6 text-white shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Secure Your Account</h1>
          <p className="text-slate-400">Please change your temporary password to continue.</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder:text-slate-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Updating...' : 'Save & Continue'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
