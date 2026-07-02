import { Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import Login from "../pages/Login";
import StudentApp from "../pages/StudentApp";
import TeacherApp from "../pages/TeacherApp";
import ParentApp from "../pages/ParentApp";
import DriverApp from "../pages/DriverApp";
import NotAuthorized from "../pages/NotAuthorized";

import RequireAuth from "../auth/RequireAuth";
import RequireRole from "../auth/RequireRole";

import { useOnlineStatus } from "../hooks/useOnlineStatus";
import OfflinePage from "../pages/OfflinePage";
import FirstLoginPage from "../pages/FirstLoginPage";
import ForceProfileCompletion from "../auth/ForceProfileCompletion";
import RequireApproval from "../auth/RequireApproval";
import ApprovalPending from "../pages/ApprovalPending";

export default function App() {

  const online = useOnlineStatus();

  if (!online) return <OfflinePage />;

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/first-login"
          element={
            <RequireAuth>
              <FirstLoginPage />
            </RequireAuth>
          }
        />

        <Route
          path="/approval-pending"
          element={
            <RequireAuth>
              <ApprovalPending />
            </RequireAuth>
          }
        />

        <Route
          path="/student/*"
          element={
            <RequireAuth>
              <ForceProfileCompletion>
                <RequireRole roles={["student"]}>
                  <RequireApproval>
                    <StudentApp />
                  </RequireApproval>
                </RequireRole>
              </ForceProfileCompletion>
            </RequireAuth>
          }
        />

        <Route
          path="/teacher/*"
          element={
            <RequireAuth>
              <ForceProfileCompletion>
                <RequireRole roles={["teacher"]}>
                  <RequireApproval>
                    <TeacherApp />
                  </RequireApproval>
                </RequireRole>
              </ForceProfileCompletion>
            </RequireAuth>
          }
        />

        <Route
          path="/parent/*"
          element={
            <RequireAuth>
              <ForceProfileCompletion>
                <RequireRole roles={["parent"]}>
                  <RequireApproval>
                    <ParentApp />
                  </RequireApproval>
                </RequireRole>
              </ForceProfileCompletion>
            </RequireAuth>
          }
        />

        <Route
          path="/driver/*"
          element={
            <RequireAuth>
              <ForceProfileCompletion>
                <RequireRole roles={["driver"]}>
                  <DriverApp />
                </RequireRole>
              </ForceProfileCompletion>
            </RequireAuth>
          }
        />

        <Route path="/unauthorized" element={<NotAuthorized />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}
