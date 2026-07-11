import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  Avatar,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { ArrowBack, TrendingUp, AutoGraph, School, CalendarMonth, EmojiEvents, HelpOutline } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

// Circular Ring component for Holistic Index
function RadialRing({ value, label, size = 120, strokeWidth = 10, color = "#4f46e5" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <Box sx={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Foreground Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease-out-in" }}
        />
      </svg>
      <Box sx={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary" }}>
          {value}%
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

// Custom SVG Line Chart
function CustomLineChart({ data }) {
  if (!data || data.length === 0) return <Typography variant="caption">No trend data available.</Typography>;

  const width = 500;
  const height = 200;
  const padding = 30;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Calculate points
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - (d.percentage / 100) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ overflow: "visible" }}>
      {/* Grid Lines */}
      {[0, 25, 50, 75, 100].map((level) => {
        const y = padding + chartHeight - (level / 100) * chartHeight;
        return (
          <g key={level}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(0,0,0,0.05)" strokeDasharray="3 3" />
            <text x={padding - 8} y={y + 4} fontSize="10" fill="#94a3b8" textAnchor="end">{level}%</text>
          </g>
        );
      })}

      {/* Connection Path */}
      {points.length > 1 && (
        <path
          d={pathD}
          fill="none"
          stroke="#4f46e5"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Nodes */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="5" fill="#4f46e5" stroke="#ffffff" strokeWidth="2.5" />
          <text x={p.x} y={p.y - 12} fontSize="11" fontWeight="bold" fill="#334155" textAnchor="middle">
            {p.percentage}%
          </text>
          <text x={p.x} y={height - 8} fontSize="10" fill="#64748b" textAnchor="middle">
            {p.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

// Custom SVG Radar Chart
function CustomRadarChart({ data }) {
  if (!data || data.length === 0) return <Typography variant="caption">No subject breakdown available.</Typography>;

  const size = 300;
  const center = size / 2;
  const maxRadius = size * 0.35;
  const totalAxes = data.length;

  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  };

  // Build grid rings (25%, 50%, 75%, 100%)
  const gridRings = [25, 50, 75, 100].map((percentage) => {
    const points = [];
    for (let i = 0; i < totalAxes; i++) {
      const coord = getCoordinates(i, percentage);
      points.push(`${coord.x},${coord.y}`);
    }
    return points.join(" ");
  });

  // Build data shape
  const dataPoints = data.map((d, index) => {
    const coord = getCoordinates(index, d.score);
    return `${coord.x},${coord.y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height={size} style={{ overflow: "visible" }}>
      {/* Grid concentric rings */}
      {gridRings.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="1"
        />
      ))}

      {/* Axis Lines & Labels */}
      {data.map((d, index) => {
        const outerCoord = getCoordinates(index, 100);
        const labelCoord = getCoordinates(index, 115);
        return (
          <g key={index}>
            <line x1={center} y1={center} x2={outerCoord.x} y2={outerCoord.y} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
            <text
              x={labelCoord.x}
              y={labelCoord.y + 4}
              fontSize="10"
              fontWeight="bold"
              fill="#64748b"
              textAnchor="middle"
            >
              {d.subject}
            </text>
          </g>
        );
      })}

      {/* Polygon representing scores */}
      {dataPoints && (
        <polygon
          points={dataPoints}
          fill="rgba(79, 70, 229, 0.15)"
          stroke="#4f46e5"
          strokeWidth="2.5"
        />
      )}

      {/* Data values nodes */}
      {data.map((d, index) => {
        const coord = getCoordinates(index, d.score);
        return (
          <circle key={index} cx={coord.x} cy={coord.y} r="3.5" fill="#4f46e5" />
        );
      })}
    </svg>
  );
}

export default function StudentPerformancePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await api.get("/analytics/student");
        setAnalytics(res.data?.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load performance analytics.");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <Container sx={{ mt: 8, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !analytics) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 3 }}>{error || "Analytics not available."}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/student/report-cards")} sx={{ mt: 2, fontWeight: 700 }}>
          Back
        </Button>
      </Container>
    );
  }

  const { holistic_index, academic_percentage, attendance_percentage, class_rank, trends, radar, strong_subject, focus_subject } = analytics;

  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 10 }}>
      {/* Back navigation */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/student/report-cards")}
        sx={{ mb: 2, textTransform: "none", fontWeight: 700 }}
      >
        Back to Reports
      </Button>

      <Stack spacing={3}>
        {/* Page title */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={900} sx={{ fontFamily: "'Outfit', sans-serif" }}>
              Performance & Insights
            </Typography>
          </Box>
          <IconButton onClick={() => setInfoOpen(true)} color="primary">
            <HelpOutline />
          </IconButton>
        </Stack>

        {/* Holistic Score Indicators */}
        <Card sx={{ borderRadius: 5, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "none" }}>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={3} alignItems="center">
              {/* Primary Holistic Ring */}
              <RadialRing value={holistic_index} label="Holistic Index" color="#4f46e5" size={120} strokeWidth={10} />
              
              {/* Supporting Academic and Attendance Rings */}
              <Stack direction="row" spacing={3} justifyContent="center" sx={{ width: "100%" }}>
                <RadialRing value={academic_percentage} label="Academics" color="#10b981" size={90} strokeWidth={8} />
                <RadialRing value={attendance_percentage} label="Attendance" color="#3b82f6" size={90} strokeWidth={8} />
              </Stack>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            <Stack direction="row" justifyContent="space-around" spacing={2}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary" display="block">CLASS RANK</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">{class_rank}</Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary" display="block">ATTENDANCE STATUS</Typography>
                <Typography variant="h6" fontWeight="bold" color={attendance_percentage >= 75 ? "success.main" : "error.main"}>
                  {attendance_percentage >= 75 ? "Good" : "At Risk"}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Subject Strength Warnings */}
        <Stack direction="row" spacing={2}>
          <Paper sx={{ 
            flex: 1, 
            p: 2.5, 
            borderRadius: "16px", 
            border: "1px solid rgba(16, 185, 129, 0.16)", 
            boxShadow: "none", 
            bgcolor: "rgba(16, 185, 129, 0.04)"
          }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <TrendingUp sx={{ fontSize: 18, color: "#10b981" }} />
              <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: "0.5px", textTransform: "uppercase", color: "text.secondary" }}>BEST SUBJECT</Typography>
            </Stack>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#065f46" }}>{strong_subject?.subject || "—"}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>{strong_subject ? `${strong_subject.score}% avg score` : "No exams graded"}</Typography>
          </Paper>

          <Paper sx={{ 
            flex: 1, 
            p: 2.5, 
            borderRadius: "16px", 
            border: "1px solid rgba(245, 158, 11, 0.16)", 
            boxShadow: "none", 
            bgcolor: "rgba(245, 158, 11, 0.04)"
          }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <AutoGraph sx={{ fontSize: 18, color: "#f59e0b" }} />
              <Typography variant="caption" fontWeight={800} sx={{ letterSpacing: "0.5px", textTransform: "uppercase", color: "text.secondary" }}>NEEDS FOCUS</Typography>
            </Stack>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ color: "#92400e" }}>{focus_subject?.subject || "—"}</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>{focus_subject ? `${focus_subject.score}% avg score` : "No exams graded"}</Typography>
          </Paper>
        </Stack>

        {/* Exam trend (Line chart) */}
        <Card sx={{ borderRadius: 5, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "none" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <School color="primary" sx={{ fontSize: 18 }} /> Exam Score Trend
            </Typography>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <CustomLineChart data={trends} />
            </Box>
          </CardContent>
        </Card>

        {/* Subject comparison (Radar chart) */}
        <Card sx={{ borderRadius: 5, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "none" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarMonth color="primary" sx={{ fontSize: 18 }} /> Subject Comparison
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CustomRadarChart data={radar} />
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {/* Explanation Dialog */}
      <Dialog 
        open={infoOpen} 
        onClose={() => setInfoOpen(false)}
        PaperProps={{
          sx: { borderRadius: "20px", p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: 1 }}>
          <HelpOutline color="primary" /> Understanding Your Scores
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                🎯 Holistic Index
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                A balanced score combining both studies and school engagement:
                <strong> 70% Academic marks + 30% School attendance</strong>.
                Consistently attending classes improves this score!
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                📚 Academics
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                The average percentage of marks obtained across all official examinations and tests graded during this academic year.
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight="bold" color="info.main">
                📅 Attendance
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                The percentage of school days you were marked present. Maintaining an attendance rate of <strong>75% or higher</strong> is recommended for steady progress.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoOpen(false)} variant="contained" sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}>
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

import { Divider } from "@mui/material";
