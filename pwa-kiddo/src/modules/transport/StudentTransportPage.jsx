import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Divider,
  IconButton
} from "@mui/material";
import { DirectionsBus, Phone, ContactPhone, Info } from "@mui/icons-material";

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  }
});

export default function StudentTransportPage() {
  const [loading, setLoading] = useState(true);
  const [transportInfo, setTransportInfo] = useState(null);

  useEffect(() => {
    fetchTransportMe();
  }, []);

  const fetchTransportMe = async () => {
    try {
      const res = await fetch("/api/student/transport/me", getAuthHeaders());
      const data = await res.json();
      if (data.success && data.data) {
        setTransportInfo(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
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
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, background: "linear-gradient(135deg, #4f46e5, #818cf8)", color: "#fff" }}>
        <Typography variant="h6" fontWeight="bold">My School Bus</Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>View assigned transport and contact information</Typography>
      </Paper>

      {!transportInfo ? (
        <Card sx={{ p: 4, borderRadius: 3, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <Info color="action" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>No Bus Assigned</Typography>
          <Typography variant="body2" color="textSecondary">
            You are not currently assigned to any school transport routes.
          </Typography>
        </Card>
      ) : (
        <Card sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <Box sx={{ display: "flex", justify: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <DirectionsBus sx={{ color: "primary.main", fontSize: 28 }} />
              <Box>
                <Typography variant="caption" color="textSecondary" fontWeight="bold">BUS NUMBER</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {transportInfo.vehicle?.vehicle_name || "School Bus"}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" color="textSecondary" fontWeight="bold">VEHICLE NO</Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: "monospace" }}>
                {transportInfo.vehicle?.vehicle_number}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: "flex", alignItems: "center", justify: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ContactPhone sx={{ color: "success.main", fontSize: 28 }} />
              <Box>
                <Typography variant="caption" color="textSecondary" fontWeight="bold">DRIVER</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {transportInfo.vehicle?.driver?.user?.name || "Driver"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {transportInfo.vehicle?.driver?.user?.phone || "No phone number listed"}
                </Typography>
              </Box>
            </Box>
            {transportInfo.vehicle?.driver?.user?.phone && (
              <IconButton
                component="a"
                href={`tel:${transportInfo.vehicle.driver.user.phone}`}
                color="primary"
                sx={{ bgcolor: "indigo.50", p: 1.2 }}
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
      )}
    </Container>
  );
}
