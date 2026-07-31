import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/Layout/DashboardLayout';
import { LoginPage } from './pages/Login/LoginPage';

// Super Admin Pages
import { SuperAdminPage } from './pages/SuperAdmin/SuperAdminPage';
import { SuperAdminSchoolSettings } from './pages/SuperAdmin/SuperAdminSchoolSettings';
import { SuperAdminBillingLogs } from './pages/SuperAdmin/SuperAdminBillingLogs';
import { SuperAdminAiAnalytics } from './pages/SuperAdmin/SuperAdminAiAnalytics';
import { FeedbackManager } from './pages/SuperAdmin/FeedbackManager';

// School Admin Pages
import { SchoolAdminDashboard } from './pages/SchoolAdmin/Dashboard';
import { SchoolAnalyticsPage } from './pages/SchoolAdmin/SchoolAnalyticsPage';
import { BulkSeeder } from './pages/SchoolAdmin/BulkSeeder';
import { ClassesManager } from './pages/SchoolAdmin/ClassesManager';
import { SubjectsManager } from './pages/SchoolAdmin/SubjectsManager';
import { SubjectPeriodsManager } from './pages/SchoolAdmin/SubjectPeriodsManager';
import { TeachersManager } from './pages/SchoolAdmin/TeachersManager';
import { StudentsManager } from './pages/SchoolAdmin/StudentsManager';
import { LoginRoster } from './pages/SchoolAdmin/LoginRoster';
import { Approvals } from './pages/SchoolAdmin/Approvals';
import { TeacherAssignments } from './pages/SchoolAdmin/TeacherAssignments';
import { Timetables } from './pages/SchoolAdmin/Timetables';
import { BellSchedulesManager } from './pages/SchoolAdmin/BellSchedulesManager';
import { SubstituteTeachers } from './pages/SchoolAdmin/SubstituteTeachers';
import { TimetableModule } from './pages/SchoolAdmin/TimetableModule';
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
import { StyleGuidePage } from './pages/SchoolAdmin/StyleGuidePage';

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

            {/* Super Admin */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/super-admin" element={<SuperAdminPage />} />
              <Route path="/super-admin/settings" element={<SuperAdminSchoolSettings />} />
              <Route path="/super-admin/billing" element={<SuperAdminBillingLogs />} />
              <Route path="/super-admin/feedback" element={<FeedbackManager />} />
              <Route path="/super-admin/ai-analytics" element={<SuperAdminAiAnalytics />} />
              <Route path="/super-admin/classes" element={<ClassesManager />} />
              <Route path="/super-admin/seeder" element={<BulkSeeder />} />
            </Route>
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
              <Route path="/admin/subject-periods" element={<SubjectPeriodsManager />} />
              <Route path="/admin/teachers" element={<TeachersManager />} />
              <Route path="/admin/students" element={<StudentsManager />} />
              <Route path="/admin/login-roster" element={<LoginRoster />} />
              <Route path="/admin/approvals" element={<Approvals />} />
              <Route path="/admin/assignments" element={<TeacherAssignments />} />
              <Route path="/admin/timetables" element={<Timetables />} />
              <Route path="/admin/bell-schedules" element={<BellSchedulesManager />} />
              <Route path="/admin/timetables/substitutions" element={<SubstituteTeachers />} />
              <Route path="/admin/timetable-hub" element={<TimetableModule />} />
              <Route path="/admin/transport" element={<TransportManager />} />
              <Route path="/admin/notifications" element={<Notifications />} />
              <Route path="/admin/exams" element={<ExamsManager />} />
              <Route path="/admin/academic-year" element={<AcademicYearManager />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/lost-found" element={<LostFoundManager />} />
              <Route path="/admin/feedback" element={<FeedbackSubmit />} />
              <Route path="/admin/library" element={<LibraryManager />} />
              <Route path="/admin/style-guide" element={<StyleGuidePage />} />
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
