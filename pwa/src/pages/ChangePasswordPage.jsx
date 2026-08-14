import React, { useState } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useProfileCompletion } from "../auth/useProfileCompletion";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  LockOutlined,
  Visibility,
  VisibilityOff,
  Security,
  ErrorOutline,
} from "@mui/icons-material";

export function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const { completeProfile, loading, error, clearError } = useProfileCompletion();
  const navigate = useNavigate();
  const location = useLocation();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState("");

  const getTargetRoute = () => {
    if (location.state?.from?.pathname) return location.state.from.pathname;
    if (user?.role === "teacher") return "/teacher";
    if (user?.role === "student") return "/student";
    if (user?.role === "driver") return "/driver";
    return "/";
  };

  if (user && !user.must_change_password && !user.first_login) {
    return <Navigate to={getTargetRoute()} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError("");
    clearError();

    if (!newPassword || newPassword.length < 6) {
      setClientError("Password must be at least 6 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setClientError("Passwords do not match");
      return;
    }

    if (user?.username && newPassword === `${user.username}@123`) {
      setClientError("New password must be different from your default password");
      return;
    }

    try {
      await completeProfile({ new_password: newPassword });
      navigate(getTargetRoute(), { replace: true });
    } catch {
      // Handled via error state
    }
  };

  return (
    <Container maxWidth="xs" sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", py: 4 }}>
      <Paper sx={{ p: 4, width: "100%", borderRadius: 3, boxShadow: 2 }}>
        <Box sx={{ textCenter: "center", mb: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Box sx={{ w: 48, h: 48, borderRadius: "50%", bgcolor: "primary.light", color: "primary.main", display: "flex", alignItems: "center", justifyContent: "center", p: 1.5, mb: 1.5 }}>
            <LockOutlined sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h6" fontWeight={700} color="#14213D" align="center">
            Set New Password
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 0.5, fontSize: "0.8rem" }}>
            Your password was recently reset or set to a default value. Please choose a secure new password to continue.
          </Typography>
        </Box>

        {user?.role === "student" && (
          <Alert severity="warning" icon={<Security />} sx={{ mb: 2, fontSize: "0.75rem" }}>
            <strong>Note for Students:</strong> This login is shared with your parent — make sure they know the new password too.
          </Alert>
        )}

        {(clientError || error) && (
          <Alert severity="error" icon={<ErrorOutline />} sx={{ mb: 2, fontSize: "0.75rem" }}>
            {clientError || error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="New Password"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            size="small"
            label="Confirm New Password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 1, py: 1.2, fontWeight: 700, textTransform: "none", bgcolor: "#2F6F5E", "&:hover": { bgcolor: "#245749" } }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Update Password & Proceed"}
          </Button>

          <Button
            onClick={async () => {
              await logout();
              navigate("/login", { replace: true });
            }}
            fullWidth
            variant="text"
            size="small"
            sx={{ mt: 0.5, textTransform: "none", color: "text.secondary", fontSize: 13 }}
            disabled={loading}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ChangePasswordPage;
