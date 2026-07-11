import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import { lazy, Suspense, useState, useEffect } from "react";

import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import LoadingScreen from "../components/LoadingScreen";
import TeacherSidebar from "../components/TeacherSidebar";
import { ProtectedAppWrapper } from "./ProtectedAppWrapper";
import NotFoundPage from "./NotFoundPage";

/* lazy pages */
const DashboardPage = lazy(() => import("../modules/dashboard/DashboardPage"));
const ProfilePage = lazy(() => import("../modules/profile/ProfilePage"));
const TeacherTimetablePage = lazy(() => import("../modules/teacher-timetable/TeacherTimetablePage"));
const DiaryPage = lazy(() => import("../modules/diary/DiaryPage"));
const NotificationsPage = lazy(() => import("../modules/notifications/NotificationsPage"));
const GroupChatPage = lazy(() => import("../modules/group-chat/GroupChatPage"));
const GroupChatRoomPage = lazy(() => import("../modules/group-chat/GroupChatRoomPage"));
const TeacherAttendancePage = lazy(() => import("../modules/attendance/TeacherAttendancePage"));
const ApprovalsPage = lazy(() => import("../modules/approvals/pages/ApprovalsPage"));
const ExamCreationPage = lazy(() => import("../modules/exams/pages/ExamCreationPage"));
const ExamMarksEntryPage = lazy(() => import("../modules/report-card/pages/ExamMarksEntryPage"));
const TeacherInsightsPage = lazy(() => import("../modules/report-card/pages/TeacherInsightsPage"));
const TeacherAIToolsPage = lazy(() => import("../modules/ai-tools/TeacherAIToolsPage"));
const ThemePage = lazy(() => import("../modules/theme/ThemePage"));
const LostFoundPage = lazy(() => import("../modules/lost-found/LostFoundPage"));
const FeedbackPage = lazy(() => import("../modules/feedback/FeedbackPage"));
const AboutPage = lazy(() => import("../modules/about/AboutPage"));



export default function TeacherApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setSidebarOpen(true);
    window.addEventListener("toggle-teacher-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-teacher-sidebar", handleToggle);
  }, []);

  return (
    <ProtectedAppWrapper>
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <AppHeader />

        <TeacherSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <Box sx={{ flex: 1, pb: 7, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />

              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="timetable" element={<TeacherTimetablePage />} />
              <Route path="diary" element={<DiaryPage />} />
              <Route path="notifications" element={<NotificationsPage />} />

              <Route path="attendance" element={<TeacherAttendancePage />} />
              <Route path="approvals" element={<ApprovalsPage />} />
              <Route path="exams/create" element={<ExamCreationPage />} />
              <Route path="exams/:examId/marks" element={<ExamMarksEntryPage />} />
              <Route path="exams/insights" element={<TeacherInsightsPage />} />
              <Route path="report-cards/entry" element={<Navigate to="../exams/create" replace />} />
              <Route path="ai-tools" element={<TeacherAIToolsPage />} />
              <Route path="themes" element={<ThemePage />} />
              <Route path="lost-found" element={<LostFoundPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="about" element={<AboutPage />} />

              <Route path="group-chat" element={<GroupChatPage />} />
              <Route path="group-chat/:id" element={<GroupChatRoomPage />} />


              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Box>

        <BottomNav />
      </Box>
    </ProtectedAppWrapper>
  );
}
