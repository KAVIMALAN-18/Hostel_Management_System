import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import DashboardLayout from './components/layout/DashboardLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import WardenDashboard from './pages/warden/WardenDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import RoomManagement from './pages/admin/RoomManagement';
import HostelView from './pages/admin/HostelView';
import WardenManagement from './pages/admin/WardenManagement';
import MessManagement from './pages/MessManagement';
import MyRoom from './pages/student/MyRoom';
import Complaints from './pages/Complaints';
import Maintenance from './pages/Maintenance';
import Announcements from './pages/Announcements';
import Attendance from './pages/Attendance';
import LeaveManagement from './pages/LeaveManagement';
import StudentDirectory from './pages/StudentDirectory';
import Unauthorized from './pages/Unauthorized';
import FeaturePlaceholder from './pages/FeaturePlaceholder';
import Reports from './pages/Reports';

/**
 * Main App Component
 * Configures professional routing with role-based access control (RBAC)
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Authenticated Application Shell */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'warden', 'student']} />}>
            <Route element={<DashboardLayout />}>

              {/* Common Routes */}
              <Route path="/profile" element={<FeaturePlaceholder title="Profile" subtitle="Manage your account settings." />} />
              <Route path="/notices" element={<Announcements />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/mess-menu" element={<MessManagement />} />
              <Route path="/complaints" element={<Complaints />} />

              {/* Shared Staff Routes (Admin + Warden) */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'warden']} />}>
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/student-directory" element={<StudentDirectory />} />
              </Route>

              {/* Admin-Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/rooms" element={<RoomManagement />} />
                <Route path="/admin/students" element={<StudentManagement />} />
                <Route path="/admin/hostels" element={<HostelView />} />
                <Route path="/staff-management" element={<WardenManagement />} />
                <Route path="/admin/mess" element={<MessManagement />} />
                <Route path="/admin/leave-requests" element={<LeaveManagement />} />
                <Route path="/reports" element={<Reports />} />
              </Route>

              {/* Warden-Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['warden']} />}>
                <Route path="/warden/dashboard" element={<WardenDashboard />} />
                <Route path="/warden/leave-requests" element={<LeaveManagement />} />
              </Route>

              {/* Student-Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/room" element={<MyRoom />} />
                <Route path="/student/leave" element={<StudentDashboard />} />
              </Route>

            </Route>
          </Route>

          {/* Fallback Redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
