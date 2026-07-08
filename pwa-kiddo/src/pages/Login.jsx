import { Navigate } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Alert,
  GlobalStyles,
  IconButton,
  Button,
} from "@mui/material";
import { SchoolRounded, DownloadRounded, CloseRounded } from "@mui/icons-material";
import { useAuth } from "../auth/AuthProvider";
import LoginForm from "../modules/login/LoginForm";
import { useEffect, useState } from "react";
import { usePwaInstall } from "../pwa/usePwaInstall";

export default function Login() {
  const { user, loading, logout } = useAuth();
  const [blocked, setBlocked] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { canInstall, isInstalled, install } = usePwaInstall();

  const showBanner = canInstall && !isInstalled && !bannerDismissed;

  useEffect(() => {
    if (!user?.role) return;
    const allowed = ["student", "teacher", "driver"];
    if (!allowed.includes(user.role)) {
      setBlocked(true);
      logout();
    }
  }, [user?.role, logout]);

  if (loading) return null;

  if (user) {
    if (user.role === "student") return <Navigate to="/student/dashboard" replace />;
    if (user.role === "teacher") return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === "driver") return <Navigate to="/driver/dashboard" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <>
      <GlobalStyles
        styles={{
          "html, body, #root": {
            margin: 0,
            padding: 0,
            width: "100%",
            height: "100%",
            overflow: "hidden",
            backgroundColor: "#F5EDE3",
          },
        }}
      />

      <Box
        sx={{
          width: "100%",
          minHeight: "100dvh",
          position: "relative",
          background: "linear-gradient(159.61deg, #F5EDE3 23.07%, #F3E0BB 35.25%, #F1D396 57.18%, rgba(238, 190, 87, 0.64) 87.71%)",
          overflow: "hidden",
          "@keyframes float": {
            "0%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(6px)" },
            "100%": { transform: "translateY(0px)" },
          },
        }}
      >
        {/* Background waves */}
        <Box
          component="svg"
          viewBox="0 0 430 465.38"
          preserveAspectRatio="none"
          sx={{
            position: "absolute",
            width: "100%",
            maxWidth: 430,
            left: "50%",
            transform: "translateX(-50%)",
            height: { xs: 380, sm: 465 },
            top: -1,
            zIndex: 1,
            boxShadow: "0px 4px 250px #FFFFFF",
            filter: "blur(1.3px)",
            pointerEvents: "none",
          }}
        >
          <defs>
            <linearGradient id="vector7-grad" x1="0%" y1="0%" x2="70%" y2="100%">
              <stop offset="1.7%" stopColor="#8f46c3" stopOpacity={0.49} />
              <stop offset="39.04%" stopColor="#6923d1" stopOpacity={0.37} />
              <stop offset="60.73%" stopColor="#a277e3" stopOpacity={0.23} />
              <stop offset="88.17%" stopColor="#ffffff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <path
            d="M 0 0 L 0 460 C 120 460, 180 340, 270 360 C 340 380, 380 280, 430 250 L 430 0 Z"
            fill="url(#vector7-grad)"
          />
        </Box>

        <Box
          component="svg"
          viewBox="0 0 430 209.38"
          preserveAspectRatio="none"
          sx={{
            position: "absolute",
            width: "100%",
            maxWidth: 430,
            left: "50%",
            transform: "translateX(-50%)",
            height: { xs: 170, sm: 209 },
            top: { xs: -20, sm: -30 },
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <defs>
            <linearGradient id="vector6-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="22.74%" stopColor="#3809c3" stopOpacity={0.37} />
              <stop offset="30.28%" stopColor="#3a0cc4" stopOpacity={0.39} />
              <stop offset="38.92%" stopColor="#5a00e0" stopOpacity={0.35} />
              <stop offset="55.3%" stopColor="#980ad8" stopOpacity={0.28} />
              <stop offset="61%" stopColor="#961ece" stopOpacity={0.29} />
            </linearGradient>
          </defs>
          <path
            d="M 0 0 L 0 205 C 100 205, 180 140, 250 160 C 320 180, 370 120, 430 100 L 430 0 Z"
            fill="url(#vector6-grad)"
          />
        </Box>

        {/* Bottom pink glow */}
        <Box
          sx={{
            position: "absolute",
            width: 597,
            height: 151,
            left: "50%",
            transform: "translateX(calc(-50% - 167px))",
            bottom: 0,
            background:
              "linear-gradient(90deg, rgba(212, 97, 147, 0.97) 39.76%, rgba(216, 116, 158, 0.97) 56.35%, rgba(222, 142, 172, 0.97) 84.37%, rgba(245, 237, 227, 0.97) 100%)",
            filter: "blur(50px)",
            borderRadius: "50%",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

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
              px: 2,
              py: 1.25,
              background: "linear-gradient(90deg, #0ea5e9 0%, #10b981 100%)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.18)",
            }}
          >
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

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>
                Add School App to Home Screen
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "rgba(255,255,255,0.75)", lineHeight: 1.2 }}>
                Faster access, works offline
              </Typography>
            </Box>

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

            <IconButton
              size="small"
              onClick={() => setBannerDismissed(true)}
              sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "#fff", background: "rgba(255,255,255,0.15)" } }}
            >
              <CloseRounded fontSize="small" />
            </IconButton>
          </Box>
        )}

        {/* Mobile frame */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: 430,
            minHeight: "100dvh",
            mx: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Cloud — CSS shadow only, no SVG filter artifact */}
          <Box
            sx={{
              position: "absolute",
              top: { xs: 88, sm: 108 },
              right: { xs: 28, sm: 44 },
              width: { xs: 108, sm: 124 },
              height: "auto",
              zIndex: 3,
              pointerEvents: "none",
              animation: "float 6s ease-in-out infinite",
              filter: "drop-shadow(4px 8px 16px rgba(132, 115, 161, 0.45))",
            }}
          >
            <Box
              component="img"
              src="/cloud.svg"
              alt=""
              sx={{ width: "100%", height: "auto", display: "block" }}
            />
          </Box>

          {/* Books — pinned to bottom, always behind form */}
          <Box
            sx={{
              position: "absolute",
              bottom: { xs: 20, sm: 30 },
              left: 0,
              right: 0,
              height: 150,
              zIndex: 3,
              pointerEvents: "none",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: 200,
                height: 36,
                left: "50%",
                transform: "translateX(-50%)",
                bottom: 38,
                background: "#9E5371",
                filter: "blur(4px)",
                borderRadius: "50%",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: { xs: 28, sm: 36 },
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Box sx={{ width: { xs: 220, sm: 250 }, animation: "float 8s ease-in-out infinite" }}>
                <Box
                  component="img"
                  src="/books.png"
                  alt=""
                  sx={{ width: "100%", height: "auto", display: "block" }}
                />
              </Box>
            </Box>
          </Box>

          {/* Main content — flex flow, never overlaps books */}
          <Box
            sx={{
              position: "relative",
              zIndex: 5,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              px: "25px",
              pt: { xs: "170px", sm: "200px" },
              pb: "170px",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: "linear-gradient(131.91deg, #0EAAD1 8.99%, #10B39F 83.2%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  flexShrink: 0,
                }}
              >
                <SchoolRounded sx={{ fontSize: 26 }} />
              </Box>
              <Typography
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 700,
                  fontSize: { xs: "26px", sm: "32px" },
                  color: "#000000",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                School App
              </Typography>
            </Stack>

            <Typography
              sx={{
                mt: "24px",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: { xs: "20px", sm: "24px" },
                color: "#000000",
                lineHeight: 1.2,
              }}
            >
              Welcome back, Sign in
            </Typography>

            <Box sx={{ mt: "16px" }}>
              {blocked && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: "16px", fontSize: "12px" }}>
                  This portal is only for students, teachers, and parents. Please use the admin panel.
                </Alert>
              )}
              <LoginForm />
            </Box>
          </Box>

          {/* Footer branding */}
          <Box
            sx={{
              position: "absolute",
              bottom: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "'Inter', sans-serif",
              fontSize: "11px",
              fontWeight: 500,
              color: "rgba(0, 0, 0, 0.45)",
              zIndex: 10,
              textAlign: "center",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <Box>
              Product of{" "}
              <Box
                component="a"
                href="https://avenra.org"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  color: "#8f46c3",
                  textDecoration: "none",
                  fontWeight: 700,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Avenra
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <Box
                component="a"
                href="/privacy"
                sx={{
                  color: "rgba(0, 0, 0, 0.45)",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                    color: "#8f46c3",
                  },
                }}
              >
                Privacy Policy
              </Box>
              <Box sx={{ color: "rgba(0, 0, 0, 0.2)" }}>|</Box>
              <Box
                component="a"
                href="/terms"
                sx={{
                  color: "rgba(0, 0, 0, 0.45)",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                    color: "#8f46c3",
                  },
                }}
              >
                Terms & Conditions
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
