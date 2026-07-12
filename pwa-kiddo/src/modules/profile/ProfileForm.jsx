import {
  Avatar,
  Box,
  Button,
  TextField,
  Stack,
  CircularProgress,
  Alert,
  IconButton,
  Typography,
} from "@mui/material";
import { PhotoCamera, Delete, CloudUpload } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { useState, useRef } from "react";
import { createImagePreview, revokeImagePreview } from "../../utils/imageUtils";
import DatePickerField from "../../components/DatePickerField";
import { getAssetUrl } from "../../utils/asset";

export default function ProfileForm({
  profile,
  onSave,
  onSubmit,
  onAvatarUpload,
  onAvatarDelete,
  saving,
  uploading,
  error,
  onClearError,
  isCompleting = false,
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: {
      name: profile?.name || "",
      phone: profile?.phone || "",
      email: profile?.email || "",
      dob: profile?.dob || "",
      gender: profile?.gender || "",
      blood_group: profile?.blood_group || "",
      father_name: profile?.father_name || "",
      mother_name: profile?.mother_name || "",
      guardian_name: profile?.guardian_name || "",
      father_occupation: profile?.father_occupation || "",
      mother_occupation: profile?.mother_occupation || "",
      family_income: profile?.family_income || "",
      address: profile?.address || "",
      designation: profile?.designation || "",
      qualification: profile?.qualification || "",
      experience: profile?.experience || "",
      roll_no: profile?.roll_no || "",
    },
  });

  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Clear any previous errors
      if (onClearError) onClearError();

      // Create preview
      const preview = createImagePreview(file);
      setPreviewUrl(preview);

      // Upload the file
      const url = await onAvatarUpload(file);

      // Update profile with new avatar URL
      await onSave({ avatar_url: url });

      // Clean up preview
      revokeImagePreview(preview);
      setPreviewUrl(null);
    } catch (uploadError) {
      // Clean up preview on error
      if (previewUrl) {
        revokeImagePreview(previewUrl);
        setPreviewUrl(null);
      }
      console.error("Avatar upload failed:", uploadError);
    }

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleAvatarDelete() {
    try {
      if (onClearError) onClearError();

      if (onAvatarDelete) {
        await onAvatarDelete();
      } else {
        // Fallback: just clear the avatar URL
        await onSave({ avatar_url: "" });
      }
    } catch (deleteError) {
      console.error("Avatar delete failed:", deleteError);
    }
  }

  async function handleFormSubmit(data) {
    if (onClearError) onClearError();
    const submitHandler = onSubmit || onSave;
    if (submitHandler) {
      await submitHandler(data);
    }
  }

  const currentAvatarUrl = previewUrl || getAssetUrl(profile?.avatar_url);
  const hasAvatar = Boolean(currentAvatarUrl);

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack spacing={3} alignItems="center">
        {/* Error Display */}
        {error && (
          <Alert
            severity="error"
            onClose={onClearError}
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        )}

        {/* Avatar Section */}
        <Box position="relative">
          <Avatar
            src={currentAvatarUrl}
            sx={{
              width: 120,
              height: 120,
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

        {/* Upload Controls */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            type="button"
            component="label"
            variant="outlined"
            startIcon={<PhotoCamera />}
            disabled={uploading || saving}
            size="small"
          >
            {hasAvatar ? 'Change Photo' : 'Add Photo'}
            <input
              ref={fileInputRef}
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
              disabled={uploading || saving}
              color="error"
              size="small"
            >
              <Delete />
            </IconButton>
          )}
        </Stack>

        {/* Upload Info removed (Chip dependency not used elsewhere) */}

        {/* Form Fields */}
        <TextField
          label="Name"
          fullWidth
          required
          error={Boolean(errors.name)}
          helperText={errors.name?.message}
          {...register("name", {
            required: "Name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters"
            },
            maxLength: {
              value: 50,
              message: "Name cannot exceed 50 characters"
            }
          })}
        />

        <TextField
          label="Phone"
          fullWidth
          required
          error={Boolean(errors.phone)}
          helperText={errors.phone?.message}
          {...register("phone", {
            required: "Phone number is required",
            pattern: {
              value: /^[+]?[\d\s\-\(\)]{10,15}$/,
              message: "Please enter a valid phone number"
            }
          })}
        />


        {/* Student Fields */}
        {profile?.role === 'student' && (
          <>
            <Typography variant="subtitle1" sx={{ alignSelf: 'start', fontWeight: 'bold', mt: 1 }}>
              Personal Details
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <TextField
                label="Class"
                fullWidth
                value={profile?.class?.class_name || "—"}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Section"
                fullWidth
                value={profile?.section?.name || "—"}
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="Roll No"
                fullWidth
                type="number"
                error={Boolean(errors.roll_no)}
                helperText={errors.roll_no?.message}
                {...register("roll_no", {
                  min: { value: 1, message: "Roll number must be positive" }
                })}
              />
            </Stack>
             <TextField
               label="Email"
               fullWidth
               required
               type="email"
               error={Boolean(errors.email)}
               helperText={errors.email?.message}
               {...register("email", {
                 required: "Email is required",
                 pattern: {
                   value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                   message: "Invalid email address"
                 }
               })}
               sx={{ mb: 2 }}
             />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <Controller
                name="dob"
                control={control}
                render={({ field }) => (
                  <DatePickerField
                    label="Date of Birth"
                    value={field.value}
                    onChange={field.onChange}
                    disableFuture
                  />
                )}
              />
              <TextField
                label="Gender"
                select
                fullWidth
                defaultValue={profile?.gender || ""}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
                {...register("gender")}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </TextField>
              <TextField
                label="Blood Group"
                fullWidth
                {...register("blood_group")}
              />
            </Stack>

            <Typography variant="subtitle1" sx={{ alignSelf: 'start', fontWeight: 'bold', mt: 1 }}>
              Family Details
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <TextField label="Father's Name" fullWidth {...register("father_name")} />
              <TextField label="Mother's Name" fullWidth {...register("mother_name")} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <TextField label="Father's Occupation" fullWidth {...register("father_occupation")} />
              <TextField label="Mother's Occupation" fullWidth {...register("mother_occupation")} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <TextField label="Guardian Name" fullWidth {...register("guardian_name")} />
              <TextField label="Guardian Occupation" fullWidth {...register("guardian_occupation")} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <TextField label="Family Income" type="number" fullWidth {...register("family_income")} />
              <TextField label="Emergency Contact" fullWidth {...register("emergency_contact")} />
            </Stack>
            <TextField
                label="Residential Status"
                select
                fullWidth
                defaultValue={profile?.residential_status || "dayscholar"}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
                {...register("residential_status")}
              >
                <option value="dayscholar">Day Scholar</option>
                <option value="hosteler">Hosteler</option>
            </TextField>

            <Typography variant="subtitle1" sx={{ alignSelf: 'start', fontWeight: 'bold', mt: 1 }}>
              Address
            </Typography>
            <TextField
              label="Address"
              multiline
              rows={3}
              fullWidth
              {...register("address")}
            />
          </>
        )}

        {/* Teacher Fields */}
        {profile?.role === 'teacher' && (
          <>
            <Typography variant="subtitle1" sx={{ alignSelf: 'start', fontWeight: 'bold', mt: 1 }}>
              Professional Details
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <TextField
                label="Gender"
                select
                fullWidth
                defaultValue={profile?.gender || ""}
                SelectProps={{ native: true }}
                InputLabelProps={{ shrink: true }}
                {...register("gender")}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </TextField>
              <TextField
                label="Designation"
                fullWidth
                {...register("designation")}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
              <TextField
                label="Qualification"
                fullWidth
                {...register("qualification")}
              />
              <TextField
                label="Experience (Years)"
                type="number"
                fullWidth
                {...register("experience")}
              />
            </Stack>

             <TextField
               label="Email"
               fullWidth
               required
               type="email"
               error={Boolean(errors.email)}
               helperText={errors.email?.message}
               {...register("email", {
                 required: "Email is required",
                 pattern: {
                   value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                   message: "Invalid email address"
                 }
               })}
             />
          </>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={saving || uploading}
          startIcon={saving ? <CircularProgress size={20} /> : <CloudUpload />}
        >
          {saving ? 'Saving...' : (isCompleting ? 'Complete Profile' : 'Save Profile')}
        </Button>

        {/* Upload Status */}
        {uploading && (
          <Typography variant="body2" color="text.secondary">
            Uploading image...
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
