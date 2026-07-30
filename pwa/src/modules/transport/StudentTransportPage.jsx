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
  Info,
  MyLocation,
  AccessTime,
  CheckCircleOutline
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
  const [lastTrip, setLastTrip] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);

  const formatTime = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatTripDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return "Today";
    }
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return d.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const calcDuration = (startStr, endStr) => {
    if (!startStr || !endStr) return null;
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMins = Math.round((end - start) / 60000);
    if (diffMins < 1) return "< 1 min";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""}`;
    const hrs = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins > 0 ? `${mins} min` : ""}`;
  };

  // Bus change request
  const [vehiclesList, setVehiclesList] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ requested_vehicle_id: "" });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Map state
  const [googleMapsEnabled, setGoogleMapsEnabled] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // Enhanced Leaflet Map State for World-Class UX
  const routePointsRef = useRef([]);
  const busMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const startMarkerRef = useRef(null);
  const userInteractedRef = useRef(false);

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

    socket.on("trip:started", async (data) => {
      setActiveTrip({ id: data.trip_id, trip_type: data.trip_type, started_at: data.started_at });
      setTransportInfo(prev => ({ ...prev, vehicle: data.vehicle }));
      socket.emit("trip:join", { tripId: data.trip_id });
      try {
        const locRes = await api.get(`/student/transport/trips/${data.trip_id}/location`);
        if (locRes.data?.success && locRes.data.data) {
          setGpsLocation(locRes.data.data);
        }
      } catch { /* ignore */ }
    });

    socket.on("trip:stopped", (data) => {
      setActiveTrip(null);
      setGpsLocation(null);
      if (data.trip_id) socket.emit("trip:leave", { tripId: data.trip_id });
      fetchTransportInfo();
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

  // Clean up maps when switcher toggle changes to prevent conflicts
  useEffect(() => {
    if (mapRef.current) {
      try {
        if (typeof mapRef.current.remove === "function") {
          mapRef.current.remove();
        }
      } catch (e) {
        console.error("Cleanup map error:", e);
      }
      mapRef.current = null;
    }
    if (markerRef.current) {
      markerRef.current = null;
    }
    if (mapContainerRef.current) {
      mapContainerRef.current.innerHTML = "";
    }
    setMapsLoaded(false);
  }, [googleMapsEnabled]);

  // Dynamic Map Script Loader (Google Maps or Leaflet)
  useEffect(() => {
    if (googleMapsEnabled) {
      if (window.google && window.google.maps) {
        setMapsLoaded(true);
        return;
      }
      // Load Google Maps API script
      const scriptId = "google-maps-api-script";
      if (document.getElementById(scriptId)) {
        const checkExist = setInterval(() => {
          if (window.google && window.google.maps) {
            setMapsLoaded(true);
            clearInterval(checkExist);
          }
        }, 100);
        return;
      }
      const script = document.createElement("script");
      script.id = scriptId;
      const key = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapsLoaded(true);
      document.head.appendChild(script);
    } else {
      // Add pulse animation style to document head if not already present
      if (!document.getElementById("leaflet-pulse-style")) {
        const style = document.createElement("style");
        style.id = "leaflet-pulse-style";
        style.innerHTML = `
          @keyframes marker-pulse {
            0% {
              transform: scale(0.6);
              opacity: 0.9;
            }
            100% {
              transform: scale(2.2);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }

      if (window.L) {
        setMapsLoaded(true);
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => setMapsLoaded(true);
      document.head.appendChild(script);
    }
  }, [googleMapsEnabled]);

  // Update Map marker
  useEffect(() => {
    if (!mapsLoaded || !mapContainerRef.current || !gpsLocation || !transportInfo) return;
    const lat = Number(gpsLocation.latitude);
    const lng = Number(gpsLocation.longitude);

    if (googleMapsEnabled) {
      const google = window.google;
      if (!google || !google.maps) return;

      const busSvg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
          <circle cx="12" cy="12" r="11" fill="#1976d2" stroke="#ffffff" stroke-width="2"/>
          <path d="M7 15c0 .37.3.7.7.7h.7c.36 0 .7-.33.7-.7v-.7h5.8v.7c0 .37.3.7.7.7h.7c.37 0 .7-.33.7-.7v-2.3c0-2.33-2.39-3-5.33-3s-5.34.67-5.34 3V15zm1-2.7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm8.7 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM16 7H8V5.7h8V7z" fill="#ffffff"/>
        </svg>
      `;
      const busIconUrl = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(busSvg);

      if (!mapRef.current) {
        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat, lng },
          zoom: 15,
          mapTypeId: "roadmap",
          disableDefaultUI: true,
          zoomControl: true,
        });
        mapRef.current = map;

        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: mapRef.current,
          icon: {
            url: busIconUrl,
            size: new google.maps.Size(36, 36),
            scaledSize: new google.maps.Size(36, 36),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(18, 18),
          },
          title: transportInfo.vehicle?.vehicle_name || "Bus",
        });
        markerRef.current = marker;

        const infoWindow = new google.maps.InfoWindow({
          content: `<b>${transportInfo.vehicle?.vehicle_name || "Bus"}</b><br/>Driver: ${transportInfo.vehicle?.driver?.user?.name || "Driver"}`,
        });
        infoWindow.open(mapRef.current, marker);
      }
    } else {
      const L = window.L;
      if (!L || !mapContainerRef.current) return;

    const lat = Number(gpsLocation.latitude);
    const lng = Number(gpsLocation.longitude);
    const heading = Number(gpsLocation.heading || 0);

    if (isNaN(lat) || isNaN(lng)) return;

    const newPt = [lat, lng];

    // Maintain route history
    if (
      routePointsRef.current.length === 0 ||
      routePointsRef.current[routePointsRef.current.length - 1][0] !== lat ||
      routePointsRef.current[routePointsRef.current.length - 1][1] !== lng
    ) {
      routePointsRef.current.push(newPt);
    }

    const startPt = routePointsRef.current[0] || newPt;

    // Bus DivIcon with heading rotation & pulse ring
    const busIcon = L.divIcon({
      html: `
        <div style="
          position: relative;
          width: 42px;
          height: 42px;
          background: #1976d2;
          border: 3px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(25,118,210,0.4);
          transform: rotate(${heading}deg);
          transition: transform 0.4s ease;
        ">
          <div style="
            position: absolute;
            top: -4px;
            left: -4px;
            width: 44px;
            height: 44px;
            border: 2px solid #1976d2;
            border-radius: 50%;
            animation: marker-pulse 1.8s infinite ease-out;
            pointer-events: none;
          "></div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="#ffffff">
            <path d="M4 16c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h10v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-3.5c0-3.5-3.58-4.5-8-4.5s-8 1-8 4.5V16zm1.5-4c-.83 0-1.5-.67-1.5-1.5S4.67 9 5.5 9 7 9.67 7 10.5 6.33 12 5.5 12zm13 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 4H6V2h12v2z"/>
          </svg>
        </div>
      `,
      className: "custom-bus-marker",
      iconSize: [42, 42],
      iconAnchor: [21, 21]
    });

    const startIcon = L.divIcon({
      html: `
        <div style="
          width: 26px;
          height: 26px;
          background: #10b981;
          border: 2px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 11px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        ">A</div>
      `,
      className: "start-point-marker",
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });

    // Check saved viewport memory
    const savedZoom = localStorage.getItem("parent_map_zoom")
      ? Number(localStorage.getItem("parent_map_zoom"))
      : 15;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView(newPt, savedZoom);

      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 20
      }).addTo(map);

      // Listen to user map move/zoom to save viewport state to localStorage
      map.on("zoomend", () => {
        localStorage.setItem("parent_map_zoom", map.getZoom());
      });

      map.on("dragstart", () => {
        userInteractedRef.current = true;
      });

      // Start point marker
      startMarkerRef.current = L.marker(startPt, { icon: startIcon }).addTo(map).bindPopup("Trip Started Here");

      // Bus marker
      busMarkerRef.current = L.marker(newPt, { icon: busIcon })
        .addTo(map)
        .bindPopup(`<b>${transportInfo?.vehicle?.vehicle_name || "Bus"}</b><br/>Driver: ${transportInfo?.vehicle?.driver?.user?.name || "Driver"}`);

      // Polyline route trail
      routePolylineRef.current = L.polyline(routePointsRef.current, {
        color: "#1976d2",
        weight: 5,
        opacity: 0.85,
        lineCap: "round"
      }).addTo(map);
    } else {
      // Update markers and polyline
      if (busMarkerRef.current) {
        busMarkerRef.current.setLatLng(newPt);
        busMarkerRef.current.setIcon(busIcon);
      }

      if (routePolylineRef.current) {
        routePolylineRef.current.setLatLngs(routePointsRef.current);
      }

      // Smoothly follow bus only if parent has not dragged away
      if (!userInteractedRef.current) {
        mapRef.current.panTo(newPt, { animate: true, duration: 0.8 });
      }
    }
  }
  }, [mapsLoaded, gpsLocation, transportInfo, googleMapsEnabled]);

  const handleRecenterBus = () => {
    if (mapRef.current && gpsLocation) {
      userInteractedRef.current = false;
      const lat = Number(gpsLocation.latitude);
      const lng = Number(gpsLocation.longitude);
      mapRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
    }
  };

  const fetchTransportInfo = async () => {
    if (!studentId) {
      // No student ID available, try the simple /me endpoint only
      setLoading(true);
      try {
        const res = await api.get("/student/transport/me");
        if (res.data?.success && res.data.data) {
          const hasApiKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_KEY);
          const { active_trip, last_trip, ...tInfo } = res.data.data;
          setTransportInfo(tInfo);
          setActiveTrip(active_trip || null);
          setLastTrip(last_trip || null);
          setGoogleMapsEnabled(hasApiKey && (res.data.data.google_maps_enabled || false));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      // Fetch transport info and active trip in parallel
      const [transportRes, liveRes] = await Promise.all([
        api.get("/student/transport/me").catch(() => null),
        api.get(`/student/transport/students/${studentId}`).catch(() => null),
      ]);

      // Use the richer live response if available, else fallback to /me
      if (liveRes?.data?.success && liveRes.data.data) {
        const { transport, active_trip, last_trip, google_maps_enabled } = liveRes.data.data;
        const hasApiKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_KEY);
        setTransportInfo(transport);
        setActiveTrip(active_trip || null);
        setLastTrip(last_trip || null);
        setGoogleMapsEnabled(hasApiKey && (google_maps_enabled || false));

        // If there is an active trip, fetch its GPS location in the background
        if (active_trip) {
          api.get(`/student/transport/trips/${active_trip.id}/location`)
            .then((locRes) => {
              if (locRes.data?.success && locRes.data.data) {
                setGpsLocation(locRes.data.data);
              }
            })
            .catch(() => {/* ignore — location is optional */});
        }
      } else if (transportRes?.data?.success && transportRes.data.data) {
        const hasApiKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_KEY);
        const { active_trip, last_trip, ...tInfo } = transportRes.data.data;
        setTransportInfo(tInfo);
        setActiveTrip(active_trip || null);
        setLastTrip(last_trip || null);
        setGoogleMapsEnabled(hasApiKey && (transportRes.data.data.google_maps_enabled || false));
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
    setRequestForm({ requested_vehicle_id: "" });
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
        requested_vehicle_id: Number(requestForm.requested_vehicle_id)
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

              {!gpsLocation ? (
                <Box sx={{
                  height: "260px",
                  width: "100%",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "grey.50",
                  gap: 1.5,
                  mt: 2
                }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" color="textSecondary" fontWeight="medium">
                    Waiting for bus GPS location...
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ position: "relative", mt: 2 }}>
                  <div
                    ref={mapContainerRef}
                    style={{ height: "280px", width: "100%", borderRadius: "14px", border: "1px solid #e2e8f0" }}
                  ></div>

                  {/* Floating Target Bus Re-center Button */}
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<MyLocation sx={{ fontSize: 16 }} />}
                    onClick={handleRecenterBus}
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      right: 12,
                      zIndex: 1000,
                      borderRadius: "20px",
                      bgcolor: "#ffffff",
                      color: "#1976d2",
                      fontWeight: 800,
                      fontSize: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      textTransform: "none",
                      "&:hover": { bgcolor: "#f8fafc" }
                    }}
                  >
                    Target Bus
                  </Button>
                </Box>
              )}
            </Card>
          ) : (
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: "text.disabled"
                    }}
                  />
                  <Typography variant="subtitle2" fontWeight="bold" color="text.secondary">
                    Bus is Currently Parked
                  </Typography>
                </Box>
                {lastTrip && (
                  <Paper
                    elevation={0}
                    sx={{
                      px: 1.2,
                      py: 0.4,
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase"
                    }}
                  >
                    {lastTrip.trip_type ? `${lastTrip.trip_type} Trip` : "Last Trip"}
                  </Paper>
                )}
              </Box>

              {lastTrip ? (
                <Box sx={{ bgcolor: alpha(theme.palette.grey[500], 0.06), p: 2, borderRadius: 2.5, mb: 2.5 }}>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    fontWeight="bold"
                    sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 1.5 }}
                  >
                    Last Trip Timings ({formatTripDate(lastTrip.started_at)})
                  </Typography>
                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, alignItems: "center" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <AccessTime sx={{ color: "primary.main", fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ display: "block", lineHeight: 1 }}>
                          Started At
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="textPrimary">
                          {formatTime(lastTrip.started_at)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CheckCircleOutline sx={{ color: "success.main", fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="textSecondary" sx={{ display: "block", lineHeight: 1 }}>
                          Ended At
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="textPrimary">
                          {lastTrip.ended_at ? formatTime(lastTrip.ended_at) : (lastTrip.status === "active" ? "In Progress" : "Completed")}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  {lastTrip.started_at && lastTrip.ended_at && (
                    <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="caption" color="textSecondary">
                        Total Trip Duration:
                      </Typography>
                      <Typography variant="caption" fontWeight="bold" color="primary">
                        {calcDuration(lastTrip.started_at, lastTrip.ended_at)}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  No recent trips recorded for this bus.
                </Typography>
              )}

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
