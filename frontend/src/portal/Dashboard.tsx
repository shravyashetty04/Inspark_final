import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { Clock, CheckCircle2, User, MapPin, Map, Building2, Home } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';

export default function Dashboard() {
  const { profile } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workLocation, setWorkLocation] = useState<'WFO' | 'WFH'>('WFO');

  useEffect(() => {
    checkAttendanceStatus();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [profile]);

  const checkAttendanceStatus = async () => {
    if (!profile) return;
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', profile.id)
      .eq('date', today)
      .single();

    if (data) {
      setTodayRecord(data);
      if (data.check_in && !data.check_out) {
        setIsCheckedIn(true);
        setWorkLocation(data.work_location || 'WFO');
      }
    }
  };

  const handleCheckIn = async () => {
    if (!profile) return;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('attendance')
      .insert([
        {
          employee_id: profile.id,
          date: today,
          check_in: now,
          status: 'present',
          work_location: workLocation
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        toast.error('You have already checked in today!');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success(`Successfully checked in from ${workLocation === 'WFO' ? 'Office' : 'Home'}`);
      setIsCheckedIn(true);
      setTodayRecord(data);
    }
  };

  const handleCheckOut = async () => {
    if (!todayRecord || !todayRecord.check_in) return;

    const now = new Date();
    const checkInTime = new Date(todayRecord.check_in);
    const diffMins = differenceInMinutes(now, checkInTime);
    const hoursWorked = (diffMins / 60).toFixed(2);

    const { error } = await supabase
      .from('attendance')
      .update({
        check_out: now.toISOString(),
        working_hours: parseFloat(hoursWorked),
      })
      .eq('id', todayRecord.id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Successfully checked out');
      setIsCheckedIn(false);
      checkAttendanceStatus();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900/40 via-[#7C3AED]/20 to-purple-900/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-20"></div>
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white font-bold text-3xl shadow-lg border border-white/20">
            {profile?.full_name?.charAt(0) || <User size={32} />}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {profile?.full_name}</h1>
            <div className="flex items-center gap-3">
              <span className="text-indigo-300 font-mono text-sm bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/20">
                {profile?.employee_id || 'ID Pending'}
              </span>
              <span className="text-emerald-300 text-sm bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/20 capitalize flex items-center gap-1">
                <CheckCircle2 size={14} /> Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Dynamic Clock-In Action Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="text-[#e879f9]" /> Daily Attendance
            </h2>
            
            <div className="text-center mb-8">
              <div className="text-5xl font-mono text-white tracking-wider mb-2 font-light">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-slate-400">
                {format(currentTime, 'EEEE, MMMM do yyyy')}
              </div>
            </div>

            {/* Work Location Toggle */}
            {!todayRecord && (
              <div className="mb-8 bg-black/20 p-2 rounded-2xl flex gap-2">
                <button
                  onClick={() => setWorkLocation('WFO')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                    workLocation === 'WFO' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Building2 size={18} /> Work From Office
                </button>
                <button
                  onClick={() => setWorkLocation('WFH')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                    workLocation === 'WFH' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Home size={18} /> Work From Home
                </button>
              </div>
            )}
            
            {todayRecord && !todayRecord.check_out && (
              <div className="mb-8 text-center bg-black/20 py-4 rounded-2xl border border-indigo-500/20">
                <p className="text-sm text-slate-400 mb-1">Currently clocked in from</p>
                <p className="text-lg text-indigo-300 font-medium flex items-center justify-center gap-2">
                  {todayRecord.work_location === 'WFH' ? <Home size={20} /> : <Building2 size={20} />}
                  {todayRecord.work_location === 'WFH' ? 'Home' : 'Office'}
                </p>
              </div>
            )}
          </div>

          <div>
            {!todayRecord ? (
              <button
                onClick={handleCheckIn}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20"
              >
                LOG IN
              </button>
            ) : !todayRecord.check_out ? (
              <button
                onClick={handleCheckOut}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:opacity-90 transition-opacity shadow-lg shadow-red-500/20"
              >
                LOG OUT
              </button>
            ) : (
              <div className="w-full py-4 rounded-xl font-bold text-slate-400 bg-white/5 text-center border border-white/10 flex items-center justify-center gap-2">
                <CheckCircle2 size={20} className="text-emerald-500" />
                Shift Completed Today
              </div>
            )}
          </div>
        </div>

        {/* Today's Log Summary */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Today's Log</h2>
          
          <div className="space-y-6">
            <div className="bg-black/20 border border-white/10 rounded-2xl p-5 flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-sm mb-1">Log In Time</p>
                <p className="text-white font-medium text-lg">
                  {todayRecord?.check_in ? format(new Date(todayRecord.check_in), 'hh:mm a') : '--:--'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="bg-black/20 border border-white/10 rounded-2xl p-5 flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-sm mb-1">Log Out Time</p>
                <p className="text-white font-medium text-lg">
                  {todayRecord?.check_out ? format(new Date(todayRecord.check_out), 'hh:mm a') : '--:--'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                <Clock size={20} />
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
              <p className="text-indigo-300 text-sm font-medium mb-2 uppercase tracking-wider">Total Working Hours</p>
              <p className="text-4xl font-bold text-white">
                {todayRecord?.working_hours ? `${todayRecord.working_hours}h` : '0.0h'}
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
