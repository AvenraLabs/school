import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function NotAuthorized() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleGoHome = () => {
    if (user?.role === "student") navigate("/student", { replace: true });
    else if (user?.role === "teacher") navigate("/teacher", { replace: true });
    else if (user?.role === "driver") navigate("/driver", { replace: true });
    else navigate("/login", { replace: true });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
        bgcolor: "#FAFAF8",
      }}
    >
      <Typography variant="h4" fontWeight={800} color="#14213D" gutterBottom>
        Access Denied
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 360 }}>
        You don’t have permission to view this page or your session role does not match.
      </Typography>

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={handleGoHome}
          sx={{
            bgcolor: "#2F6F5E",
            "&:hover": { bgcolor: "#245749" },
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "10px",
            px: 3,
          }}
        >
          {user ? "Go to Dashboard" : "Go to Login"}
        </Button>

        {user && (
          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{
              borderColor: "#E4E1D8",
              color: "#14213D",
              "&:hover": { borderColor: "#14213D", bgcolor: "rgba(0,0,0,0.02)" },
              textTransform: "none",
              fontWeight: 700,
              borderRadius: "10px",
              px: 3,
            }}
          >
            Log Out & Re-login
          </Button>
        )}
      </Stack>
    </Box>
  );
}
