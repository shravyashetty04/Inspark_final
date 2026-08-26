import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0E2B] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#e879f9]"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/portal/login" replace />;
  }

  return <Outlet />;
}

export function AdminRoute() {
  const { profile, loading } = useAuth();

  if (loading) return null; // handled by ProtectedRoute
  
  if (profile?.role !== 'admin' && profile?.role !== 'hr') {
    return <Navigate to="/portal/dashboard" replace />;
  }

  return <Outlet />;
}
