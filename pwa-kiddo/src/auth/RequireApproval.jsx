import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getMyProfile } from "../modules/profile/profile.api";

const APPROVAL_ROLES = ["student", "teacher", "parent"];

export default function RequireApproval({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(true);

  const shouldCheck = useMemo(() => {
    return user?.role && APPROVAL_ROLES.includes(user.role);
  }, [user?.role]);

  useEffect(() => {
    let isMounted = true;

    async function fetchApprovalStatus() {
      if (!shouldCheck) {
        if (isMounted) setChecking(false);
        return;
      }

      try {
        setChecking(true);
        const res = await getMyProfile(user.role);
        const data = res?.data || {};
        const approvalStatus = data?.approval_status || null;

        if (isMounted) {
          setStatus(approvalStatus);
        }
      } catch (err) {
        console.error("Failed to fetch approval status:", err);
        if (isMounted) {
          setStatus(null);
        }
      } finally {
        if (isMounted) {
          setChecking(false);
        }
      }
    }

    fetchApprovalStatus();

    return () => {
      isMounted = false;
    };
  }, [shouldCheck, user?.role]);

  if (loading || checking) return null;

  if (status && status !== "approved") {
    const roleProfilePath = user?.role ? `/${user.role}/profile` : null;
    const isProfileRoute = roleProfilePath
      ? location.pathname.startsWith(roleProfilePath)
      : false;

    if (!isProfileRoute) {
      return (
        <Navigate to="/approval-pending" state={{ from: location }} replace />
      );
    }
  }

  return children;
}
