import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    pendingLeaves: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      const [empRes, attRes, leaveRes] = await Promise.all([
        supabase.from('employee_profiles').select('id', { count: 'exact' }),
        supabase.from('attendance').select('status', { count: 'exact' }).eq('date', today),
        supabase.from('leave_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
      ]);

      const presentCount = attRes.data?.filter(a => a.status === 'present').length || 0;
      const totalEmp = empRes.count || 0;
      
      setStats({
        totalEmployees: totalEmp,
        presentToday: presentCount,
        absentToday: Math.max(0, totalEmp - presentCount),
        pendingLeaves: leaveRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats', error);
    }
  };

  const cards = [
    { title: 'Total Employees', value: stats.totalEmployees, icon: Users, color: 'from-blue-500 to-indigo-500' },
    { title: 'Present Today', value: stats.presentToday, icon: UserCheck, color: 'from-emerald-500 to-teal-500' },
    { title: 'Absent/Not Checked In', value: stats.absentToday, icon: UserX, color: 'from-orange-500 to-red-500' },
    { title: 'Pending Leaves', value: stats.pendingLeaves, icon: Clock, color: 'from-[#7C3AED] to-[#9333EA]' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-xl relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${card.color} rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`}></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-[#cbd5e1] font-medium">{card.title}</h3>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                <card.icon size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold text-white relative z-10">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
