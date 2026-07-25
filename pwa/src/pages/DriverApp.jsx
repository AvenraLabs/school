import React, { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Typography,
  Button,
  TextField,
  Box,
  CircularProgress,
  Paper,
  AppBar,
  Toolbar,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Divider,
  Alert
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import {
  DirectionsBus,
  GpsFixed,
  Person,
  Logout,
  Speed,
  Sync,
  Lock,
  PlayArrow,
  Stop,
  LocationOn,
  Navigation,
  CheckCircle,
  Shield,
  Phone,
  Directions
} from "@mui/icons-material";
import { useAuth } from "../auth/AuthProvider";
import BottomNav from "../components/BottomNav";
import SiblingSelector from "../components/SiblingSelector";
import api from "../api/axios";

/* =========================================================
   1️⃣ DRIVER DASHBOARD VIEW
   ========================================================= */
function DriverDashboard() {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);
  const [tripType, setTripType] = useState("pickup");
  const [activeTrip, setActiveTrip] = useState(null);

  // GPS tracking state
  const [gpsStatus, setGpsStatus] = useState("Waiting");
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [lastSyncSeconds, setLastSyncSeconds] = useState(null);
  const [isNativeBackground, setIsNativeBackground] = useState(false);

  // Route points: array of [lat, lng] for live polyline map
  const [routePoints, setRoutePoints] = useState([]);

  const watchIdRef = useRef(null);
  const lastSyncTimerRef = useRef(null);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const busMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);

  useEffect(() => {
    fetchDriverVehicle();
    checkActiveTrip();

    // Ensure Leaflet JS/CSS is available dynamically
    if (!window.L) {
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      if (!document.getElementById("leaflet-js")) {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        document.head.appendChild(script);
      }
    }

    return () => {
      stopGpsWatch();
    };
  }, []);

  const fetchDriverVehicle = async () => {
    try {
      const res = await api.get("/driver/transport/vehicle");
      if (res.data?.success) {
        setVehicle(res.data.data);
      }
    } catch (e) {
      console.error("Failed to load assigned vehicle", e);
    } finally {
      setLoading(false);
    }
  };

  const checkActiveTrip = async () => {
    try {
      const res = await api.get("/driver/transport/active-trip");
      if (res.data?.success && res.data.data) {
        const driverTrip = res.data.data;
        setActiveTrip({
          id: driverTrip.id,
          vehicle_id: driverTrip.vehicle_id,
          trip_type: driverTrip.trip_type,
          started_at: driverTrip.started_at
        });
        startGpsWatch(driverTrip.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startTrip = async () => {
    if (!vehicle) return;
    try {
      const res = await api.post("/driver/transport/trips/start", {
        vehicle_id: vehicle.id,
        trip_type: tripType
      });
      if (res.data?.success) {
        setActiveTrip(res.data.data);
        setRoutePoints([]);
        startGpsWatch(res.data.data.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const stopTrip = async () => {
    if (!activeTrip) return;
    try {
      const res = await api.post(`/driver/transport/trips/${activeTrip.id}/stop`);
      if (res.data?.success) {
        await stopGpsWatch();
        setActiveTrip(null);
        setCurrentSpeed(0);
        setLastSyncSeconds(null);
        setGpsStatus("Waiting");
        setRoutePoints([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Modern GPS Location Pusher
  const handleNewLocation = async (tripId, lat, lng, speedKmh, heading) => {
    setCurrentSpeed(speedKmh || 0);
    setLastSyncSeconds(0);
    setGpsStatus("Active");

    const newPt = [lat, lng];
    setRoutePoints((prev) => [...prev, newPt]);

    try {
      await api.post(`/driver/transport/trips/${tripId}/location`, {
        latitude: lat,
        longitude: lng,
        speed: speedKmh || 0,
        heading: heading || 0
      });
    } catch (e) {
      console.error("GPS Sync failed", e);
    }
  };

  const startGpsWatch = async (tripId) => {
    await stopGpsWatch();
    setGpsStatus("Locating...");
    setLastSyncSeconds(0);

    lastSyncTimerRef.current = setInterval(() => {
      setLastSyncSeconds((s) => (s !== null ? s + 1 : null));
    }, 1000);

    // Check if Capacitor native background geolocation is available
    if (window.Capacitor && window.Capacitor.isPluginAvailable("BackgroundGeolocation")) {
      try {
        const BG = window.Capacitor.Plugins.BackgroundGeolocation;
        setIsNativeBackground(true);

        BG.addWatcher(
          {
            backgroundMessage: "Sharing live bus location.",
            backgroundTitle: "SchoolIQ Bus Tracking",
            requestPermissions: true,
            stale: false,
            distanceFilter: 10
          },
          (location, error) => {
            if (error) {
              console.error("Background GPS Error", error);
              return;
            }
            if (location) {
              handleNewLocation(
                tripId,
                location.latitude,
                location.longitude,
                location.speed ? location.speed * 3.6 : 0,
                location.bearing || 0
              );
            }
          }
        ).then((watcherId) => {
          watchIdRef.current = watcherId;
        });
        return;
      } catch (err) {
        console.warn("Capacitor BG plugin fallback to HTML5", err);
      }
    }

    // Fallback: Standard HTML5 Geolocation API with graceful high-accuracy fallback
    setIsNativeBackground(false);
    if ("geolocation" in navigator) {
      const onSuccess = (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const speedKmh = position.coords.speed ? position.coords.speed * 3.6 : 0;
        const heading = position.coords.heading || 0;
        handleNewLocation(tripId, lat, lng, speedKmh, heading);
      };

      const startWatchWithOpts = (highAccuracy) => {
        if (watchIdRef.current) {
          navigator.geolocation.clearWatch(watchIdRef.current);
        }
        watchIdRef.current = navigator.geolocation.watchPosition(
          onSuccess,
          (error) => {
            console.error("GPS error", error);
            if (error.code === 1) {
              setGpsStatus("Permission Denied");
            } else if (highAccuracy) {
              // Retry with standard accuracy (Wi-Fi/IP location for laptops)
              startWatchWithOpts(false);
            } else {
              setGpsStatus("Location Unavailable");
            }
          },
          {
            enableHighAccuracy: highAccuracy,
            timeout: highAccuracy ? 8000 : 20000,
            maximumAge: 10000
          }
        );
      };

      // Start with high accuracy, automatically switch to standard accuracy if desktop/laptop Wi-Fi times out
      startWatchWithOpts(true);
    } else {
      setGpsStatus("GPS Not Supported");
    }
  };

  const stopGpsWatch = async () => {
    if (watchIdRef.current) {
      if (isNativeBackground && window.Capacitor?.Plugins?.BackgroundGeolocation) {
        try {
          await window.Capacitor.Plugins.BackgroundGeolocation.removeWatcher({
            id: watchIdRef.current
          });
        } catch (e) {
          console.error(e);
        }
      } else if (navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
    }
    if (lastSyncTimerRef.current) {
      clearInterval(lastSyncTimerRef.current);
      lastSyncTimerRef.current = null;
    }
  };

  // Render & update live Leaflet Map with Route Polyline
  useEffect(() => {
    if (!activeTrip || routePoints.length === 0 || !mapContainerRef.current || !window.L) return;
    const L = window.L;
    const latestPt = routePoints[routePoints.length - 1];
    const startPt = routePoints[0];

    const busIcon = L.divIcon({
      html: `
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          background: #4f46e5;
          border: 2px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(79,70,229,0.4);
        ">
          <div style="
            position: absolute;
            top: -3px;
            left: -3px;
            width: 38px;
            height: 38px;
            border: 2px solid #6366f1;
            border-radius: 50%;
            animation: pulse-ring 1.8s infinite ease-out;
            pointer-events: none;
          "></div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#ffffff">
            <path d="M4 16c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h10v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-3.5c0-3.5-3.58-4.5-8-4.5s-8 1-8 4.5V16zm1.5-4c-.83 0-1.5-.67-1.5-1.5S4.67 9 5.5 9 7 9.67 7 10.5 6.33 12 5.5 12zm13 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 4H6V2h12v2z"/>
          </svg>
        </div>
      `,
      className: "bus-live-marker",
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    const startIcon = L.divIcon({
      html: `
        <div style="
          width: 24px;
          height: 24px;
          background: #10b981;
          border: 2px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 10px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
        ">A</div>
      `,
      className: "start-point-marker",
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(latestPt, 16);
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19
      }).addTo(map);

      // Start Marker
      L.marker(startPt, { icon: startIcon }).addTo(map).bindPopup("Start");

      // Bus Live Marker
      busMarkerRef.current = L.marker(latestPt, { icon: busIcon }).addTo(map);

      // Route Polyline
      routePolylineRef.current = L.polyline(routePoints, {
        color: "#4f46e5",
        weight: 5,
        opacity: 0.8,
        lineCap: "round"
      }).addTo(map);
    } else {
      mapRef.current.setView(latestPt);

      if (busMarkerRef.current) {
        busMarkerRef.current.setLatLng(latestPt);
      }
      if (routePolylineRef.current) {
        routePolylineRef.current.setLatLngs(routePoints);
      }
    }
  }, [activeTrip, routePoints]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
        <CircularProgress size={40} thickness={4} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ pt: 2, pb: 10 }}>
      {/* ── Minimal Vehicle & Driver Header ─────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: "16px",
          mb: 2,
          border: "1px solid rgba(0,0,0,0.06)",
          background: "#ffffff"
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar sx={{ bgcolor: "primary.main", fontWeight: 800, width: 44, height: 44 }}>
            {(user.name || "D")[0].toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={800} noWrap sx={{ color: "#0f172a" }}>
              {user.name || "Driver"}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              {vehicle ? `${vehicle.vehicle_name} (${vehicle.vehicle_number})` : "No Bus Assigned"}
            </Typography>
          </Box>
          <SiblingSelector />
          {activeTrip && (
            <Chip
              label="Live"
              color="success"
              size="small"
              sx={{ fontWeight: 800, height: 22, fontSize: 11 }}
            />
          )}
        </Stack>
      </Paper>

      {/* ── Minimal Active Trip Controller ──────────────────────────────────── */}
      {vehicle && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: "16px",
            mb: 2,
            border: activeTrip ? "2px solid #4f46e5" : "1px solid rgba(0,0,0,0.06)",
            background: "#ffffff"
          }}
        >
          {!activeTrip ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant={tripType === "pickup" ? "contained" : "outlined"}
                  fullWidth
                  size="small"
                  onClick={() => setTripType("pickup")}
                  sx={{ borderRadius: "10px", py: 1, fontWeight: 800, textTransform: "none" }}
                >
                  Pickup (Morning)
                </Button>
                <Button
                  variant={tripType === "drop" ? "contained" : "outlined"}
                  fullWidth
                  size="small"
                  onClick={() => setTripType("drop")}
                  sx={{ borderRadius: "10px", py: 1, fontWeight: 800, textTransform: "none" }}
                >
                  Drop (Evening)
                </Button>
              </Stack>

              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                startIcon={<PlayArrow />}
                onClick={startTrip}
                sx={{
                  py: 1.5,
                  borderRadius: "12px",
                  fontWeight: 900,
                  fontSize: "0.95rem",
                  textTransform: "none"
                }}
              >
                Start Trip
              </Button>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" fontWeight={900} sx={{ textTransform: "capitalize" }}>
                  {activeTrip.trip_type} Trip
                </Typography>
                <Chip
                  label={gpsStatus}
                  color={gpsStatus === "Active" ? "success" : "default"}
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
              </Box>

              {/* Minimal Metrics */}
              <Stack direction="row" spacing={2} sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: "12px" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    SPEED
                  </Typography>
                  <Typography variant="body1" fontWeight={900}>
                    {Math.round(currentSpeed)} km/h
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    LAST SYNC
                  </Typography>
                  <Typography variant="body1" fontWeight={900}>
                    {lastSyncSeconds !== null ? `${lastSyncSeconds}s ago` : "—"}
                  </Typography>
                </Box>
              </Stack>

              {gpsStatus === "Permission Denied" && (
                <Alert
                  severity="error"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => {
                        if ("geolocation" in navigator) {
                          navigator.geolocation.getCurrentPosition(
                            () => {
                              if (activeTrip?.id) startGpsWatch(activeTrip.id);
                            },
                            (err) => alert("Please click the Lock icon in browser address bar (top left next to URL) and set Location to Allow.")
                          );
                        }
                      }}
                    >
                      Enable Location
                    </Button>
                  }
                  sx={{ borderRadius: "12px", fontSize: "12px" }}
                >
                  Location permission blocked in browser.
                </Alert>
              )}

              <Button
                variant="contained"
                color="error"
                fullWidth
                startIcon={<Stop />}
                onClick={stopTrip}
                sx={{ py: 1.4, borderRadius: "12px", fontWeight: 900, textTransform: "none" }}
              >
                End Trip
              </Button>
            </Stack>
          )}
        </Paper>
      )}

      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </Container>
  );
}

/* =========================================================
   2️⃣ DRIVER PROFILE & PASSWORD CHANGE
   ========================================================= */
function DriverProfile() {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const [vehicle, setVehicle] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);

  // Password fields
  const [passwords, setPasswords] = useState({ old: "", newPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const fetchProfileDetails = async () => {
    try {
      const vRes = await api.get("/driver/transport/vehicle");
      if (vRes.data?.success) setVehicle(vRes.data.data);

      const dRes = await api.get("/driver/transport/profile");
      if (dRes.data?.success) {
        setDriverDetails(dRes.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setMessage(null);
    try {
      const res = await api.post("/auth/change-password", {
        old_password: passwords.old,
        new_password: passwords.newPassword
      });
      if (res.data?.success) {
        setMessage({ success: true, text: "Password changed successfully!" });
        setPasswords({ old: "", newPassword: "" });
      } else {
        setMessage({ success: false, text: "Failed to change password" });
      }
    } catch (err) {
      setMessage({ success: false, text: err.response?.data?.message || "Error updating password" });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
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
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 2, pb: 10 }}>
      {/* Profile Card */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: "24px",
          mb: 3,
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
          textAlign: "center"
        }}
      >
        <Avatar
          sx={{
            width: 72,
            height: 72,
            margin: "0 auto 12px",
            background: "linear-gradient(135deg, #4f46e5, #312e81)",
            fontSize: 28,
            fontWeight: 800,
            boxShadow: "0 4px 16px rgba(79,70,229,0.3)"
          }}
        >
          {(user.name || "D")[0].toUpperCase()}
        </Avatar>
        <Typography variant="h5" fontWeight={900} sx={{ fontFamily: "'Outfit', sans-serif" }}>
          {user.name || "Driver"}
        </Typography>
        <Chip label="Transport Staff" size="small" sx={{ mt: 1, fontWeight: 800, bgcolor: "#eef2ff", color: "#4f46e5" }} />

        <Divider sx={{ my: 3 }} />

        <Stack spacing={2} sx={{ textAlign: "left" }}>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: "uppercase" }}>
              PHONE NUMBER
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {user.phone || "—"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: "uppercase" }}>
              LICENSE NUMBER
            </Typography>
            <Typography variant="body1" fontWeight={700} sx={{ fontFamily: "monospace" }}>
              {driverDetails?.license_number || "—"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: "uppercase" }}>
              ASSIGNED VEHICLE
            </Typography>
            <Typography variant="body1" fontWeight={700}>
              {vehicle ? `${vehicle.vehicle_name} (${vehicle.vehicle_number})` : "Unassigned"}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Change Password */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "24px",
          mb: 3,
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
        }}
      >
        <Typography variant="subtitle1" fontWeight={800} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Lock color="primary" /> Security & Password
        </Typography>

        {message && (
          <Alert severity={message.success ? "success" : "error"} sx={{ mb: 2, borderRadius: "12px" }}>
            {message.text}
          </Alert>
        )}

        <form onSubmit={handlePasswordChange}>
          <Stack spacing={2}>
            <TextField
              label="Current Password"
              type="password"
              variant="outlined"
              size="small"
              fullWidth
              required
              value={passwords.old}
              onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
            />
            <TextField
              label="New Password"
              type="password"
              variant="outlined"
              size="small"
              fullWidth
              required
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={savingPassword}
              sx={{ py: 1.2, borderRadius: "12px", textTransform: "none", fontWeight: 800 }}
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </Button>
          </Stack>
        </form>
      </Paper>

      {/* Sign Out */}
      <Button
        variant="outlined"
        color="error"
        fullWidth
        onClick={handleSignOut}
        startIcon={<Logout />}
        sx={{ py: 1.4, borderRadius: "16px", fontWeight: 800, textTransform: "none" }}
      >
        Sign Out
      </Button>
    </Container>
  );
}

/* =========================================================
   3️⃣ ROUTING ENTRY
   ========================================================= */
export default function DriverApp() {
  return (
    <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
      <AppBar position="sticky" elevation={0} sx={{ background: "#ffffff", color: "#0f172a", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <Toolbar sx={{ justifyContent: "center" }}>
          <DirectionsBus sx={{ color: "#4f46e5", mr: 1 }} />
          <Typography variant="h6" fontWeight={900} sx={{ fontFamily: "'Outfit', sans-serif" }}>
            SchoolIQ Transport
          </Typography>
        </Toolbar>
      </AppBar>

      <Routes>
        <Route path="dashboard" element={<DriverDashboard />} />
        <Route path="profile" element={<DriverProfile />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>

      <BottomNav />
    </Box>
  );
}
