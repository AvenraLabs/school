import { useAuth } from "../auth/AuthProvider";
import FirstLoginPage from "./FirstLoginPage";
import ChangePasswordPage from "./ChangePasswordPage";

export function ProtectedAppWrapper({ children }) {
  const { user } = useAuth();

  // If must change password but already completed profile
  if (user && user.must_change_password && !user.first_login) {
    return <ChangePasswordPage />;
  }

  // If first login, show profile completion wizard
  if (user && user.first_login) {
    return <FirstLoginPage />;
  }

  return children;
}
