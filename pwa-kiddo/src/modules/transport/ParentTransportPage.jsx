import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Card,
  Typography,
  Button,
  Box,
  CircularProgress,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import {
  DirectionsBus,
  Phone,
  LocationOn,
  Speed,
  Sync,
  ChangeCircle,
  Warning
} from "@mui/icons-material";
import { getParentChildren } from "../parent-analytics/parent-analytics.api";

// Helper headers
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  }
});

export default function ParentTransportPage() {
  const [children, setChildren] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(true);

  // Transport details
  const [transportInfo, setTransportInfo] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [fetchingLocation, setFetchingLocation] = useState(false);

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
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    loadParentChildrenList();
  }, []);

  // Fetch transport info when child selection changes
  useEffect(() => {
    if (!selectedStudentId) return;
    fetchTransportInfo();
  }, [selectedStudentId]);

  // Handle live coordinates polling when an active trip is detected
  useEffect(() => {
    if (activeTrip) {
      startLocationPolling(activeTrip.id);
    } else {
      stopLocationPolling();
      setGpsLocation(null);
    }
    return () => {
      stopLocationPolling();
    };
  }, [activeTrip]);

  // Load Leaflet dynamically
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

  // Render map marker when location updates
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
      // Remove old markers
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
      const res = await fetch(`/api/parent/transport/students/${selectedStudentId}`, getAuthHeaders());
      const data = await res.json();
      if (data.success && data.data) {
        setTransportInfo(data.data.transport);
        setActiveTrip(data.data.active_trip);
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

  const startLocationPolling = (tripId) => {
    stopLocationPolling();
    const fetchLoc = async () => {
      setFetchingLocation(true);
      try {
        const res = await fetch(`/api/parent/transport/trips/${tripId}/location`, getAuthHeaders());
        const data = await res.json();
        if (data.success && data.data) {
          setGpsLocation(data.data);
        }
      } catch (err) {
        console.error("Error loading coordinate trace", err);
      } finally {
        setFetchingLocation(false);
      }
    };

    fetchLoc();
    pollIntervalRef.current = setInterval(fetchLoc, 5000);
  };

  const stopLocationPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  };

  // ── BUS CHANGE REQUEST ──
  const openRequestModal = async () => {
    setShowRequestModal(true);
    setRequestSuccess(false);
    setRequestForm({ requested_vehicle_id: "", pickup_point: "" });

    // Load available vehicles list
    try {
      const res = await fetch("/api/parent/transport/vehicles", getAuthHeaders());
      const data = await res.json();
      if (data.success) {
        setVehiclesList(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    try {
      const res = await fetch("/api/parent/transport/requests", {
        method: "POST",
        body: JSON.stringify({
          student_id: selectedStudentId,
          requested_vehicle_id: Number(requestForm.requested_vehicle_id),
          pickup_point: requestForm.pickup_point
        }),
        ...getAuthHeaders()
      });
      if (res.ok) {
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
      {/* Student Selection */}
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
        // Not Assigned state
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
        // Transport Dashboard View
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Main Transport card */}
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

            {/* Driver Details */}
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

          {/* Active Trip Map Tracking */}
          {activeTrip ? (
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <Box sx={{ display: "flex", justify: "space-between", alignItems: "center", mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" color="success.main" className="flex items-center gap-1">
                    🟢 Bus is Live / Moving
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Running: {activeTrip.trip_type} Trip
                  </Typography>
                </Box>
              </Box>

              {/* Live coordinates parameters */}
              {gpsLocation && (
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 2, p: 1.5, bg: "slate.50", border: "1px solid #f1f5f9", borderRadius: 2 }}>
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

              {/* Map Holder */}
              <div
                ref={mapContainerRef}
                style={{ height: "260px", width: "100%", borderRadius: "12px", border: "1px solid #e2e8f0" }}
              ></div>
            </Card>
          ) : (
            // Trip completed/not running today
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", justify: "space-between", alignItems: "center" }}>
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

      {/* ── CHANGE REQUEST DIALOG ── */}
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
