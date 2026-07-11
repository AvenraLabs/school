import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import { lazy, Suspense, useState, useEffect } from "react";

import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import LoadingScreen from "../components/LoadingScreen";
import { ProtectedAppWrapper } from "./ProtectedAppWrapper";
import StudentSidebar from "../components/StudentSidebar";
import NotFoundPage from "./NotFoundPage";

/* lazy pages */
const DashboardPage = lazy(() =>
  import("../modules/dashboard/DashboardPage")
);
const ProfilePage = lazy(() =>
  import("../modules/profile/ProfilePage")
);
const TimetablePage = lazy(() =>
  import("../modules/timetable/TimetablePage")
);
const AttendancePage = lazy(() =>
  import("../modules/attendance/AttendancePage")
);
const DiaryPage = lazy(() =>
  import("../modules/diary/DiaryPage")
);
const NotificationsPage = lazy(() =>
  import("../modules/notifications/NotificationsPage")
);
const ReportCardPage = lazy(() =>
  import("../modules/report-card/ReportCardPage")
);
const ReportCardsList = lazy(() =>
  import("../modules/report-card/ReportCardsList")
);
const StudentPerformancePage = lazy(() =>
  import("../modules/report-card/pages/StudentPerformancePage")
);
const GroupChatPage = lazy(() =>
  import("../modules/group-chat/GroupChatPage")
);
const GroupChatRoomPage = lazy(() =>
  import("../modules/group-chat/GroupChatRoomPage")
);
const AiChatPage = lazy(() =>
  import("../modules/ai-chat/pages/AiChatPage")
);
const QuizLandingPage = lazy(() =>
  import("../modules/quiz/pages/QuizLandingPage")
);
const SinglePlayerQuizPage = lazy(() =>
  import("../modules/quiz/pages/SinglePlayerQuizPage")
);
const QuizLobbyPage = lazy(() =>
  import("../modules/quiz/pages/QuizLobbyPage")
);
const QuizPlayPage = lazy(() =>
  import("../modules/quiz/pages/QuizPlayPage")
);
const QuizResultPage = lazy(() =>
  import("../modules/quiz/pages/QuizResultPage")
);
const ThemePage = lazy(() =>
  import("../modules/theme/ThemePage")
);
const StudentTransportPage = lazy(() =>
  import("../modules/transport/StudentTransportPage")
);
const LostFoundPage = lazy(() =>
  import("../modules/lost-found/LostFoundPage")
);
const FeedbackPage = lazy(() =>
  import("../modules/feedback/FeedbackPage")
);
const AboutPage = lazy(() =>
  import("../modules/about/AboutPage")
);

export default function StudentApp() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setSidebarOpen(true);
    window.addEventListener("toggle-student-sidebar", handleToggle);
    return () => window.removeEventListener("toggle-student-sidebar", handleToggle);
  }, []);

  return (
    <ProtectedAppWrapper>
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <AppHeader />

        <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <Box sx={{ flex: 1, pb: 7, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Navigate to="dashboard" replace />} />

              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="timetable" element={<TimetablePage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="diary" element={<DiaryPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="report-cards" element={<ReportCardsList />} />
              <Route path="report-cards/:id" element={<ReportCardPage />} />
              <Route path="report-cards/performance" element={<StudentPerformancePage />} />

              <Route path="group-chat" element={<GroupChatPage />} />
              <Route path="group-chat/:id" element={<GroupChatRoomPage />} />

              <Route path="ai-chat" element={<AiChatPage />} />

              <Route path="quiz" element={<QuizLandingPage />} />
              <Route path="quiz/single" element={<SinglePlayerQuizPage />} />
              <Route path="quiz/:id/lobby" element={<QuizLobbyPage />} />
              <Route path="quiz/:id/play" element={<QuizPlayPage />} />
              <Route path="quiz/:id/results" element={<QuizResultPage />} />
              <Route path="themes" element={<ThemePage />} />
              <Route path="transport" element={<StudentTransportPage />} />
              <Route path="lost-found" element={<LostFoundPage />} />
              <Route path="feedback" element={<FeedbackPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Box>

        <BottomNav />
      </Box>
    </ProtectedAppWrapper>
  );
}
