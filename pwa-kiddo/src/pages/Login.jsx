import { Navigate } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Chip,
  useTheme,
  Alert,
  GlobalStyles,
  IconButton,
  Button,
} from "@mui/material";
import { AutoAwesomeRounded, SchoolRounded, DownloadRounded, CloseRounded } from "@mui/icons-material";
import { useAuth } from "../auth/AuthProvider";
import LoginForm from "../modules/login/LoginForm";
import { useEffect, useState } from "react";
import { usePwaInstall } from "../pwa/usePwaInstall";

export default function Login() {
  const { user, loading, logout } = useAuth();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [blocked, setBlocked] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { canInstall, isInstalled, install } = usePwaInstall();

  const showBanner = canInstall && !isInstalled && !bannerDismissed;

  useEffect(() => {
    if (!user?.role) return;
    const allowed = ["student", "teacher", "parent"];
    if (!allowed.includes(user.role)) {
      setBlocked(true);
      logout();
    }
  }, [user?.role, logout]);

  if (loading) return null;

  if (user) {
    if (user.role === "student") return <Navigate to="/student/dashboard" replace />;
    if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === "parent") return <Navigate to="/parent/dashboard" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <>
      {/* Force html/body/#root to fill viewport with no scroll or white gap */}
      <GlobalStyles
        styles={{
          "html, body, #root": {
            margin: 0,
            padding: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
          },
        }}
      />

      <Box
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: '"Sora", "Baloo 2", "Trebuchet MS", sans-serif',
          background: isDark
            ? "radial-gradient(1000px circle at 10% 10%, rgba(30,41,59,0.65) 0%, transparent 45%), radial-gradient(900px circle at 90% 0%, rgba(14,116,144,0.45) 0%, transparent 55%), linear-gradient(180deg, #0a0f1f 0%, #111827 100%)"
            : "radial-gradient(1200px circle at 10% 10%, rgba(254, 240, 138, 0.55) 0%, transparent 45%), radial-gradient(900px circle at 90% 0%, rgba(186, 230, 253, 0.7) 0%, transparent 55%), linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
          "@keyframes float": {
            "0%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(14px)" },
            "100%": { transform: "translateY(0px)" },
          },
          "@keyframes fadeSlide": {
            "0%": { opacity: 0, transform: "translateY(18px)" },
            "100%": { opacity: 1, transform: "translateY(0)" },
          },
          "@keyframes sweep": {
            "0%": { transform: "translateX(-20%)" },
            "50%": { transform: "translateX(20%)" },
            "100%": { transform: "translateX(-20%)" },
          },
        }}
      >
        {/* Grid background */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: isDark ? 0.25 : 0.35,
            backgroundImage:
              "linear-gradient(transparent 95%, rgba(148,163,184,0.25) 96%), linear-gradient(90deg, transparent 95%, rgba(148,163,184,0.25) 96%)",
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }}
        />

        {/* Decorative blobs */}
        <Box sx={{ position: "absolute", top: -90, right: -70, width: 260, height: 260, borderRadius: "50%", background: isDark ? "linear-gradient(135deg, rgba(14,165,233,0.6), rgba(16,185,129,0.55))" : "linear-gradient(135deg, rgba(14,165,233,0.9), rgba(16,185,129,0.9))", opacity: 0.55, filter: "blur(2px)", animation: "float 10s ease-in-out infinite", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: -120, left: -80, width: 320, height: 320, borderRadius: "50%", background: isDark ? "linear-gradient(135deg, rgba(251,191,36,0.35), rgba(244,63,94,0.3))" : "linear-gradient(135deg, rgba(251,191,36,0.8), rgba(244,63,94,0.6))", opacity: 0.5, filter: "blur(6px)", animation: "float 12s ease-in-out infinite", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", top: "35%", left: "-15%", width: "55%", height: "55%", borderRadius: "50%", background: isDark ? "radial-gradient(circle, rgba(34,197,94,0.25), transparent 60%)" : "radial-gradient(circle, rgba(74,222,128,0.45), transparent 65%)", opacity: 0.5, filter: "blur(10px)", animation: "sweep 16s ease-in-out infinite", pointerEvents: "none" }} />

      {/* PWA install banner — top of screen, dismissible */}
      {showBanner && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: { xs: 2, sm: 3 },
            py: 1.25,
            background: isDark
              ? "linear-gradient(90deg, #0f172a 0%, #1e293b 100%)"
              : "linear-gradient(90deg, #0ea5e9 0%, #10b981 100%)",
            boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
          }}
        >
          {/* App icon */}
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <DownloadRounded sx={{ color: "#fff", fontSize: 20 }} />
          </Box>

          {/* Text */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Add School App to Home Screen
            </Typography>
            <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", lineHeight: 1.2 }}>
              Faster access, works offline
            </Typography>
          </Box>

          {/* Install button */}
          <Button
            size="small"
            onClick={async () => {
              const installed = await install();
              if (installed) setBannerDismissed(true);
            }}
            sx={{
              flexShrink: 0,
              height: 32,
              px: 2,
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              background: "rgba(255,255,255,0.22)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.35)",
              "&:hover": { background: "rgba(255,255,255,0.32)" },
              textTransform: "none",
            }}
          >
            Install
          </Button>

          {/* Dismiss */}
          <IconButton
            size="small"
            onClick={() => setBannerDismissed(true)}
            sx={{
              flexShrink: 0,
              color: "rgba(255,255,255,0.8)",
              "&:hover": { color: "#fff", background: "rgba(255,255,255,0.15)" },
            }}
          >
            <CloseRounded fontSize="small" />
          </IconButton>
        </Box>
      )}

      {/* Main login box */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            width: "100%",
            maxWidth: "960px",
            px: { xs: 3, sm: 5, md: 6 },
            pt: showBanner ? "56px" : 0,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
            gap: { xs: 4, md: 8 },
            alignItems: "center",
          }}
        >
          {/* Left: branding */}
          <Box sx={{ animation: "fadeSlide 750ms ease-out" }}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2.8,
                    display: "grid",
                    placeItems: "center",
                    color: "white",
                    background: "linear-gradient(135deg, #0ea5e9 0%, #10b981 100%)",
                    boxShadow: isDark
                      ? "0 12px 30px rgba(14,165,233,0.35)"
                      : "0 14px 32px rgba(16,185,129,0.35)",
                    flexShrink: 0,
                  }}
                >
                  <SchoolRounded />
                </Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 800, letterSpacing: -0.6, color: "text.primary" }}
                >
                  School App
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.5} flexWrap="wrap">
                <Chip
                  icon={<AutoAwesomeRounded fontSize="small" />}
                  label="Safe · Kid friendly · Secure"
                  sx={{
                    bgcolor: isDark ? "rgba(14,165,233,0.18)" : "rgba(14,165,233,0.12)",
                    color: "text.primary",
                    fontWeight: 600,
                  }}
                />
              </Stack>
            </Stack>
          </Box>

          {/* Right: login form */}
          <Box
            sx={{
              animation: "fadeSlide 900ms ease-out",
              animationDelay: "80ms",
            }}
          >
            <Stack spacing={2.5}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>
                Welcome back, Sign in
              </Typography>

              {blocked && (
                <Alert severity="warning">
                  This portal is only for students, teachers, and parents. Please use the admin panel.
                </Alert>
              )}

              <LoginForm />
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
}
