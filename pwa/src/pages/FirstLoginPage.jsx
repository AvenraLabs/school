import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Alert,
  Box,
  Button,
  TextField,
  Stack,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  IconButton,
  Chip,
  InputAdornment,
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

  // Password visibility state
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isStudent = user?.role === "student";
  const isTeacher = user?.role === "teacher";
  const steps = isStudent ? STUDENT_STEPS : isTeacher ? TEACHER_STEPS : [];

  const [formData, setFormData] = useState({
    // Security
    new_password: "",
    confirm_password: "",

    // Personal
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

    // Teacher Professional
    qualification: "",
    experience: "",
  });

  // Check if user is on first login
  useEffect(() => {
    if (user && !user.first_login) {
      navigate(-1);
    }
  }, [user, navigate]);

  function handleInputChange(field, value) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setError(null);
      setUploading(true);

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`);
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
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
    if (previewUrl) {
      revokeImagePreview(previewUrl);
    }
    setPreviewUrl(null);
    setAvatarFile(null);
    setAvatarUrl(null);
  }

  async function handleNext() {
    setError(null);

    if (activeStep === 0) {
      if (user?.must_change_password || formData.new_password) {
        if (!formData.new_password || formData.new_password.length < 6) {
          setError("New password is required and must be at least 6 characters long.");
          return;
        }
        if (formData.new_password !== formData.confirm_password) {
          setError("Passwords do not match.");
          return;
        }
        if (user?.username && formData.new_password === `${user.username}@123`) {
          setError("New password must be different from your default password.");
          return;
        }
      }
    }

    if (activeStep === steps.length - 1) {
      await handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  }

  function handleBack() {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
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

      if (avatarUrl) {
        submitData.avatar_url = avatarUrl;
      }

      // Remove empty/undefined fields
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === "" || submitData[key] === null || submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      const response = await completeProfileApi(submitData);

      // Update session with new token (first_login is now false inside it)
      if (response.data && response.data.token) {
        login(response.data.token, response.data.refreshToken);
      }

      // Navigate directly to approval-pending since profile is submitted for approval
      // after first completion. This avoids the "/" → login → dashboard → ForceProfileCompletion loop.
      navigate("/approval-pending", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  const currentAvatarUrl = previewUrl || avatarUrl;
  const hasAvatar = Boolean(currentAvatarUrl);

  // Password match state
  const passwordsMatch =
    formData.new_password &&
    formData.confirm_password &&
    formData.new_password === formData.confirm_password;
  const passwordsMismatch =
    formData.confirm_password && formData.new_password !== formData.confirm_password;

  return (
    <Container maxWidth="sm" sx={{ px: { xs: 1.5, sm: 2 } }}>
      <Box sx={{ py: { xs: 2, sm: 4 } }}>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 2.5, fontWeight: 700, fontSize: { xs: 16, sm: 18 } }}>
            Complete Your Profile
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: 12 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Horizontal Stepper for Desktop */}
          <Stepper
            activeStep={activeStep}
            sx={{ mb: 3, display: { xs: "none", sm: "flex" } }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  slotProps={{ label: { style: { fontSize: 12 } } }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Compact inline step indicator for Mobile */}
          <Box
            sx={{
              display: { xs: "flex", sm: "none" },
              alignItems: "center",
              gap: 1,
              mb: 2.5,
              flexWrap: "wrap",
            }}
          >
            {steps.map((label, idx) => (
              <Box
                key={label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    bgcolor: idx < activeStep ? "success.main" : idx === activeStep ? "primary.main" : "grey.300",
                    color: idx <= activeStep ? "white" : "text.secondary",
                  }}
                >
                  {idx < activeStep ? "✓" : idx + 1}
                </Box>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: idx === activeStep ? 700 : 400,
                    color: idx === activeStep ? "primary.main" : "text.secondary",
                  }}
                >
                  {label}
                </Typography>
                {idx < steps.length - 1 && (
                  <Typography sx={{ fontSize: 11, color: "grey.400" }}>›</Typography>
                )}
              </Box>
            ))}
          </Box>

          <Stack spacing={2}>
            {/* Security Step */}
            {activeStep === 0 && (
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13 }}>
                  Set Account Password
                </Typography>
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
                        <IconButton
                          size="small"
                          onClick={() => setShowNewPassword((v) => !v)}
                          edge="end"
                          tabIndex={-1}
                        >
                          {showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ style: { fontSize: 13 } }}
                  InputLabelProps={{ style: { fontSize: 13 } }}
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
                    passwordsMismatch
                      ? "Passwords do not match"
                      : passwordsMatch
                      ? "Passwords match ✓"
                      : ""
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
                          <IconButton
                            size="small"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            edge="end"
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{ style: { fontSize: 13 } }}
                  InputLabelProps={{ style: { fontSize: 13 } }}
                />
              </Stack>
            )}

            {/* Personal Step */}
            {activeStep === 1 && (
              <Stack spacing={1.5}>
                {/* Avatar Upload */}
                <Box sx={{ textAlign: "center" }}>
                  <Box position="relative" display="inline-block">
                    <Avatar
                      src={currentAvatarUrl}
                      sx={{
                        width: 90,
                        height: 90,
                        mx: "auto",
                        mb: 1.5,
                        border: 2,
                        borderColor: "primary.main",
                        borderStyle: uploading ? "dashed" : "solid",
                      }}
                    />
                    {uploading && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        sx={{ transform: "translate(-50%, -60%)" }}
                      >
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
                      <input
                        hidden
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleAvatarChange}
                      />
                    </Button>

                    {hasAvatar && (
                      <IconButton
                        type="button"
                        onClick={handleAvatarDelete}
                        disabled={uploading}
                        color="error"
                        size="small"
                      >
                        <Delete sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 0.5 }}>
                    <Chip label="Max 5MB" size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                    <Chip label="JPEG, PNG, WebP" size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                  </Stack>
                </Box>

                <TextField
                  size="small"
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  fullWidth
                  required
                  inputProps={{ style: { fontSize: 13 } }}
                  InputLabelProps={{ style: { fontSize: 13 } }}
                />

                <TextField
                  size="small"
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true, style: { fontSize: 13 } }}
                  inputProps={{ style: { fontSize: 13 } }}
                />

                <TextField
                  select
                  size="small"
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  fullWidth
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true, style: { fontSize: 13 } }}
                  inputProps={{ style: { fontSize: 13 } }}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </TextField>

                <TextField
                  size="small"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  fullWidth
                  inputProps={{ style: { fontSize: 13 } }}
                  InputLabelProps={{ style: { fontSize: 13 } }}
                />

                <TextField
                  size="small"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  fullWidth
                  inputProps={{ style: { fontSize: 13 } }}
                  InputLabelProps={{ style: { fontSize: 13 } }}
                />
              </Stack>
            )}

            {/* Student Family Info */}
            {isStudent && activeStep === 2 && (
              <Stack spacing={1.5}>
                <TextField
                  size="small"
                  label="Father's Name"
                  value={formData.father_name}
                  onChange={(e) => handleInputChange("father_name", e.target.value)}
                  fullWidth
                  inputProps={{ style: { fontSize: 13 } }}
                  InputLabelProps={{ style: { fontSize: 13 } }}
                />
                <TextField
                  size="small"
                  label="Mother's Name"
                  value={formData.mother_name}
                  onChange={(e) => handleInputChange("mother_name", e.target.value)}
                  fullWidth
                  inputProps={{ style: { fontSize: 13 } }}
                  InputLabelProps={{ style: { fontSize: 13 } }}
                />
                <TextField
                  size="small"
                  label="Guardian Name (if applicable)"
                  value={formData.guardian_name}
                  onChange={(e) => handleInputChange("guardian_name", e.target.value)}
                  fullWidth
                  inputProps={{ style: { fontSize: 13 } }}
                  InputLabelProps={{ style: { fontSize: 13 } }}
                />
              </Stack>
            )}

            {/* Student Contact Info */}
            {isStudent && activeStep === 3 && (
              <Stack spacing={1.5}>
                <TextField
                  size="small"
                  label="Emergency Contact Number"
                  value={formData.emergency_contact}
                  onChange={(e) => handleInputChange("emergency_contact", e.target.value)}
                  fullWidth
                  required
                  inputProps={{ style: { fontSize: 13 } }}
                  InputLabelProps={{ style: { fontSize: 13 } }}
                />
                <TextField
                  select
                  size="small"
                  label="Residential Status"
                  value={formData.residential_status}
                  onChange={(e) => handleInputChange("residential_status", e.target.value)}
                  fullWidth
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true, style: { fontSize: 13 } }}
                  inputProps={{ style: { fontSize: 13 } }}
                >
                  <option value="dayscholar">Day Scholar</option>
                  <option value="hosteler">Hosteler</option>
                </TextField>
                <TextField
                  size="small"
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  inputProps={{ style: { fontSize: 13 } }}
                  InputLabelProps={{ style: { fontSize: 13 } }}
                />
                <Alert severity="info" sx={{ fontSize: 11, py: 0.5 }}>
                  Your teacher will need to approve this profile before you can access all features.
                </Alert>
              </Stack>
            )}

            {/* Teacher Professional Info — only qualification and experience */}
            {isTeacher && activeStep === 2 && (
              <Stack spacing={1.5}>
                <TextField
                  size="small"
                  label="Qualification"
                  value={formData.qualification}
                  onChange={(e) => handleInputChange("qualification", e.target.value)}
                  fullWidth
                  inputProps={{ style: { fontSize: 13 } }}
                  InputLabelProps={{ style: { fontSize: 13 } }}
                />
                <TextField
                  size="small"
                  label="Years of Experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  fullWidth
                  inputProps={{ style: { fontSize: 13 }, min: 0 }}
                  InputLabelProps={{ style: { fontSize: 13 } }}
                />
                <Alert severity="info" sx={{ fontSize: 11, py: 0.5 }}>
                  Your school admin will need to approve this profile before you can start teaching.
                </Alert>
              </Stack>
            )}
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || loading || uploading}
              fullWidth
              size="small"
              sx={{ fontSize: 13 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading || uploading}
              fullWidth
              size="small"
              sx={{ fontSize: 13 }}
            >
              {loading ? (
                <CircularProgress size={20} />
              ) : activeStep === steps.length - 1 ? (
                "Complete"
              ) : (
                "Next"
              )}
            </Button>
          </Stack>

          <Button
            onClick={async () => {
              const nextUser = await logout();
              if (nextUser) {
                let basePath = "/student";
                if (nextUser.role === "teacher") basePath = "/teacher";
                else if (nextUser.role === "driver") basePath = "/driver";
                window.location.href = `${basePath}/dashboard`;
              } else {
                window.location.href = "/login";
              }
            }}
            fullWidth
            variant="text"
            size="small"
            sx={{ mt: 1, fontSize: 12 }}
            disabled={loading || uploading}
          >
            Logout
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
