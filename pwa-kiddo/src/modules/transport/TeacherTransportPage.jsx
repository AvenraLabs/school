import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Avatar,
  Divider,
  Chip
} from "@mui/material";
import { DirectionsBus, Class, Person, Place } from "@mui/icons-material";
import api from "../../api/axios";

export default function TeacherTransportPage() {
  const [loading, setLoading] = useState(true);
  const [studentTransportList, setStudentTransportList] = useState([]);

  useEffect(() => {
    fetchClassTransport();
  }, []);

  const fetchClassTransport = async () => {
    try {
      const res = await api.get("/teacher/transport/students");
      if (res.data?.success && res.data.data) {
        setStudentTransportList(res.data.data);
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
      <Paper sx={{ p: 3, borderRadius: 3, mb: 3, background: "linear-gradient(135deg, #0d9488, #0f766e)", color: "#fff" }}>
        <Typography variant="h6" fontWeight="bold">Class Bus Roster</Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>Track bus assignments for your assigned classes</Typography>
      </Paper>

      {studentTransportList.length === 0 ? (
        <Card sx={{ p: 4, borderRadius: 3, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <DirectionsBus color="action" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" fontWeight="bold" gutterBottom>No Active Bus Students</Typography>
          <Typography variant="body2" color="textSecondary">
            No students in your classes are currently assigned to school bus routes.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {studentTransportList.map((st) => (
            <Card key={st.id} sx={{ p: 2, borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: "1px solid #f1f5f9" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: "teal.50", color: "teal.700" }}>
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {st.student?.user?.name || "Student"}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
                    <Chip
                      size="small"
                      icon={<Class sx={{ fontSize: "12px" }} />}
                      label={`Class ${st.student?.class?.class_name || ""}-${st.student?.section?.name || ""}`}
                      sx={{ fontSize: "11px", height: "20px" }}
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <DirectionsBus sx={{ fontSize: 14 }} /> MAPPED BUS
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {st.vehicle?.vehicle_name || "Bus"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Place sx={{ fontSize: 14 }} /> PICKUP POINT
                  </Typography>
                  <Typography variant="body2" fontWeight="semibold">
                    {st.pickup_point || "—"}
                  </Typography>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}
