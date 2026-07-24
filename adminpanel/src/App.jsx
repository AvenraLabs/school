import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { LoginPage } from './pages/Login/LoginPage';

// Super Admin — single unified page
import { SuperAdminPage } from './pages/SuperAdmin/SuperAdminPage';

// School Admin Pages
import { SchoolAdminDashboard } from './pages/SchoolAdmin/Dashboard';
import { SchoolAnalyticsPage } from './pages/SchoolAdmin/SchoolAnalyticsPage';
import { BulkSeeder } from './pages/SchoolAdmin/BulkSeeder';
import { ClassesManager } from './pages/SchoolAdmin/ClassesManager';
import { SubjectsManager } from './pages/SchoolAdmin/SubjectsManager';
import { TeachersManager } from './pages/SchoolAdmin/TeachersManager';
import { StudentsManager } from './pages/SchoolAdmin/StudentsManager';
import { LoginRoster } from './pages/SchoolAdmin/LoginRoster';
import { Approvals } from './pages/SchoolAdmin/Approvals';
import { TeacherAssignments } from './pages/SchoolAdmin/TeacherAssignments';
import { Timetables } from './pages/SchoolAdmin/Timetables';
import { Notifications } from './pages/SchoolAdmin/Notifications';
import { ExamsManager } from './pages/SchoolAdmin/ExamsManager';
import { AuditLogs } from './pages/SchoolAdmin/AuditLogs';
import { SchoolRegistry } from './pages/SchoolAdmin/SchoolRegistry';
import { TransportManager } from './pages/SchoolAdmin/TransportManager';
import { AcademicYearManager } from './pages/SchoolAdmin/AcademicYearManager';
import { FeeManager } from './pages/SchoolAdmin/Fees';
import { LibraryManager } from './pages/SchoolAdmin/Library';
import PrivacyPolicy from './pages/Public/PrivacyPolicy';

import TermsConditions from './pages/Public/TermsConditions';
import { NotFoundPage } from './pages/Public/NotFoundPage';
import { LostFoundManager } from './pages/SchoolAdmin/LostFoundManager';
import { FeedbackSubmit } from './pages/SchoolAdmin/FeedbackSubmit';
import { AboutAdmin } from './pages/SchoolAdmin/AboutAdmin';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsConditions />} />

            {/* Super Admin — single unified page, no DashboardLayout (has its own top bar) */}
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminPage />
                </ProtectedRoute>
              }
            />
            {/* Redirect any old bookmarked sub-routes */}
            <Route path="/super-admin/*" element={<Navigate to="/super-admin" replace />} />

            {/* School Admin */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['school_admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<SchoolAdminDashboard />} />
              <Route path="/admin/analytics" element={<SchoolAnalyticsPage />} />
              <Route path="/admin/fees" element={<FeeManager />} />
              <Route path="/admin/directory" element={<SchoolRegistry />} />
              <Route path="/admin/bulk-seeder" element={<BulkSeeder />} />
              <Route path="/admin/classes" element={<ClassesManager />} />
              <Route path="/admin/subjects" element={<SubjectsManager />} />
              <Route path="/admin/teachers" element={<TeachersManager />} />
              <Route path="/admin/students" element={<StudentsManager />} />
              <Route path="/admin/login-roster" element={<LoginRoster />} />
              <Route path="/admin/approvals" element={<Approvals />} />
              <Route path="/admin/assignments" element={<TeacherAssignments />} />
              <Route path="/admin/timetables" element={<Timetables />} />
              <Route path="/admin/transport" element={<TransportManager />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/exams" element={<ExamsManager />} />
              <Route path="/admin/academic-year" element={<AcademicYearManager />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/lost-found" element={<LostFoundManager />} />
              <Route path="/admin/feedback" element={<FeedbackSubmit />} />
              <Route path="/admin/library" element={<LibraryManager />} />
              <Route path="/admin/about" element={<AboutAdmin />} />

            </Route>

            {/* Fallback */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
