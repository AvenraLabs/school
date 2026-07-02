import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Card,
  Typography,
  Button,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
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
  CheckCircle
} from "@mui/icons-material";
import { getParentChildren } from "../parent-analytics/parent-analytics.api";
import api from "../../api/axios";
import { connectTransportSocket, getTransportSocket } from "./transport.socket";

export default function ParentTransportPage() {
  const [children, setChildren] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(true);

  // Transport details
  const [transportInfo, setTransportInfo] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);

  // Vehicles list for request
  const [vehiclesList, setVehiclesList] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    requested_vehicle_id: "",
    pickup_point: ""
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Map state
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  // Fetch student analytics children list on mount
  useEffect(() => {
    loadParentChildrenList();
  }, []);

  // Fetch initial transport data when child changes
  useEffect(() => {
    if (!selectedStudentId) return;
    fetchTransportInfo();
  }, [selectedStudentId]);

  // Handle Socket connection and listeners
  useEffect(() => {
    if (!selectedStudentId) return;

    const token = localStorage.getItem("token");
    const socket = connectTransportSocket(token);

    // Join the student's notification channel
    socket.emit("student:join", { studentId: selectedStudentId });

    // Join active trip tracker room if trip is active initially
    if (activeTrip) {
      socket.emit("trip:join", { tripId: activeTrip.id });
    }

    // Real-time Event Listeners
    socket.on("trip:started", (data) => {
      console.log("Trip started socket event:", data);
      setActiveTrip({
        id: data.trip_id,
        trip_type: data.trip_type,
        started_at: data.started_at
      });
      setTransportInfo({
        vehicle: data.vehicle,
        pickup_point: transportInfo?.pickup_point || ""
      });
      // Join coordinates tracking room
      socket.emit("trip:join", { tripId: data.trip_id });
    });

    socket.on("trip:stopped", (data) => {
      console.log("Trip stopped socket event:", data);
      setActiveTrip(null);
      setGpsLocation(null);
      if (data.trip_id) {
        socket.emit("trip:leave", { tripId: data.trip_id });
      }
    });

    socket.on("trip:location", (data) => {
      console.log("Trip location socket event:", data);
      setGpsLocation(data);
    });

    return () => {
      // Leave student channel
      socket.emit("student:leave", { studentId: selectedStudentId });
      if (activeTrip) {
        socket.emit("trip:leave", { tripId: activeTrip.id });
      }
      // Remove listeners
      socket.off("trip:started");
      socket.off("trip:stopped");
      socket.off("trip:location");
    };
  }, [selectedStudentId, activeTrip]);

  // Leaflet map setup script
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);
  }, []);

  // Update Leaflet marker position
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
        if (layer instanceof L.Marker) {
          mapRef.current.removeLayer(layer);
        }
      });
      L.marker([lat, lng])
        .addTo(mapRef.current)
        .bindPopup(`<b>${transportInfo.vehicle?.vehicle_name || "Bus"}</b><br/>Driver: ${transportInfo.vehicle?.driver?.user?.name || "Driver"}`)
        .openPopup();
    }
  }, [leafletLoaded, gpsLocation, transportInfo]);

  const loadParentChildrenList = async () => {
    try {
      const res = await getParentChildren();
      const list = res.data?.data || [];
      setChildren(list);
      if (list.length > 0) {
        setSelectedStudentId(list[0].student?.id);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const fetchTransportInfo = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/parent/transport/students/${selectedStudentId}`);
      if (res.data?.success && res.data.data) {
        setTransportInfo(res.data.data.transport);
        setActiveTrip(res.data.data.active_trip);
      } else {
        setTransportInfo(null);
        setActiveTrip(null);
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
      const res = await api.get("/parent/transport/vehicles");
      if (res.data?.success) {
        setVehiclesList(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    try {
      const res = await api.post("/parent/transport/requests", {
        student_id: selectedStudentId,
        requested_vehicle_id: Number(requestForm.requested_vehicle_id),
        pickup_point: requestForm.pickup_point
      });
      if (res.data?.success) {
        setRequestSuccess(true);
        setTimeout(() => setShowRequestModal(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading && children.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ pt: 3, pb: 10 }}>
      {children.length > 0 && (
        <FormControl fullWidth size="small" sx={{ mb: 3 }}>
          <InputLabel>Select Child</InputLabel>
          <Select
            value={selectedStudentId}
            label="Select Child"
            onChange={(e) => setSelectedStudentId(e.target.value)}
            sx={{ bgcolor: "#fff", borderRadius: 2 }}
          >
            {children.map((child) => (
              <MenuItem key={child.student?.id} value={child.student?.id}>
                {child.student?.user?.name || "Child"}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress size={30} />
        </Box>
      ) : !transportInfo ? (
        <Card sx={{ p: 4, borderRadius: 3, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <Warning color="warning" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>No Bus Assigned</Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Your child is not currently registered for school transport. Please request a bus assignment or contact administration.
          </Typography>
          <Button variant="contained" fullWidth onClick={openRequestModal} sx={{ py: 1.2, borderRadius: 2 }}>
            Request Bus Assignment
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Card sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Box>
                <Typography variant="caption" color="textSecondary" fontWeight="bold">BUS NUMBER</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {transportInfo.vehicle?.vehicle_name || "Bus"}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="caption" color="textSecondary" fontWeight="bold">VEHICLE ID</Typography>
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
                  Phone: {transportInfo.vehicle?.driver?.user?.phone || "—"}
                </Typography>
              </Box>
              {transportInfo.vehicle?.driver?.user?.phone && (
                <IconButton
                  component="a"
                  href={`tel:${transportInfo.vehicle.driver.user.phone}`}
                  color="primary"
                  sx={{ bgcolor: "indigo.50", p: 1.5 }}
                >
                  <Phone />
                </IconButton>
              )}
            </Box>
          </Card>

          {activeTrip ? (
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" color="success.main" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    🟢 Bus is Live / Moving
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Running: {activeTrip.trip_type} Trip
                  </Typography>
                </Box>
              </Box>

              {gpsLocation && (
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 2, p: 1.5, bg: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Speed sx={{ color: "action.active", fontSize: 18 }} />
                    <Typography variant="caption" fontWeight="bold">
                      {gpsLocation.speed ? `${Math.round(gpsLocation.speed)} km/h` : "0 km/h"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "flex-end" }}>
                    <Sync sx={{ color: "action.active", fontSize: 18 }} />
                    <Typography variant="caption" color="textSecondary">
                      Synced just now
                    </Typography>
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight="bold" color="textSecondary">
                      🔴 Trip Completed / Inactive
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Bus is currently parked.
                    </Typography>
                  </Box>
                </Box>

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
              </Box>
            </Card>
          )}
        </Box>
      )}

      {/* Request Modal */}
      <Dialog open={showRequestModal} onClose={() => !requestLoading && setShowRequestModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Request Bus Change</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {requestSuccess ? (
            <Box sx={{ p: 2, textAlign: "center", color: "success.main" }}>
              <CheckCircle sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">Request Submitted!</Typography>
              <Typography variant="body2" color="textSecondary">School office will review and update your child's assignment.</Typography>
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
