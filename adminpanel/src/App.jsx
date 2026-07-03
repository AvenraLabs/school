import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { LoginPage } from './pages/Login/LoginPage';

// Super Admin Pages
import { SuperAdminDashboard } from './pages/SuperAdmin/Dashboard';
import { SchoolManagement } from './pages/SuperAdmin/SchoolManagement';
import { AIAnalytics } from './pages/SuperAdmin/AIAnalytics';
import { TokenManagement } from './pages/SuperAdmin/TokenManagement';

// School Admin Pages
import { SchoolAdminDashboard } from './pages/SchoolAdmin/Dashboard';
import { BulkSeeder } from './pages/SchoolAdmin/BulkSeeder';
import { ClassesManager } from './pages/SchoolAdmin/ClassesManager';
import { SubjectsManager } from './pages/SchoolAdmin/SubjectsManager';
import { TeachersManager } from './pages/SchoolAdmin/TeachersManager';
import { StudentsManager } from './pages/SchoolAdmin/StudentsManager';
import { FamilyManager } from './pages/SchoolAdmin/FamilyManager';
import { LoginRoster } from './pages/SchoolAdmin/LoginRoster';
import { Approvals } from './pages/SchoolAdmin/Approvals';
import { TeacherAssignments } from './pages/SchoolAdmin/TeacherAssignments';
import { Timetables } from './pages/SchoolAdmin/Timetables';
import { Notifications } from './pages/SchoolAdmin/Notifications';
import { ExamsManager } from './pages/SchoolAdmin/ExamsManager';
import { ReportCards } from './pages/SchoolAdmin/ReportCards';
import { AuditLogs } from './pages/SchoolAdmin/AuditLogs';
import { SchoolRegistry } from './pages/SchoolAdmin/SchoolRegistry';
import { TransportManager } from './pages/SchoolAdmin/TransportManager';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Super Admin */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/schools" element={<SchoolManagement />} />
              <Route path="/super-admin/analytics" element={<AIAnalytics />} />
              <Route path="/super-admin/tokens" element={<TokenManagement />} />
            </Route>

            {/* School Admin */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<SchoolAdminDashboard />} />
              <Route path="/admin/directory" element={<SchoolRegistry />} />
              <Route path="/admin/bulk-seeder" element={<BulkSeeder />} />
              <Route path="/admin/classes" element={<ClassesManager />} />
              <Route path="/admin/subjects" element={<SubjectsManager />} />
              <Route path="/admin/teachers" element={<TeachersManager />} />
              <Route path="/admin/students" element={<StudentsManager />} />
              <Route path="/admin/families" element={<FamilyManager />} />
              <Route path="/admin/login-roster" element={<LoginRoster />} />
              <Route path="/admin/approvals" element={<Approvals />} />
              <Route path="/admin/assignments" element={<TeacherAssignments />} />
              <Route path="/admin/timetables" element={<Timetables />} />
              <Route path="/admin/transport" element={<TransportManager />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/exams" element={<ExamsManager />} />
              <Route path="/admin/report-cards" element={<ReportCards />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
            </Route>

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
