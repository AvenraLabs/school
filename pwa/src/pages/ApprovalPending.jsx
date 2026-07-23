import { Box, Container, Stack, Typography, Button, Alert } from "@mui/material";
import { HourglassTopRounded, ErrorRounded } from "@mui/icons-material";
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

  const isRejected = user?.approval_status === "rejected";

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
              bgcolor: isRejected ? "error.light" : "warning.light",
              color: isRejected ? "error.dark" : "warning.dark",
            }}
          >
            {isRejected ? (
              <ErrorRounded sx={{ fontSize: 36 }} />
            ) : (
              <HourglassTopRounded sx={{ fontSize: 36 }} />
            )}
          </Box>

          <Stack spacing={2} sx={{ width: "100%" }}>
            <Typography variant="h5" fontWeight={700}>
              {isRejected ? "Registration Rejected" : "Approval Pending"}
            </Typography>
            <Typography color="text.secondary">
              {isRejected
                ? `Your ${user?.role?.replace("_", " ") || "account"} registration was rejected.`
                : user?.role
                ? `Your ${user.role.replace("_", " ")} account is waiting for approval.`
                : "Your account is waiting for approval."}
            </Typography>

            {isRejected && user?.rejection_reason && (
              <Alert severity="error" sx={{ textAlign: "left", borderRadius: "12px" }}>
                <strong>Rejection Reason:</strong> {user.rejection_reason}
              </Alert>
            )}

            <Typography variant="body2" color="text.secondary">
              {isRejected
                ? "Please correct your profile details and resubmit for approval."
                : "Please contact your school admin. You can still complete your profile if needed."}
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
