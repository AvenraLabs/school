import { Box, Container, Stack, Typography, Button } from "@mui/material";
import { HourglassTopRounded } from "@mui/icons-material";
import { useAuth } from "../auth/AuthProvider";
import { useEffect, useState } from "react";
import { getMyProfile } from "../modules/profile/profile.api";
import { useNavigate } from "react-router-dom";

export default function ApprovalPending() {
  const { user, logout, updateUser } = useAuth();
  const [checking, setChecking] = useState(false);
  const navigate = useNavigate();

  const checkStatus = async () => {
    if (!user?.role) return;
    try {
      setChecking(true);
      const res = await getMyProfile(user.role);
      const status = res?.data?.approval_status;
      if (status === "approved") {
        // Update global context FIRST so RequireApproval re-renders with approved status
        // before we navigate — prevents the redirect loop
        updateUser({ approval_status: "approved" });
        navigate(`/${user.role}/dashboard`, { replace: true });
      }
    } catch (err) {
      console.error("Failed to re-check approval status:", err);
    } finally {
      setChecking(false);
    }
  };

  // Check once on mount in case status was already updated while the page was open
  useEffect(() => {
    checkStatus();
  }, []); // Only once — no repeated polling

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        py: { xs: 6, sm: 8 },
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: "warning.light",
              color: "warning.dark",
            }}
          >
            <HourglassTopRounded sx={{ fontSize: 36 }} />
          </Box>

          <Stack spacing={1}>
            <Typography variant="h5" fontWeight={700}>
              Approval Pending
            </Typography>
            <Typography color="text.secondary">
              {user?.role
                ? `Your ${user.role.replace("_", " ")} account is waiting for approval.`
                : "Your account is waiting for approval."}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please contact your school admin. You can still complete your
              profile if needed.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
            <Button
              variant="outlined"
              onClick={checkStatus}
              disabled={checking}
            >
              {checking ? "Checking..." : "Check Again"}
            </Button>
            {user?.role && (
              <Button
                variant="contained"
                onClick={() => navigate(`/${user.role}/profile`)}
              >
                Complete Profile
              </Button>
            )}
            <Button variant="contained" color="warning" onClick={logout}>
              Logout
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
