import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  CalendarOff, 
  Calendar, 
  LogOut, 
  Users, 
  Settings,
  Menu,
  X,
  IndianRupee,
  Video,
  MessageSquare,
  Phone,
  PhoneIncoming,
  PhoneOff
} from 'lucide-react';
import { useState } from 'react';
import { useCall } from '../CallContext';

export default function PortalLayout() {
  const { profile, logout } = useAuth();
  const { incomingCall, acceptCall, rejectCall } = useCall();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'hr';

  const navItems = [
    { name: 'Dashboard', path: '/portal/dashboard', icon: LayoutDashboard },
    { name: 'My Attendance', path: '/portal/attendance', icon: CalendarCheck },
    { name: 'Leave Management', path: '/portal/leaves', icon: CalendarOff },
    { name: 'Meetings', path: '/portal/meetings', icon: Video },
    { name: 'Messages', path: '/portal/chat', icon: MessageSquare },
  ];

  const adminItems = [
    { name: 'Admin Dashboard', path: '/portal/admin/dashboard', icon: Settings },
    { name: 'Employees', path: '/portal/admin/employees', icon: Users },
    { name: 'Company Attendance', path: '/portal/admin/attendance', icon: CalendarCheck },
    { name: 'Leave Approvals', path: '/portal/admin/leaves', icon: CalendarOff },
    { name: 'Government Holidays', path: '/portal/admin/holidays', icon: Calendar },
    { name: 'Payroll & Salary', path: '/portal/admin/payroll', icon: IndianRupee },
    { name: '← Back to My Portal', path: '/portal/dashboard', icon: LayoutDashboard },
  ];

  const isAdminRoute = location.pathname.startsWith('/portal/admin');

  const NavLinks = ({ items }: { items: any[] }) => (
    <>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              isActive 
                ? 'bg-gradient-to-r from-[#7C3AED]/20 to-[#9333EA]/20 text-[#e879f9] border border-[#e879f9]/20' 
                : 'text-[#cbd5e1] hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-[#0C0E2B] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0C0E2B]/90 backdrop-blur-md sticky top-0 z-40">
        <img src="/logo.png" alt="InSpark" className="h-10 rounded-lg" />
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-72 bg-[#0C0E2B] border-r border-white/10 p-4 
        flex flex-col transition-transform duration-300 z-50 overflow-y-auto
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:block mb-8 mt-2 px-4">
          <img src="/logo.png" alt="InSpark" className="h-12 rounded-xl" />
        </div>

        <div className="flex-1 space-y-6">
          {!isAdminRoute && (
            <div className="space-y-1">
              <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">My Portal</div>
              <NavLinks items={navItems} />
            </div>
          )}

          {isAdmin && (
            <div className="space-y-1">
              <div className="px-4 text-xs font-semibold text-[#e879f9] uppercase tracking-wider mb-2">Administration</div>
              <NavLinks items={adminItems} />
            </div>
          )}
        </div>

        <div className="mt-8 pt-4 border-t border-white/10">
          <div className="px-4 py-3 flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white font-bold">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{profile?.full_name}</div>
              <div className="text-xs text-gray-400 truncate capitalize">{profile?.role}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#7C3AED]/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a1b3b] border border-white/10 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-gradient-to-tr from-[#7C3AED] to-[#9333EA] rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-purple-500/20 relative">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500 animate-ping opacity-75"></div>
              <PhoneIncoming size={40} className="text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Incoming {incomingCall.type === 'video' ? 'Video' : 'Audio'} Call</h2>
            <p className="text-gray-400 mb-8">{incomingCall.callerName} is calling you...</p>
            
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={rejectCall}
                className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 shadow-lg shadow-red-500/20"
                title="Decline"
              >
                <PhoneOff size={24} />
              </button>
              <button
                onClick={acceptCall}
                className="w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 shadow-lg shadow-green-500/20 animate-pulse"
                title="Accept"
              >
                {incomingCall.type === 'video' ? <Video size={28} /> : <Phone size={28} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
