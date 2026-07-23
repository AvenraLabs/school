import { useAuth } from "../auth/AuthProvider";
import FirstLoginPage from "./FirstLoginPage";

export function ProtectedAppWrapper({ children }) {
  const { user } = useAuth();

  // If first login, show profile completion
  if (user && user.first_login) {
    return <FirstLoginPage />;
  }

  return children;
}
