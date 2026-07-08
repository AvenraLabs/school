import {
  Box,
  Button,
  TextField,
  Alert,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import {
  PersonOutline,
  LockOutlined,
  VisibilityOutlined,
  VisibilityOffOutlined,
} from "@mui/icons-material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema } from "./login.schema";
import { useLogin } from "./useLogin";

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "28px",
    backgroundColor: "#ffffff",
    height: "48px",
    fontSize: "14px",
    fontFamily: "'Inter', sans-serif",
    fontWeight: 400,
    boxShadow: "0px 2px 12px rgba(0, 0, 0, 0.06)",
    pl: 0.5,
    pr: 0.5,
    "& fieldset": { border: "none" },
    "&:hover fieldset": { border: "none" },
    "&.Mui-focused fieldset": { border: "none" },
  },
  "& .MuiOutlinedInput-input": {
    py: 0,
    px: "4px",
    color: "#000000",
    fontSize: "14px",
    "&::placeholder": {
      color: "rgba(0, 0, 0, 0.38)",
      opacity: 1,
    },
  },
  "& .MuiFormHelperText-root": {
    mx: 1.5,
    fontSize: "11px",
  },
};

export default function LoginForm({ onSuccess }) {
  const { handleLogin, loading, error } = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data) {
    const ok = await handleLogin(data);
    if (ok && onSuccess) onSuccess();
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: "100%" }}>
      {error && (
        <Alert severity="error" sx={{ borderRadius: "14px", fontSize: "12px", mb: 1.5 }}>
          {error}
        </Alert>
      )}

      <Stack spacing="14px">
        <TextField
          placeholder="Username or Mobile"
          {...register("username")}
          error={!!errors.username}
          helperText={errors.username?.message}
          autoComplete="username"
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 0.5, mr: 0 }}>
                <PersonOutline sx={{ color: "#9133A0", fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={fieldSx}
        />

        <TextField
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          {...register("password")}
          error={!!errors.password}
          helperText={errors.password?.message}
          autoComplete="current-password"
          fullWidth
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ ml: 0.5, mr: 0 }}>
                <LockOutlined sx={{ color: "#9133A0", fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end" sx={{ mr: 0.5 }}>
                <IconButton
                  onClick={() => setShowPassword((p) => !p)}
                  edge="end"
                  size="small"
                  sx={{ color: "#9133A0", p: 0.5 }}
                >
                  {showPassword ? (
                    <VisibilityOffOutlined sx={{ fontSize: 18 }} />
                  ) : (
                    <VisibilityOutlined sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={fieldSx}
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          disableElevation
          sx={{
            borderRadius: "28px",
            height: "48px",
            mt: "2px",
            textTransform: "none",
            fontSize: "17px",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            background: "linear-gradient(90deg, #CC3A7E 0%, #C05084 23.56%, #BD5F8B 49.04%, #8F64A8 73.08%, #6F55C4 100%)",
            color: "#FFFFFF",
            "&:hover": {
              background: "linear-gradient(90deg, #b02a66 0%, #523ea3 100%)",
            },
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Stack>
    </Box>
  );
}
