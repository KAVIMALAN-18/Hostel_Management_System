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
import BlockManagement from './pages/warden/BlockManagement';
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
          {/* Public Routes - Only accessible when NOT logged in */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Core App Routes (Available to all authenticated users) */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'warden', 'student']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/notices" element={<Announcements />} />
              <Route element={<ProtectedRoute allowedRoles={['admin', 'warden']} />}>
                <Route path="/attendance" element={<Attendance />} />
              </Route>

              {/* Role-Specific Leave Management */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/leave-requests" element={<LeaveManagement />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['warden']} />}>
                <Route path="/warden/leave-requests" element={<LeaveManagement />} />
              </Route>
              <Route path="/mess-menu" element={<MessManagement />} />
              <Route element={<ProtectedRoute allowedRoles={['admin', 'warden']} />}>
                <Route path="/student-directory" element={<StudentDirectory />} />
                <Route path="/reports" element={<Reports />} />
              </Route>
              <Route path="/profile" element={<FeaturePlaceholder title="User Profile" subtitle="Manage your personal information and system credentials." />} />

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/rooms" element={<RoomManagement />} />
                <Route path="/admin/students" element={<StudentManagement />} />
                <Route path="/admin/hostels" element={<HostelView />} />
                <Route element={<ProtectedRoute allowedRoles={['admin', 'warden']} />}>
                  <Route path="/staff-management" element={<WardenManagement />} />
                </Route>
                <Route path="/admin/mess" element={<MessManagement />} />
              </Route>

              {/* Warden Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'warden']} />}>
                <Route path="/warden/dashboard" element={<WardenDashboard />} />
                <Route path="/warden/students" element={<StudentManagement />} />
                <Route path="/warden/block" element={<BlockManagement />} />
              </Route>

              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin', 'warden', 'student']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/room" element={<MyRoom />} />
              </Route>
            </Route>
          </Route>

          {/* Utility Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
