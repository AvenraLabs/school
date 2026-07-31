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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { PhotoCamera, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { completeProfileApi, uploadProfilePicture } from "../modules/profile/profile.api";
import { createImagePreview, revokeImagePreview } from "../utils/imageUtils";

const STUDENT_STEPS = ["Security", "Personal", "Family", "Contact"];
const TEACHER_STEPS = ["Security", "Personal", "Professional"];

export default function FirstLoginPage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);

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

    // Teacher Professional (if teacher)
    designation: "",
    qualification: "",
    experience: "",
    subject: "",
    joining_date: "",
  });

  // Check if user is on first login
  useEffect(() => {
    if (user && !user.first_login) {
      navigate(-1); // Go back if not first login
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

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error("File size too large. Maximum size: 5MB");
      }

      // Create preview
      const preview = createImagePreview(file);
      setPreviewUrl(preview);
      setAvatarFile(file);

      // Upload the file
      const uploadedUrl = await uploadProfilePicture(file, user.id);
      setAvatarUrl(uploadedUrl);

      // Clean up preview
      revokeImagePreview(preview);
      setPreviewUrl(null);
    } catch (uploadError) {
      setError(`Avatar upload failed: ${uploadError.message}`);
      
      // Clean up on error
      if (previewUrl) {
        revokeImagePreview(previewUrl);
        setPreviewUrl(null);
      }
      setAvatarFile(null);
    } finally {
      setUploading(false);
    }

    // Clear file input
    e.target.value = '';
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

    // Security Step Validation
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
      // Submit form
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
        experience: formData.experience ? parseInt(formData.experience) : 0,
      };

      // Add avatar URL if uploaded
      if (avatarUrl) {
        submitData.avatar_url = avatarUrl;
      }

      // Remove empty fields
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === "" || submitData[key] === null) {
          delete submitData[key];
        }
      });

      const response = await completeProfileApi(submitData);

      // Update session with new token (if provided)
      if (response.data && response.data.token) {
        login(response.data.token, response.data.refreshToken);
      }

      // Profile completed successfully
      navigate("/", { replace: true });
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

  return (
    <Container maxWidth="sm" sx={{ px: { xs: 1.5, sm: 2 } }}>
      <Box sx={{ py: { xs: 2, sm: 4 } }}>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Complete Your Profile
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Horizontal Stepper for Desktop */}
          <Stepper
            activeStep={activeStep}
            sx={{
              mb: 4,
              display: { xs: "none", sm: "flex" }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Vertical Stepper for Mobile */}
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            sx={{
              mb: 4,
              display: { xs: "flex", sm: "none" }
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Stack spacing={3}>
            {/* Security Step */}
            {activeStep === 0 && (
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
                  Set Account Password
                </Typography>
                {isStudent && (
                  <Alert severity="info" sx={{ textTransform: "none" }}>
                    This login is shared with your parent — make sure they know the new password too.
                  </Alert>
                )}
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  value={formData.new_password}
                  onChange={(e) => handleInputChange("new_password", e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                />
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={(e) => handleInputChange("confirm_password", e.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </Stack>
            )}

            {/* Personal Step */}
            {activeStep === 1 && (
              <Stack spacing={2}>
                {/* Avatar Upload Section */}
                <Box sx={{ textAlign: "center" }}>
                  <Box position="relative" display="inline-block">
                    <Avatar
                      src={currentAvatarUrl}
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        mx: "auto", 
                        mb: 2,
                        border: 2,
                        borderColor: 'primary.main',
                        borderStyle: uploading ? 'dashed' : 'solid'
                      }}
                    >
                      {uploading && (
                        <CircularProgress 
                          size={100} 
                          sx={{ 
                            position: 'absolute',
                            color: 'primary.main'
                          }} 
                        />
                      )}
                    </Avatar>
                    
                    {uploading && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        sx={{ transform: 'translate(-50%, -50%)' }}
                      >
                        <CircularProgress size={24} />
                      </Box>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<PhotoCamera />}
                      disabled={uploading}
                      size="small"
                    >
                      {hasAvatar ? 'Change Photo' : 'Add Photo'}
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
                        <Delete />
                      </IconButton>
                    )}
                  </Stack>

                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1 }}>
                    <Chip label="Max 5MB" size="small" variant="outlined" />
                    <Chip label="JPEG, PNG, WebP" size="small" variant="outlined" />
                  </Stack>

                  {uploading && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Uploading image...
                    </Typography>
                  )}
                </Box>

                <TextField
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  label="Date of Birth"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange("dob", e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  select
                  label="Gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  fullWidth
                  SelectProps={{ native: true }}
                  InputLabelProps={{ shrink: true }}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </TextField>

                <TextField
                  label="Phone Number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  fullWidth
                />
              </Stack>
            )}

            {/* Student Family Info */}
            {isStudent && activeStep === 2 && (
              <Stack spacing={2}>
                <TextField
                  label="Father's Name"
                  value={formData.father_name}
                  onChange={(e) => handleInputChange("father_name", e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Mother's Name"
                  value={formData.mother_name}
                  onChange={(e) => handleInputChange("mother_name", e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Guardian Name (if applicable)"
                  value={formData.guardian_name}
                  onChange={(e) => handleInputChange("guardian_name", e.target.value)}
                  fullWidth
                />
              </Stack>
            )}

            {/* Student Contact Info */}
            {isStudent && activeStep === 3 && (
              <Stack spacing={2}>
                <TextField
                  label="Emergency Contact Number"
                  value={formData.emergency_contact}
                  onChange={(e) => handleInputChange("emergency_contact", e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  select
                  label="Residential Status"
                  value={formData.residential_status}
                  onChange={(e) => handleInputChange("residential_status", e.target.value)}
                  fullWidth
                  SelectProps={{ native: true }}
                >
                  <option value="dayscholar">Day Scholar</option>
                  <option value="hosteler">Hosteler</option>
                </TextField>

                <TextField
                  label="Address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                />

                <Alert severity="info">
                  Your teacher will need to approve this profile before you can access all features.
                </Alert>
              </Stack>
            )}

            {/* Teacher Professional Info */}
            {isTeacher && activeStep === 2 && (
              <Stack spacing={2}>
                <TextField
                  label="Designation"
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Qualification"
                  value={formData.qualification}
                  onChange={(e) => handleInputChange("qualification", e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Years of Experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => handleInputChange("experience", e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Subject/Department"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  fullWidth
                />

                <Alert severity="info">
                  Your school admin will need to approve this profile before you can start teaching.
                </Alert>
              </Stack>
            )}
          </Stack>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0 || loading || uploading}
              fullWidth
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading || uploading}
              fullWidth
            >
              {loading ? (
                <CircularProgress size={24} />
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
                if (nextUser.role === "teacher") {
                  basePath = "/teacher";
                } else if (nextUser.role === "driver") {
                  basePath = "/driver";
                }
                window.location.href = `${basePath}/dashboard`;
              } else {
                window.location.href = "/login";
              }
            }}
            fullWidth
            variant="text"
            sx={{ mt: 2 }}
            disabled={loading || uploading}
          >
            Logout
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}
