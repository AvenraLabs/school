import { useState, useEffect, useRef } from "react";
import {
  Paper,
  Alert,
  Box,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Avatar,
  IconButton,
  Chip,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import {
  PhotoCamera,
  Delete,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { completeProfileApi, uploadProfilePicture } from "../modules/profile/profile.api";
import { createImagePreview, revokeImagePreview } from "../utils/imageUtils";

const STUDENT_STEPS = ["Security", "Personal", "Family", "Contact"];
const TEACHER_STEPS = ["Security", "Personal", "Professional"];

export default function FirstLoginPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Track successful submission so the useEffect doesn't navigate(-1) after login() updates user
  const submittedRef = useRef(false);

  const isStudent = user?.role === "student";
  const isTeacher = user?.role === "teacher";
  const steps = isStudent ? STUDENT_STEPS : isTeacher ? TEACHER_STEPS : [];

  const [formData, setFormData] = useState({
    new_password: "",
    confirm_password: "",
    name: user?.name || "",
    dob: "",
    gender: "",
    phone: "",
    email: "",
    father_name: "",
    mother_name: "",
    guardian_name: "",
    emergency_contact: "",
    address: "",
    residential_status: "dayscholar",
    qualification: "",
    experience: "",
  });

  // Guard: if user already completed first login AND we haven't just submitted, redirect away
  useEffect(() => {
    if (user && !user.first_login && !submittedRef.current) {
      navigate(-1);
    }
  }, [user, navigate]);

  function handleInputChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setError(null);
      setUploading(true);

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Invalid file type. Allowed: JPEG, PNG, WebP");
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size too large. Maximum size: 5MB");
      }

      const preview = createImagePreview(file);
      setPreviewUrl(preview);
      setAvatarFile(file);

      const uploadedUrl = await uploadProfilePicture(file, user.id);
      setAvatarUrl(uploadedUrl);

      revokeImagePreview(preview);
      setPreviewUrl(null);
    } catch (uploadError) {
      setError(`Avatar upload failed: ${uploadError.message}`);
      if (previewUrl) {
        revokeImagePreview(previewUrl);
        setPreviewUrl(null);
      }
      setAvatarFile(null);
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  }

  function handleAvatarDelete() {
    if (previewUrl) revokeImagePreview(previewUrl);
    setPreviewUrl(null);
    setAvatarFile(null);
    setAvatarUrl(null);
  }

  async function handleNext() {
    setError(null);

    // Validate password step
    if (activeStep === 0) {
      if (!formData.new_password || formData.new_password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (formData.new_password !== formData.confirm_password) {
        setError("Passwords do not match.");
        return;
      }
    }

    if (activeStep === steps.length - 1) {
      await handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  }

  function handleBack() {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,
        role: user?.role,
        experience: formData.experience ? parseInt(formData.experience) : undefined,
      };

      if (avatarUrl) submitData.avatar_url = avatarUrl;

      // Strip empty/undefined fields so the backend doesn't overwrite with nulls
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === "" || submitData[key] === null || submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      const response = await completeProfileApi(submitData);

      // Mark as submitted BEFORE calling login() so the useEffect guard does not fire navigate(-1)
      submittedRef.current = true;

      // Update session with new token (first_login: false, must_change_password: false)
      if (response.data?.token) {
        login(response.data.token, response.data.refreshToken);
      }

      // Navigate directly to approval-pending — avoids the "/" bounce-loop through ForceProfileCompletion
      navigate("/approval-pending", { replace: true });
    } catch (err) {
      submittedRef.current = false;
      setError(err?.response?.data?.message || err?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "background.default" }}>
        <CircularProgress />
      </Box>
    );
  }

  const currentAvatarUrl = previewUrl || avatarUrl;
  const hasAvatar = Boolean(currentAvatarUrl);
  const passwordsMatch =
    formData.new_password && formData.confirm_password && formData.new_password === formData.confirm_password;
  const passwordsMismatch =
    formData.confirm_password && formData.new_password !== formData.confirm_password;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        py: { xs: 2, sm: 4 },
        px: { xs: 1.5, sm: 2 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 480 }}>
        <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: 12 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Step progress — numbered circles only */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 2.5 }}>
            {steps.map((_, idx) => (
              <Box key={idx} sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    bgcolor:
                      idx < activeStep
                        ? "success.main"
                        : idx === activeStep
                        ? "primary.main"
                        : "action.disabledBackground",
                    color: idx <= activeStep ? "primary.contrastText" : "text.disabled",
                    transition: "background-color 0.25s",
                  }}
                >
                  {idx < activeStep ? "✓" : idx + 1}
                </Box>
                {idx < steps.length - 1 && (
                  <Box
                    sx={{
                      width: 32,
                      height: 2,
                      bgcolor: idx < activeStep ? "success.main" : "action.disabledBackground",
                      transition: "background-color 0.25s",
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

          <Stack spacing={2}>

            {/* ── Step 0: Security ── */}
            {activeStep === 0 && (
              <Stack spacing={1.5}>
                {isStudent && (
                  <Alert severity="info" sx={{ fontSize: 11, py: 0.5 }}>
                    This login is shared with your parent — make sure they know the new password too.
                  </Alert>
                )}

                <TextField
                  fullWidth
                  size="small"
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  value={formData.new_password}
                  onChange={(e) => handleInputChange("new_password", e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowNewPassword((v) => !v)} edge="end" tabIndex={-1}>
                          {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirm_password}
                  onChange={(e) => handleInputChange("confirm_password", e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  error={Boolean(passwordsMismatch)}
                  helperText={
                    passwordsMismatch ? "Passwords do not match" : passwordsMatch ? "Passwords match ✓" : ""
                  }
                  FormHelperTextProps={{
                    sx: { color: passwordsMatch ? "success.main" : "error.main", fontSize: 11 },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {formData.confirm_password && (
                            passwordsMatch
                              ? <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
                              : <Cancel sx={{ fontSize: 16, color: "error.main" }} />
                          )}
                          <IconButton size="small" onClick={() => setShowConfirmPassword((v) => !v)} edge="end" tabIndex={-1}>
                            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            )}

            {/* ── Step 1: Personal ── */}
            {activeStep === 1 && (
              <Stack spacing={1.5}>
                {/* Avatar */}
                <Box sx={{ textAlign: "center" }}>
                  <Box position="relative" display="inline-block">
                    <Avatar
                      src={currentAvatarUrl}
                      sx={{
                        width: 90,
                        height: 90,
                        mx: "auto",
                        mb: 1.5,
                        border: "2px solid",
                        borderColor: "primary.main",
                        borderStyle: uploading ? "dashed" : "solid",
                      }}
                    />
                    {uploading && (
                      <Box position="absolute" top="50%" left="50%" sx={{ transform: "translate(-50%, -60%)" }}>
                        <CircularProgress size={20} />
                      </Box>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<PhotoCamera sx={{ fontSize: 14 }} />}
                      disabled={uploading}
                      size="small"
                      sx={{ fontSize: 11 }}
                    >
                      {hasAvatar ? "Change Photo" : "Add Photo"}
                      <input hidden type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleAvatarChange} />
                    </Button>
                    {hasAvatar && (
                      <IconButton type="button" onClick={handleAvatarDelete} disabled={uploading} color="error" size="small">
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 0.5 }}>
                    <Chip label="Max 5MB" size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                    <Chip label="JPEG, PNG, WebP" size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                  </Stack>
                </Box>

                <TextField size="small" label="Full Name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} fullWidth required />
                <TextField size="small" label="Date of Birth" type="date" value={formData.dob} onChange={(e) => handleInputChange("dob", e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />

                <TextField
                  select
                  size="small"
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  fullWidth
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>

                <TextField size="small" label="Phone Number" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} fullWidth />
                <TextField size="small" label="Email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} fullWidth />
              </Stack>
            )}

            {/* ── Step 2 (Student): Family ── */}
            {isStudent && activeStep === 2 && (
              <Stack spacing={1.5}>
                <TextField size="small" label="Father's Name" value={formData.father_name} onChange={(e) => handleInputChange("father_name", e.target.value)} fullWidth />
                <TextField size="small" label="Mother's Name" value={formData.mother_name} onChange={(e) => handleInputChange("mother_name", e.target.value)} fullWidth />
                <TextField size="small" label="Guardian Name (if applicable)" value={formData.guardian_name} onChange={(e) => handleInputChange("guardian_name", e.target.value)} fullWidth />
              </Stack>
            )}

            {/* ── Step 3 (Student): Contact ── */}
            {isStudent && activeStep === 3 && (
              <Stack spacing={1.5}>
                <TextField size="small" label="Emergency Contact Number" value={formData.emergency_contact} onChange={(e) => handleInputChange("emergency_contact", e.target.value)} fullWidth required />
                <TextField
                  select
                  size="small"
                  label="Residential Status"
                  value={formData.residential_status}
                  onChange={(e) => handleInputChange("residential_status", e.target.value)}
                  fullWidth
                >
                  <MenuItem value="dayscholar">Day Scholar</MenuItem>
                  <MenuItem value="hosteler">Hosteler</MenuItem>
                </TextField>
                <TextField size="small" label="Address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} fullWidth multiline rows={3} />
                <Alert severity="info" sx={{ fontSize: 11, py: 0.5 }}>
                  Your teacher will need to approve this profile before you can access all features.
                </Alert>
              </Stack>
            )}

            {/* ── Step 2 (Teacher): Professional ── */}
            {isTeacher && activeStep === 2 && (
              <Stack spacing={1.5}>
                <TextField size="small" label="Qualification" value={formData.qualification} onChange={(e) => handleInputChange("qualification", e.target.value)} fullWidth />
                <TextField size="small" label="Years of Experience" type="number" value={formData.experience} onChange={(e) => handleInputChange("experience", e.target.value)} fullWidth inputProps={{ min: 0 }} />
                <Alert severity="info" sx={{ fontSize: 11, py: 0.5 }}>
                  Your school admin will need to approve this profile before you can start teaching.
                </Alert>
              </Stack>
            )}

          </Stack>

          {/* ── Action Buttons ── */}
          <Stack direction="row" spacing={1.5} sx={{ mt: 3 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || loading || uploading}
              fullWidth
              size="small"
              variant="outlined"
              color="inherit"
              sx={{ borderColor: "divider" }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading || uploading}
              fullWidth
              size="small"
              disableElevation
            >
              {loading
                ? <CircularProgress size={18} sx={{ color: "primary.contrastText" }} />
                : activeStep === steps.length - 1 ? "Complete" : "Next"
              }
            </Button>
          </Stack>

          <Button
            onClick={async () => {
              const nextUser = await logout();
              if (nextUser) {
                const basePath = nextUser.role === "teacher" ? "/teacher" : nextUser.role === "driver" ? "/driver" : "/student";
                window.location.href = `${basePath}/dashboard`;
              } else {
                window.location.href = "/login";
              }
            }}
            fullWidth
            variant="text"
            size="small"
            sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}
            disabled={loading || uploading}
          >
            Logout
          </Button>

        </Paper>
      </Box>
    </Box>
  );
}
