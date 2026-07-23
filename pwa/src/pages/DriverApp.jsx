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
  Toolbar
} from "@mui/material";
import {
  DirectionsBus,
  GpsFixed,
  Person,
  Logout,
  Speed,
  Sync,
  Lock
} from "@mui/icons-material";
import { useAuth } from "../auth/AuthProvider";
import BottomNav from "../components/BottomNav";
import api from "../api/axios";

/* =========================================================
   1️⃣ DRIVER DASHBOARD VIEW
   ========================================================= */
function DriverDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState(null);
  const [tripType, setTripType] = useState("pickup");
  const [activeTrip, setActiveTrip] = useState(null);

  // GPS tracking state
  const [gpsStatus, setGpsStatus] = useState("Waiting");
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [lastSyncSeconds, setLastSyncSeconds] = useState(null);

  const watchIdRef = useRef(null);
  const lastSyncTimerRef = useRef(null);

  useEffect(() => {
    fetchDriverVehicle();
    checkActiveTrip();
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
        stopGpsWatch();
        setActiveTrip(null);
        setCurrentSpeed(0);
        setLastSyncSeconds(null);
        setGpsStatus("Waiting");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const startGpsWatch = (tripId) => {
    stopGpsWatch();
    setGpsStatus("Connected");
    setLastSyncSeconds(0);

    lastSyncTimerRef.current = setInterval(() => {
      setLastSyncSeconds((s) => (s !== null ? s + 1 : null));
    }, 1000);

    if ("geolocation" in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const speedKmh = position.coords.speed ? position.coords.speed * 3.6 : 0;
          const heading = position.coords.heading || 0;

          setCurrentSpeed(speedKmh);

          try {
            await api.post(`/driver/transport/trips/${tripId}/location`, {
              latitude: lat,
              longitude: lng,
              speed: speedKmh,
              heading: heading
            });
            setLastSyncSeconds(0);
          } catch (e) {
            console.error("GPS Sync failed", e);
          }
        },
        (error) => {
          console.error("GPS error", error);
        },
        { enableHighAccuracy: true, distanceFilter: 10 }
      );
    }
  };

  const stopGpsWatch = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (lastSyncTimerRef.current) {
      clearInterval(lastSyncTimerRef.current);
      lastSyncTimerRef.current = null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ pt: 3, pb: 10 }}>
      {/* Header Info */}
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, background: "linear-gradient(135deg, #1e1b4b, #312e81)", color: "#fff" }}>
        <Typography variant="h6" fontWeight="bold">Good Morning,</Typography>
        <Typography variant="h5" fontWeight="bold" sx={{ color: "#a5b4fc" }}>{user.name || "Driver"}</Typography>
      </Paper>

      {/* Vehicle Info */}
      <Card sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <DirectionsBus sx={{ color: "#4f46e5", fontSize: 32 }} />
          <Box>
            <Typography variant="subtitle2" color="textSecondary" fontWeight="bold">ASSIGNED VEHICLE</Typography>
            <Typography variant="h6" fontWeight="bold">
              {vehicle ? vehicle.vehicle_name : "No Assigned Bus"}
            </Typography>
            {vehicle && (
              <Typography variant="body2" color="textSecondary" sx={{ fontFamily: "monospace" }}>
                {vehicle.vehicle_number} ({vehicle.capacity} Seats)
              </Typography>
            )}
          </Box>
        </Box>
      </Card>

      {/* Trip Control panel */}
      {vehicle && (
        <Card sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          {!activeTrip ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle2" color="textSecondary" fontWeight="bold">SELECT TRIP TYPE</Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant={tripType === "pickup" ? "contained" : "outlined"}
                  fullWidth
                  onClick={() => setTripType("pickup")}
                  sx={{ borderRadius: 2 }}
                >
                  Pickup (Morning)
                </Button>
                <Button
                  variant={tripType === "drop" ? "contained" : "outlined"}
                  fullWidth
                  onClick={() => setTripType("drop")}
                  sx={{ borderRadius: 2 }}
                >
                  Drop (Evening)
                </Button>
              </Box>

              <Button
                variant="contained"
                color="success"
                size="large"
                fullWidth
                onClick={startTrip}
                sx={{ mt: 2, py: 1.5, borderRadius: 2, fontWeight: "bold" }}
              >
                Start Trip
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="subtitle2" color="textSecondary" fontWeight="bold">ACTIVE TRIP</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary" sx={{ textTransform: "capitalize" }}>
                    {activeTrip.trip_type} Trip
                  </Typography>
                </Box>
                <span style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#10b981",
                  borderRadius: "50%",
                  animation: "pulse 1.5s infinite"
                }}></span>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, py: 1, borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <GpsFixed color="success" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">GPS</Typography>
                    <Typography variant="body2" fontWeight="bold">{gpsStatus}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Speed color="primary" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">SPEED</Typography>
                    <Typography variant="body2" fontWeight="bold">{Math.round(currentSpeed)} km/h</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, gridColumn: "span 2" }}>
                  <Sync color="action" />
                  <Box>
                    <Typography variant="caption" color="textSecondary">LAST SYNC</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {lastSyncSeconds !== null ? `${lastSyncSeconds} seconds ago` : "—"}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Button
                variant="contained"
                color="error"
                size="large"
                fullWidth
                onClick={stopTrip}
                sx={{ py: 1.5, borderRadius: 2, fontWeight: "bold" }}
              >
                Stop Trip
              </Button>
            </Box>
          )}
        </Card>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.7; }
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
  const [vehicle, setVehicle] = useState(null);
  const [driverDetails, setDriverDetails] = useState(null);

  // Password fields
  const [passwords, setPasswords] = useState({ old: "", newPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

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
      setMessage({ success: false, text: err.response?.data?.message || "Error syncing request" });
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
    <Container maxWidth="xs" sx={{ pt: 3, pb: 10 }}>
      {/* Profile Card */}
      <Card sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", text: "center", mb: 3 }}>
          <Box sx={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #4f46e5, #818cf8)", display: "flex", alignItems: "center", justify: "center", color: "#fff", fontSize: 24, fontWeight: "bold", mb: 1 }}>
            {(user.name || "D")[0].toUpperCase()}
          </Box>
          <Typography variant="h6" fontWeight="bold">{user.name || "Driver"}</Typography>
          <Typography variant="body2" color="textSecondary">Driver Profile</Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, borderTop: "1px solid #f1f5f9", pt: 2 }}>
          <Box>
            <Typography variant="caption" color="textSecondary" fontWeight="bold">PHONE NUMBER</Typography>
            <Typography variant="body2">{user.phone || "—"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary" fontWeight="bold">LICENSE NUMBER</Typography>
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
              {driverDetails ? driverDetails.license_number : "—"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary" fontWeight="bold">ASSIGNED VEHICLE</Typography>
            <Typography variant="body2">{vehicle ? vehicle.vehicle_name : "Unassigned"}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary" fontWeight="bold">USERNAME</Typography>
            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>{user.username}</Typography>
          </Box>
        </Box>
      </Card>

      {/* Change Password */}
      <Card sx={{ p: 3, borderRadius: 3, mb: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <Typography variant="subtitle2" color="textSecondary" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Lock sx={{ color: "#4f46e5" }} /> CHANGE PASSWORD
        </Typography>

        {message && (
          <Box sx={{
            p: 1.5,
            mb: 2,
            borderRadius: 2,
            fontSize: "13px",
            border: "1px solid",
            borderColor: message.success ? "success.light" : "error.light",
            bgcolor: message.success ? "success.50" : "error.50",
            color: message.success ? "success.dark" : "error.dark"
          }}>
            {message.text}
          </Box>
        )}

        <form onSubmit={handlePasswordChange}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
              sx={{ py: 1, borderRadius: 2, textTransform: "none" }}
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </Button>
          </Box>
        </form>
      </Card>

      {/* Sign Out */}
      <Button
        variant="outlined"
        color="error"
        fullWidth
        onClick={handleSignOut}
        startIcon={<Logout />}
        sx={{ py: 1.2, borderRadius: 2, fontWeight: "bold" }}
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
    <Box sx={{ bgcolor: "#fafafa", minHeight: "100vh" }}>
      <AppBar position="sticky" sx={{ background: "#ffffff", color: "#1e1b4b", boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
        <Toolbar sx={{ justifyContent: "center" }}>
          <Typography variant="h6" fontWeight="bold">Driver Portal</Typography>
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
