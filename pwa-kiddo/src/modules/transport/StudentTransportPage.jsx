import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Card,
  Typography,
  Button,
  Box,
  CircularProgress,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton
} from "@mui/material";
import {
  DirectionsBus,
  Phone,
  Speed,
  Sync,
  ChangeCircle,
  Warning,
  CheckCircle,
  Info
} from "@mui/icons-material";
import api from "../../api/axios";
import { connectTransportSocket } from "./transport.socket";
import { useAuth } from "../../auth/AuthProvider";
import { alpha, useTheme } from "@mui/material/styles";

export default function StudentTransportPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [transportInfo, setTransportInfo] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);

  // Bus change request
  const [vehiclesList, setVehiclesList] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ requested_vehicle_id: "", pickup_point: "" });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Map state
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  const studentId = user?.student_id;

  useEffect(() => {
    fetchTransportInfo();
  }, []);

  // Socket: real-time bus tracking
  useEffect(() => {
    if (!studentId) return;

    const token = localStorage.getItem("token");
    const socket = connectTransportSocket(token);

    socket.emit("student:join", { studentId });

    if (activeTrip) {
      socket.emit("trip:join", { tripId: activeTrip.id });
    }

    socket.on("trip:started", (data) => {
      setActiveTrip({ id: data.trip_id, trip_type: data.trip_type, started_at: data.started_at });
      setTransportInfo(prev => ({ ...prev, vehicle: data.vehicle }));
      socket.emit("trip:join", { tripId: data.trip_id });
    });

    socket.on("trip:stopped", (data) => {
      setActiveTrip(null);
      setGpsLocation(null);
      if (data.trip_id) socket.emit("trip:leave", { tripId: data.trip_id });
    });

    socket.on("trip:location", (data) => {
      setGpsLocation(data);
    });

    return () => {
      socket.emit("student:leave", { studentId });
      if (activeTrip) socket.emit("trip:leave", { tripId: activeTrip.id });
      socket.off("trip:started");
      socket.off("trip:stopped");
      socket.off("trip:location");
    };
  }, [studentId, activeTrip]);

  // Leaflet map loader
  useEffect(() => {
    if (window.L) { setLeafletLoaded(true); return; }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Update Leaflet marker
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || !gpsLocation || !transportInfo) return;
    const L = window.L;
    if (!L) return;
    const lat = Number(gpsLocation.latitude);
    const lng = Number(gpsLocation.longitude);

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
      }).addTo(map);
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${transportInfo.vehicle?.vehicle_name || "Bus"}</b><br/>Driver: ${transportInfo.vehicle?.driver?.user?.name || "Driver"}`)
        .openPopup();
    } else {
      mapRef.current.setView([lat, lng]);
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) mapRef.current.removeLayer(layer);
      });
      L.marker([lat, lng])
        .addTo(mapRef.current)
        .bindPopup(`<b>${transportInfo.vehicle?.vehicle_name || "Bus"}</b><br/>Driver: ${transportInfo.vehicle?.driver?.user?.name || "Driver"}`)
        .openPopup();
    }
  }, [leafletLoaded, gpsLocation, transportInfo]);

  const fetchTransportInfo = async () => {
    setLoading(true);
    try {
      // Try the "me" endpoint first (simple static info)
      const res = await api.get("/student/transport/me");
      if (res.data?.success && res.data.data) {
        setTransportInfo(res.data.data);
        // Also fetch live trip data if we have a student_id claim
        if (studentId) {
          try {
            const liveRes = await api.get(`/student/transport/students/${studentId}`);
            if (liveRes.data?.success && liveRes.data.data) {
              setTransportInfo(liveRes.data.data.transport);
              setActiveTrip(liveRes.data.data.active_trip);
            }
          } catch { /* ignore live fetch error */ }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openRequestModal = async () => {
    setShowRequestModal(true);
    setRequestSuccess(false);
    setRequestForm({ requested_vehicle_id: "", pickup_point: "" });
    try {
      const res = await api.get("/student/transport/vehicles");
      if (res.data?.success) setVehiclesList(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    try {
      const res = await api.post("/student/transport/requests", {
        student_id: studentId,
        requested_vehicle_id: Number(requestForm.requested_vehicle_id),
        pickup_point: requestForm.pickup_point
      });
      if (res.data?.success) {
        setRequestSuccess(true);
        setTimeout(() => setShowRequestModal(false), 2000);
      }
    } catch (e) { console.error(e); } finally { setRequestLoading(false); }
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
      <Paper sx={{
        p: 3,
        borderRadius: '20px',
        mb: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.dark} 100%)`,
        color: "#fff",
        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
      }}>
        <Typography variant="h6" fontWeight="bold">My School Bus</Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>View assigned transport and live location</Typography>
      </Paper>

      {!transportInfo ? (
        <Card sx={{ p: 4, borderRadius: 3, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <Warning color="warning" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>No Bus Assigned</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            You are not currently assigned to any school transport routes. Contact admin or request a bus.
          </Typography>
          <Button variant="contained" fullWidth onClick={openRequestModal} sx={{ py: 1.2, borderRadius: 2 }}>
            Request Bus Assignment
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Bus Info Card */}
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <DirectionsBus sx={{ color: "primary.main", fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary" fontWeight="bold">BUS NUMBER</Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary">
                    {transportInfo.vehicle?.vehicle_name || "Bus"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" color="textSecondary" fontWeight="bold">VEHICLE NO</Typography>
                <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: "monospace" }}>
                  {transportInfo.vehicle?.vehicle_number}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="caption" color="textSecondary" fontWeight="bold">DRIVER</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {transportInfo.vehicle?.driver?.user?.name || "Driver"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {transportInfo.vehicle?.driver?.user?.phone || "—"}
                </Typography>
              </Box>
              {transportInfo.vehicle?.driver?.user?.phone && (
                <IconButton
                  component="a"
                  href={`tel:${transportInfo.vehicle.driver.user.phone}`}
                  color="primary"
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), p: 1.5, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) } }}
                >
                  <Phone />
                </IconButton>
              )}
            </Box>

            {transportInfo.pickup_point && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary" fontWeight="bold">MY PICKUP POINT</Typography>
                  <Typography variant="body2" fontWeight="bold" color="textPrimary">
                    {transportInfo.pickup_point}
                  </Typography>
                </Box>
              </>
            )}
          </Card>

          {/* Live Trip Card */}
          {activeTrip ? (
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <Typography variant="subtitle2" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
                🟢 Bus is Live / Moving
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Running: {activeTrip.trip_type} Trip
              </Typography>

              {gpsLocation && (
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, my: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Speed sx={{ color: "action.active", fontSize: 18 }} />
                    <Typography variant="caption" fontWeight="bold">
                      {gpsLocation.speed ? `${Math.round(gpsLocation.speed)} km/h` : "0 km/h"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}>
                    <Sync sx={{ color: "action.active", fontSize: 18 }} />
                    <Typography variant="caption" color="textSecondary">Synced just now</Typography>
                  </Box>
                </Box>
              )}

              <div
                ref={mapContainerRef}
                style={{ height: "260px", width: "100%", borderRadius: "12px", border: "1px solid #e2e8f0" }}
              ></div>
            </Card>
          ) : (
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                🔴 Trip Completed / Inactive
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 2 }}>
                Bus is currently parked.
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ChangeCircle />}
                fullWidth
                onClick={openRequestModal}
                sx={{ py: 1, borderRadius: 2, textTransform: "none" }}
              >
                Request Bus Change
              </Button>
            </Card>
          )}
        </Box>
      )}

      {/* Request Modal */}
      <Dialog
        open={showRequestModal}
        onClose={() => !requestLoading && setShowRequestModal(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Request Bus Change</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {requestSuccess ? (
            <Box sx={{ p: 2, textAlign: "center", color: "success.main" }}>
              <CheckCircle sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">Request Submitted!</Typography>
              <Typography variant="body2" color="textSecondary">
                School office will review and update your assignment.
              </Typography>
            </Box>
          ) : (
            <form onSubmit={handleRequestSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
                <FormControl fullWidth size="small" required>
                  <InputLabel>Requested Bus</InputLabel>
                  <Select
                    value={requestForm.requested_vehicle_id}
                    label="Requested Bus"
                    onChange={(e) => setRequestForm({ ...requestForm, requested_vehicle_id: e.target.value })}
                  >
                    {vehiclesList.map((veh) => (
                      <MenuItem key={veh.id} value={veh.id}>
                        {veh.vehicle_name} ({veh.vehicle_number})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Pickup Point"
                  required
                  fullWidth
                  size="small"
                  value={requestForm.pickup_point}
                  onChange={(e) => setRequestForm({ ...requestForm, pickup_point: e.target.value })}
                  placeholder="e.g. Lakshmi Mills Junction"
                />

                <DialogActions sx={{ px: 0, pb: 0 }}>
                  <Button onClick={() => setShowRequestModal(false)} disabled={requestLoading}>Cancel</Button>
                  <Button type="submit" variant="contained" disabled={requestLoading}>
                    {requestLoading ? "Submitting..." : "Submit Request"}
                  </Button>
                </DialogActions>
              </Box>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
