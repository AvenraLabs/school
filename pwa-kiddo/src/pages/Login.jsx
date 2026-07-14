import { Navigate } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Alert,
  GlobalStyles,
  IconButton,
  Button,
  Avatar,
} from "@mui/material";
import { SchoolRounded, DownloadRounded, CloseRounded } from "@mui/icons-material";
import { useAuth } from "../auth/AuthProvider";
import LoginForm from "../modules/login/LoginForm";
import { useEffect, useState } from "react";
import { usePwaInstall } from "../pwa/usePwaInstall";
import { useTheme } from "@mui/material/styles";
import { setThemeColor } from "../pwa/themeMeta";

export default function Login() {
  const { user, loading, logout, accounts, switchAccount } = useAuth();
  const [blocked, setBlocked] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { canInstall, isInstalled, install } = usePwaInstall();

  const theme = useTheme();

  // Cloud dragging & interactive play states
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isReturning, setIsReturning] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [particles, setParticles] = useState([]);

  // Spawn mini cloud/star particles
  const spawnParticle = (cx, cy) => {
    const colors = ["#ff4081", "#ffeb3b", "#00e5ff", "#a8ff35", "#ff9100", "#e040fb"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomSize = Math.floor(Math.random() * 12) + 8; // 8px to 20px
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 45 + 20;
    const tx = Math.cos(angle) * distance;
    const ty = Math.sin(angle) * distance - 25; // Float upwards
    
    const newParticle = {
      id: Math.random(),
      x: cx,
      y: cy,
      color: randomColor,
      size: randomSize,
      tx,
      ty,
    };
    
    setParticles((prev) => [...prev.slice(-25), newParticle]);
  };

  // Reset scroll and manage theme-color
  useEffect(() => {
    // Reset scroll position to top
    window.scrollTo(0, 0);

    // Set theme color to blend with the top gradient of login page
    setThemeColor("#F5EDE3");

    return () => {
      // Restore theme color to theme default on unmount
      if (theme?.palette?.background?.default) {
        setThemeColor(theme.palette.background.default);
      }
    };
  }, [theme]);

  // Handle cloud drag events
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setIsReturning(false);
    setStartPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });

    // Bounce and spawn explosion of particles
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 600);
    for (let i = 0; i < 6; i++) {
      spawnParticle(dragOffset.x + 50, dragOffset.y + 30);
    }
    
    e.preventDefault();
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setIsReturning(false);
    setStartPos({ x: touch.clientX - dragOffset.x, y: touch.clientY - dragOffset.y });

    // Bounce and spawn explosion of particles
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 600);
    for (let i = 0; i < 6; i++) {
      spawnParticle(dragOffset.x + 50, dragOffset.y + 30);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const newX = e.clientX - startPos.x;
      const newY = e.clientY - startPos.y;
      setDragOffset({ x: newX, y: newY });
      
      // Spawn trail particles with throttle chance
      if (Math.random() < 0.35) {
        spawnParticle(newX + 50, newY + 30);
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      const newX = touch.clientX - startPos.x;
      const newY = touch.clientY - startPos.y;
      setDragOffset({ x: newX, y: newY });
      
      // Spawn trail particles with throttle chance
      if (Math.random() < 0.4) {
        spawnParticle(newX + 50, newY + 30);
      }
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      if (dragOffset.x === 0 && dragOffset.y === 0) {
        setIsReturning(false);
      } else {
        setIsReturning(true);
        setDragOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleDragEnd);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleDragEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, startPos, dragOffset]);

  const handleTransitionEnd = (e) => {
    if (e.propertyName === "transform" && !isDragging) {
      setIsReturning(false);
    }
  };

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
          "@keyframes floatBooks": {
            "0%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(18px)" },
            "100%": { transform: "translateY(0px)" },
          },
          "@keyframes wiggleBounce": {
            "0%": { transform: "scale(1)" },
            "15%": { transform: "scale(1.28, 0.72)" },
            "30%": { transform: "scale(0.72, 1.28)" },
            "50%": { transform: "scale(1.15, 0.85)" },
            "70%": { transform: "scale(0.92, 1.08)" },
            "100%": { transform: "scale(1)" },
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
                Add SchoolIQ to Home Screen
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
          {/* Particles Trail container */}
          {particles.map((p) => (
            <Box
              key={p.id}
              sx={{
                position: "absolute",
                top: { xs: 88, sm: 108 },
                right: { xs: 28, sm: 44 },
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                backgroundColor: p.color,
                zIndex: 4,
                pointerEvents: "none",
                transform: `translate(${p.x}px, ${p.y}px)`,
                animation: `particleFade-${p.id.toString().replace('.', '')} 0.8s forwards ease-out`,
                [`@keyframes particleFade-${p.id.toString().replace('.', '')}`]: {
                  "0%": {
                    opacity: 1,
                    transform: `translate(${p.x}px, ${p.y}px) scale(1)`,
                  },
                  "100%": {
                    opacity: 0,
                    transform: `translate(${p.x + p.tx}px, ${p.y + p.ty}px) scale(0)`,
                  },
                },
              }}
            />
          ))}

          {/* Cloud — CSS shadow only, no SVG filter artifact */}
          <Box
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTransitionEnd={handleTransitionEnd}
            sx={{
              position: "absolute",
              top: { xs: 88, sm: 108 },
              right: { xs: 28, sm: 44 },
              width: { xs: 108, sm: 124 },
              height: "auto",
              zIndex: 5,
              cursor: isDragging ? "grabbing" : "grab",
              pointerEvents: "auto",
              userSelect: "none",
              touchAction: "none",
              filter: "drop-shadow(4px 8px 16px rgba(132, 115, 161, 0.45))",
              transform: (isDragging || isReturning)
                ? `translate(${dragOffset.x}px, ${dragOffset.y}px)`
                : "none",
              transition: isReturning
                ? "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                : "none",
            }}
          >
            {/* Decoupled Inner Box to run float/bounce animations independently of dragging transform */}
            <Box
              sx={{
                width: "100%",
                height: "auto",
                display: "block",
                animation: isBouncing
                  ? "wiggleBounce 0.6s ease-in-out"
                  : (!isDragging && !isReturning)
                    ? "float 6s ease-in-out infinite"
                    : "none",
              }}
            >
              <Box
                component="img"
                src="/cloud.svg"
                alt=""
                sx={{ width: "100%", height: "auto", display: "block", pointerEvents: "none" }}
              />
            </Box>
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
              <Box sx={{ width: { xs: 220, sm: 250 }, animation: "floatBooks 8s ease-in-out infinite" }}>
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
            <Stack direction="row" alignItems="center" spacing={1.5}>
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
                  fontWeight: 900,
                  fontSize: { xs: "28px", sm: "34px" },
                  color: "#000000",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                SchoolIQ
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

              {accounts && accounts.length > 0 && (
                <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="text"
                    startIcon={
                      <Avatar 
                        src={accounts[0].user.avatar_url} 
                        sx={{ width: 20, height: 20, fontSize: 10, bgcolor: "primary.main" }}
                      >
                        {(accounts[0].user.name || accounts[0].user.username || "U")[0].toUpperCase()}
                      </Avatar>
                    }
                    onClick={() => {
                      switchAccount(accounts[0].user.id);
                      const basePath = accounts[0].user.role === "teacher" ? "/teacher" : "/student";
                      window.location.href = `${basePath}/dashboard`;
                    }}
                    sx={{
                      textTransform: "none",
                      color: "rgba(0, 0, 0, 0.6)",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      fontSize: "13px",
                      borderRadius: "20px",
                      px: 2,
                      py: 0.5,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                        color: "#8f46c3",
                      }
                    }}
                  >
                    Cancel & Return to {accounts[0].user.name || accounts[0].user.username}
                  </Button>
                </Box>
              )}
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
