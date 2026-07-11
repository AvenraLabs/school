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
  Tabs,
  Tab,
  LinearProgress,
  Grid,
} from "@mui/material";
import { ArrowBack, Warning, TrendingDown, School, People, Star } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

// Horizontal scrolling subject averages component
function SubjectBar({ name, score }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="body2" fontWeight={600} color="text.primary">
          {name}
        </Typography>
        <Typography variant="body2" fontWeight={700} color="primary.main">
          {score}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: "rgba(0,0,0,0.04)",
          "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: "#4f46e5" },
        }}
      />
    </Box>
  );
}

// Custom SVG Histogram component
function CustomHistogram({ data }) {
  const buckets = Object.entries(data);
  const maxVal = Math.max(...buckets.map(([_, v]) => v), 1);

  const height = 150;

  return (
    <Stack direction="row" spacing={3} alignItems="flex-end" justifyContent="space-around" sx={{ height: height + 30, pt: 2 }}>
      {buckets.map(([bucketName, value]) => {
        const pctHeight = (value / maxVal) * height;
        return (
          <Stack key={bucketName} spacing={1} alignItems="center" sx={{ flex: 1 }}>
            <Typography variant="caption" fontWeight="bold" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
              {value}
            </Typography>
            <Box
              sx={{
                width: "100%",
                maxWidth: 40,
                height: pctHeight || 4, // min height to show baseline
                bgcolor: value > 0 ? "primary.main" : "rgba(0,0,0,0.06)",
                borderRadius: "6px 6px 0 0",
                transition: "height 0.6s ease",
              }}
            />
            <Typography variant="caption" sx={{ fontSize: "0.75rem", fontWeight: 700, color: "text.secondary", whiteSpace: "nowrap" }}>
              {bucketName}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

export default function TeacherInsightsPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClassIdx, setSelectedClassIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Load teacher assignments
  useEffect(() => {
    async function loadAssignments() {
      try {
        const res = await api.get("/teacher-assignments/teacher/me");
        const rawList = res.data?.data || [];
        const seen = new Set();
        const list = [];
        rawList.forEach((a) => {
          if (a.class_id && a.section_id) {
            const key = `${a.class_id}-${a.section_id}`;
            if (!seen.has(key)) {
              seen.add(key);
              list.push({
                class_id: a.class_id,
                section_id: a.section_id,
                class_name: a.Class?.class_name || a.class?.class_name || `Class #${a.class_id}`,
                section_name: a.Section?.name || a.section?.name || `Section #${a.section_id}`,
              });
            }
          }
        });
        setClasses(list);
        if (list.length > 0) {
          setSelectedClassIdx(0);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load teacher class assignments.");
      }
    }
    loadAssignments();
  }, []);

  // Load analytics when selected class changes
  useEffect(() => {
    if (classes.length === 0) return;
    const activeClass = classes[selectedClassIdx];
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await api.get("/analytics/teacher/class", {
          params: {
            class_id: activeClass.class_id,
            section_id: activeClass.section_id,
          },
        });
        setAnalytics(res.data?.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch analytics for this class.");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [classes, selectedClassIdx]);

  if (classes.length === 0 && !loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          You have no active class or subject assignments mapped.
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate("/teacher/exams/create")} sx={{ mt: 2 }}>
          Go back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 10 }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/teacher/exams/create")}
        sx={{ mb: 2, textTransform: "none", fontWeight: 700 }}
      >
        Back to Exams
      </Button>

      {/* Class Section Switcher Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={selectedClassIdx}
          onChange={(e, val) => setSelectedClassIdx(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": { fontWeight: 800, textTransform: "none", fontSize: "0.95rem" },
          }}
        >
          {classes.map((cls, index) => (
            <Tab key={index} label={`${cls.class_name} - ${cls.section_name}`} />
          ))}
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : error || !analytics ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>{error || "Analytics not available."}</Alert>
      ) : (
        <Stack spacing={3}>
          {/* Dashboard Summary Cards */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper sx={{ p: 2.5, borderRadius: 4, border: "1px solid rgba(0,0,0,0.04)", boxShadow: "none", textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary" display="block">CLASS AVG MARK</Typography>
                <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ mt: 0.5 }}>
                  {analytics.class_average}%
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2.5, borderRadius: 4, border: "1px solid rgba(0,0,0,0.04)", boxShadow: "none", textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary" display="block">AVG ATTENDANCE</Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ mt: 0.5 }}>
                  {analytics.attendance_average}%
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* At-Risk warning block */}
          <Card sx={{ borderRadius: 5, border: "1px solid rgba(239, 68, 68, 0.15)", bgcolor: "rgba(239, 68, 68, 0.01)", boxShadow: "none" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ color: "error.main", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <Warning /> At-Risk Students ({analytics.at_risk.length})
              </Typography>
              {analytics.at_risk.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Amazing! No students are currently flagged as at-risk in this class-section.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {analytics.at_risk.map((student) => (
                    <Paper
                      key={student.id}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: "1px solid rgba(239, 68, 68, 0.1)",
                        boxShadow: "none",
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {student.name}
                          </Typography>
                          <Typography variant="caption" color="error.main" display="block" sx={{ mt: 0.5, fontWeight: 600 }}>
                            {student.reasons}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={2} sx={{ textAlign: "right" }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">Score</Typography>
                            <Typography variant="body2" fontWeight="bold">{student.academic_percentage}%</Typography>
                          </Box>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">Attend</Typography>
                            <Typography variant="body2" fontWeight="bold">{student.attendance_percentage}%</Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Grade distribution Histogram */}
          <Card sx={{ borderRadius: 5, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "none" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <School color="primary" sx={{ fontSize: 18 }} /> Grade Distribution
              </Typography>
              <CustomHistogram data={analytics.distributions} />
            </CardContent>
          </Card>

          {/* Subject averages progress list */}
          <Card sx={{ borderRadius: 5, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "none" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
                <Star color="primary" sx={{ fontSize: 18 }} /> Subject Breakdowns
              </Typography>
              {analytics.subject_averages.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No subject average data found.
                </Typography>
              ) : (
                analytics.subject_averages.map((sub, i) => (
                  <SubjectBar key={i} name={sub.subject} score={sub.average} />
                ))
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
    </Container>
  );
}
