import {
  Container,
  Paper,
  CircularProgress,
  Alert,
  Typography,
  TextField,
  Stack,
  Button,
  Snackbar,
  IconButton,
  Avatar,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import {
  Close,
  Edit,
  VpnKey,
  Email,
  Phone,
  CalendarMonth,
  Wc,
  Bloodtype,
  Home,
  Person,
  Work,
  School,
  Lock,
} from "@mui/icons-material";
import ProfileForm from "./ProfileForm";
import { useProfile } from "./useProfile";
import { useProfileCompletion } from "../../auth/useProfileCompletion";
import { useState } from "react";
import { changePasswordApi } from "../../api/auth.api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { getAssetUrl } from "../../utils/asset";
import dayjs from "dayjs";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    profile,
    loading,
    error,
    saveProfile,
    uploadAvatar,
    deleteAvatar,
    saving,
    uploading,
    clearError,
  } = useProfile();

  const { needsCompletion } = useProfileCompletion();

  // Dialog States
  const [editOpen, setEditOpen] = useState(needsCompletion); // Auto-open if first login
  const [passwordOpen, setPasswordOpen] = useState(false);

  // Password edit states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const basePath =
    user?.role === "student"
      ? "/student"
      : user?.role === "teacher"
        ? "/teacher"
        : "";

  async function handleProfileSubmit(data) {
    try {
      await saveProfile(data);
      setSaveSuccess(true);
      setEditOpen(false); // Close dialog
    } catch (err) {
      // Handled by the hook
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!oldPassword || !newPassword) {
      setPwError("Please fill in all password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters long.");
      return;
    }

    try {
      setPwLoading(true);
      await changePasswordApi({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPwSuccess("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordOpen(false); // Close dialog
        setPwSuccess("");
      }, 1000);
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Failed to update password.";
      setPwError(msg);
    } finally {
      setPwLoading(false);
    }
  }

  if (loading) {
    return (
      <Container sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading profile...
        </Typography>
      </Container>
    );
  }

  const roleLabel = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "";

  return (
    <Container maxWidth="sm" sx={{ mt: 3, pb: 6 }}>
      {/* Success Snackbars */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={2500}
        onClose={() => setSaveSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSaveSuccess(false)} sx={{ borderRadius: "10px" }}>
          Profile saved successfully.
        </Alert>
      </Snackbar>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "12px" }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {profile?.pending_update && (
        profile.pending_update.status === "REJECTED" ? (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>
            <strong>Changes Rejected:</strong> Your previous profile update request was rejected.
            {profile.pending_update.rejection_reason && (
              <span> Reason: <em>{profile.pending_update.rejection_reason}</em></span>
            )}
            . You can edit your profile details and submit again.
          </Alert>
        ) : (
          <Alert severity="warning" sx={{ mb: 2.5, borderRadius: '12px' }}>
            <strong>Changes Pending Approval:</strong> You have submitted updates to your profile. They are currently pending administrator review.
          </Alert>
        )
      )}

      {/* Main Profile Info View (Instagram Style) */}
      {profile && (
        <Stack spacing={3}>
          <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "none" }}>
            {/* Header: Large Avatar on left, stats on right */}
            <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 2.5 }}>
              <Avatar
                src={getAssetUrl(profile.avatar_url)}
                sx={{
                  width: 90,
                  height: 90,
                  border: "2px solid",
                  borderColor: "primary.main",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.05)",
                }}
              >
                {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
              </Avatar>

              <Stack direction="row" justifyContent="space-around" sx={{ flex: 1, textAlign: "center" }}>
                {profile.role === "student" ? (
                  <>
                    <Box>
                      <Typography variant="body1" fontWeight={900} color="text.primary">
                        {profile.class?.class_name || "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Class
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight={900} color="text.primary">
                        {profile.section?.name || "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Section
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body1" fontWeight={900} color="text.primary">
                        {profile.roll_no || "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Roll No
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ width: "100%", pr: 2, textAlign: "right" }}>
                    <Typography variant="body1" fontWeight={900} color="text.primary" noWrap>
                      {profile.designation || "—"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Designation
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Stack>

            {/* Profile Bio / Basic details */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={900} sx={{ fontFamily: "'Outfit', sans-serif" }}>
                {profile.name}
              </Typography>
              <Typography variant="caption" fontWeight={800} color="primary.main" sx={{ display: "inline-block", bgcolor: "primary.light", px: 1, py: 0.2, borderRadius: "5px", mt: 0.5, mb: 1.5, opacity: 0.85 }}>
                {roleLabel}
              </Typography>

              <Stack spacing={1} sx={{ color: "text.secondary" }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Email sx={{ fontSize: 16 }} />
                  <Typography variant="body2">{profile.email || "No email added"}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Phone sx={{ fontSize: 16 }} />
                  <Typography variant="body2">{profile.phone || "No phone added"}</Typography>
                </Stack>
              </Stack>
            </Box>

            {/* Action buttons */}
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Edit />}
                onClick={() => setEditOpen(true)}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 700,
                  boxShadow: "none",
                }}
              >
                Edit Profile
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Lock />}
                onClick={() => setPasswordOpen(true)}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                Password
              </Button>
            </Stack>
          </Paper>

          {/* Detailed Read-Only Cards */}
          <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "none" }}>
            <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 2, fontFamily: "'Outfit', sans-serif" }}>
              Personal Details
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                  <CalendarMonth sx={{ fontSize: 16 }} />
                  <Typography variant="body2">Date of Birth</Typography>
                </Stack>
                <Typography variant="body2" fontWeight="bold">
                  {profile.dob ? dayjs(profile.dob).format("DD-MM-YYYY") : "—"}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                  <Wc sx={{ fontSize: 16 }} />
                  <Typography variant="body2">Gender</Typography>
                </Stack>
                <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "capitalize" }}>
                  {profile.gender || "—"}
                </Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                  <Bloodtype sx={{ fontSize: 16 }} />
                  <Typography variant="body2">Blood Group</Typography>
                </Stack>
                <Typography variant="body2" fontWeight="bold">
                  {profile.blood_group || "—"}
                </Typography>
              </Stack>
              {profile.role === "student" && (
                <>
                  <Divider />
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                      <School sx={{ fontSize: 16 }} />
                      <Typography variant="body2">Residential Status</Typography>
                    </Stack>
                    <Typography variant="body2" fontWeight="bold" sx={{ textTransform: "capitalize" }}>
                      {profile.residential_status === "hosteler" ? "Hosteler" : "Day Scholar"}
                    </Typography>
                  </Stack>
                </>
              )}
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
                  <Home sx={{ fontSize: 16 }} />
                  <Typography variant="body2">Address</Typography>
                </Stack>
                <Typography variant="body2" fontWeight="bold" align="right" sx={{ maxWidth: "60%" }}>
                  {profile.address || "—"}
                </Typography>
              </Stack>
            </Stack>
          </Paper>

          {profile.role === "student" && (
            <Paper sx={{ p: 3, borderRadius: "16px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "none" }}>
              <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 2, fontFamily: "'Outfit', sans-serif" }}>
                Family & Contacts
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Father's Name</Typography>
                  <Typography variant="body2" fontWeight="bold">{profile.father_name || "—"}</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Mother's Name</Typography>
                  <Typography variant="body2" fontWeight="bold">{profile.mother_name || "—"}</Typography>
                </Stack>
                {profile.guardian_name && (
                  <>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">Guardian Name</Typography>
                      <Typography variant="body2" fontWeight="bold">{profile.guardian_name || "—"}</Typography>
                    </Stack>
                  </>
                )}
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Emergency Contact</Typography>
                  <Typography variant="body2" fontWeight="bold">{profile.emergency_contact || "—"}</Typography>
                </Stack>
              </Stack>
            </Paper>
          )}
        </Stack>
      )}

      {/* Edit Profile Dialog Modal */}
      <Dialog
        open={editOpen}
        onClose={() => !saving && setEditOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1, fontFamily: "'Outfit', sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {needsCompletion ? "Complete Your Profile" : "Edit Profile Details"}
          {!needsCompletion && (
            <IconButton size="small" onClick={() => setEditOpen(false)} disabled={saving}>
              <Close />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          {profile && (
            <ProfileForm
              profile={profile}
              onSave={saveProfile}
              onSubmit={handleProfileSubmit}
              onAvatarUpload={uploadAvatar}
              onAvatarDelete={deleteAvatar}
              saving={saving}
              uploading={uploading}
              error={error}
              onClearError={clearError}
              isCompleting={needsCompletion}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog Modal */}
      <Dialog
        open={passwordOpen}
        onClose={() => !pwLoading && setPasswordOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1, fontFamily: "'Outfit', sans-serif", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          Change Password
          <IconButton size="small" onClick={() => setPasswordOpen(false)} disabled={pwLoading}>
            <Close />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleChangePassword}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, py: 1 }}>
            {pwError && (
              <Alert severity="error" sx={{ borderRadius: "10px" }} onClose={() => setPwError("")}>
                {pwError}
              </Alert>
            )}
            {pwSuccess && (
              <Alert severity="success" sx={{ borderRadius: "10px" }} onClose={() => setPwSuccess("")}>
                {pwSuccess}
              </Alert>
            )}

            <TextField
              label="Current Password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              fullWidth
              autoComplete="current-password"
              required
              disabled={pwLoading}
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              autoComplete="new-password"
              helperText="Minimum 6 characters"
              required
              disabled={pwLoading}
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              autoComplete="new-password"
              error={newPassword !== confirmPassword && confirmPassword.length > 0}
              helperText={
                newPassword !== confirmPassword && confirmPassword.length > 0
                  ? "Passwords do not match"
                  : ""
              }
              required
              disabled={pwLoading}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => setPasswordOpen(false)} disabled={pwLoading} sx={{ textTransform: "none", fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={pwLoading || !oldPassword || !newPassword || !confirmPassword}
              sx={{ textTransform: "none", borderRadius: "8px", fontWeight: 700, px: 3 }}
            >
              {pwLoading ? "Updating..." : "Save Password"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Container>
  );
}
