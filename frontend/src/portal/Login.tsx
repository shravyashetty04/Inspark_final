import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [identifier, setIdentifier] = useState(''); // Employee ID or Email
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let loginEmail = identifier;

      // Translate Employee ID to Email
      if (!identifier.includes('@')) {
        const { data: profile, error: fetchError } = await supabase
          .from('employee_profiles')
          .select('email, status')
          .eq('employee_id', identifier.toUpperCase())
          .maybeSingle();
          
        if (fetchError || !profile) {
          throw new Error('Invalid Employee ID/email or password.'); // Generic error to hide info
        }
        
        loginEmail = profile.email;
      }

      // Check if they are pending in onboarding_requests (for informative error)
      if (loginEmail.includes('@')) {
         const { data: pendingReq } = await supabase
           .from('onboarding_requests')
           .select('status')
           .eq('email', loginEmail)
           .maybeSingle();
         
         if (pendingReq && pendingReq.status === 'PENDING_ADMIN_APPROVAL') {
           throw new Error('Your onboarding is currently awaiting admin approval.');
         }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        throw new Error('Invalid Employee ID/email or password.');
      }

      // Fetch profile to check status and must_change_password
      const { data: profileData } = await supabase
        .from('employee_profiles')
        .select('status, role, must_change_password')
        .eq('id', data.user.id)
        .maybeSingle();
        
      if (profileData?.status === 'REJECTED') {
        await supabase.auth.signOut();
        throw new Error('Your account has been rejected. Contact HR.');
      }
      
      if (profileData?.status === 'PENDING_ADMIN_APPROVAL') {
         await supabase.auth.signOut();
         throw new Error('Your onboarding is currently awaiting admin approval.');
      }

      toast.success('Successfully logged in!');
      
      // Force password change check
      if (profileData?.must_change_password) {
        navigate('/portal/change-password');
        return;
      }

      // Role-Based Redirects
      if (profileData?.role === 'admin' || profileData?.role === 'hr') {
        navigate('/portal/admin/dashboard');
      } else {
        navigate('/portal/dashboard');
      }

    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0C0E2B] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-[#7C3AED] rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-[#9333EA] rounded-full mix-blend-multiply filter blur-[128px] opacity-20"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block mb-4">
            <img src="/logo.png" alt="InSpark" className="h-16 rounded-2xl mx-auto shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Portal Access</h1>
          <p className="text-slate-400">Enter your Employee ID or Email to log in</p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Employee ID or Email</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                  placeholder="2026001 or Email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-4"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 text-sm">
            New Employee?{' '}
            <Link to="/portal/signup" className="text-[#e879f9] hover:underline font-medium">
              Complete Onboarding
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
