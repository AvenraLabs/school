import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const APPROVAL_ROLES = ["student", "teacher"];

/**
 * RequireApproval guards routes that need an approved account.
 *
 * Strategy:
 * - approval_status is hydrated into AuthProvider's user context during profile fetch
 * - We read it directly from `user.approval_status` — no separate API call
 * - This eliminates the redirect loop: when ApprovalPending calls updateUser({ approval_status: 'approved' }),
 *   this component re-renders immediately and lets the route through
 */
export default function RequireApproval({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // While auth is initializing, render nothing
  if (loading) return null;

  const shouldCheck = user?.role && APPROVAL_ROLES.includes(user.role);

  if (shouldCheck) {
    const status = user.approval_status;

    // If we have a status and it's not approved → redirect
    if (status && status !== "approved") {
      const roleProfilePath = user.role ? `/${user.role}/profile` : null;
      const isProfileRoute = roleProfilePath
        ? location.pathname.startsWith(roleProfilePath)
        : false;

      if (!isProfileRoute) {
        return (
          <Navigate to="/approval-pending" state={{ from: location }} replace />
        );
      }
    }
  }

  return children;
}
