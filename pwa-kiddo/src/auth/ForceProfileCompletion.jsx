
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ForceProfileCompletion({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return null;

    if (user && user.first_login) {
        return <Navigate to="/first-login" state={{ from: location }} replace />;
    }

    return children;
}
