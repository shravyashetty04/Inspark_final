import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoutes';
import PortalLayout from './components/PortalLayout';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import Attendance from './Attendance';
import LeaveManagement from './LeaveManagement';
import ChangePassword from './ChangePassword';
import Meetings from './Meetings';

// Admin Components
import AdminDashboard from './admin/Dashboard';
import Employees from './admin/Employees';
import CompanyAttendance from './admin/CompanyAttendance';
import LeaveApprovals from './admin/LeaveApprovals';
import Payroll from './admin/Payroll';

export default function PortalApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/portal/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/change-password" element={<ChangePassword />} />
          <Route element={<PortalLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leaves" element={<LeaveManagement />} />
            <Route path="/meetings" element={<Meetings />} />

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/employees" element={<Employees />} />
              <Route path="/admin/attendance" element={<CompanyAttendance />} />
              <Route path="/admin/leaves" element={<LeaveApprovals />} />
              <Route path="/admin/payroll" element={<Payroll />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
