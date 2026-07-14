import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Stack,
  Paper,
  Button,
  Tabs,
  Tab,
  LinearProgress,
  Grid,
  Chip,
  Divider,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  ArrowBack,
  Warning,
  TrendingDown,
  School,
  People,
  Star,
  EmojiEvents,
  TrendingUp,
  HelpOutline,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { getAssetUrl } from "../../../utils/asset";

// Subject average bar
function SubjectBar({ name, score, isHardest }) {
  const theme = useTheme();
  const barColor = isHardest ? theme.palette.error.main : theme.palette.primary.main;

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Typography variant="body2" fontWeight={600} color="text.primary">
            {name}
          </Typography>
          {isHardest && (
            <Chip
              label="Lowest"
              size="small"
              color="error"
              variant="outlined"
              sx={{ height: 18, fontSize: "0.6rem", fontWeight: 800 }}
            />
          )}
        </Stack>
        <Typography variant="body2" fontWeight={700} sx={{ color: barColor }}>
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
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            bgcolor: barColor,
          },
        }}
      />
    </Box>
  );
}

// Custom SVG Histogram component
function CustomHistogram({ data }) {
  const theme = useTheme();
  const buckets = Object.entries(data || {});
  const maxVal = Math.max(...buckets.map(([_, v]) => v), 1);
  const height = 150;

  return (
    <Stack
      direction="row"
      spacing={3}
      alignItems="flex-end"
      justifyContent="space-around"
      sx={{ height: height + 30, pt: 2 }}
    >
      {buckets.map(([bucketName, value]) => {
        const pctHeight = (value / maxVal) * height;
        return (
          <Stack
            key={bucketName}
            spacing={1}
            alignItems="center"
            sx={{ flex: 1 }}
          >
            <Typography
              variant="caption"
              fontWeight="bold"
              sx={{ fontSize: "0.75rem", color: "text.secondary" }}
            >
              {value}
            </Typography>
            <Box
              sx={{
                width: "100%",
                maxWidth: 40,
                height: pctHeight || 4,
                bgcolor: value > 0 ? "primary.main" : "rgba(0,0,0,0.06)",
                borderRadius: "6px 6px 0 0",
                transition: "height 0.6s ease",
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "text.secondary",
                whiteSpace: "nowrap",
              }}
            >
              {bucketName}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}

// Shared card style
const cardSx = {
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.06)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
  overflow: "hidden",
};

export default function TeacherInsightsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClassIdx, setSelectedClassIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Safe destructuring using optional chaining to avoid runtime crashes
  const classAverage = analytics?.class_average ?? 0;
  const attendanceAverage = analytics?.attendance_average ?? 0;
  const totalStudents = analytics?.total_students ?? 0;
  const passCount = analytics?.pass_count ?? 0;
  const failCount = analytics?.fail_count ?? 0;
  const hardestSubject = analytics?.hardest_subject || null;
  const topPerformers = analytics?.top_performers || [];
  const atRisk = analytics?.at_risk || [];
  const distributions = analytics?.distributions || {};
  const subjectAverages = analytics?.subject_averages || [];

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
                class_name:
                  a.Class?.class_name ||
                  a.class?.class_name ||
                  `Class #${a.class_id}`,
                section_name:
                  a.Section?.name ||
                  a.section?.name ||
                  `Section #${a.section_id}`,
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
        <Alert severity="warning" sx={{ borderRadius: "12px" }}>
          You have no active class or subject assignments mapped.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/teacher/exams/create")}
          sx={{ mt: 2 }}
        >
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

      {/* Page Title */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography
          variant="h5"
          fontWeight={900}
          sx={{ fontFamily: "'Outfit', sans-serif" }}
        >
          Class Insights
        </Typography>
        <IconButton onClick={() => setHelpOpen(true)} size="small" color="primary">
          <HelpOutline />
        </IconButton>
      </Stack>

      {/* Class Section Switcher Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={selectedClassIdx}
          onChange={(e, val) => setSelectedClassIdx(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              fontWeight: 800,
              textTransform: "none",
              fontSize: "0.95rem",
            },
          }}
        >
          {classes.map((cls, index) => (
            <Tab
              key={index}
              label={`${cls.class_name} - ${cls.section_name}`}
            />
          ))}
        </Tabs>
      </Box>

      {loading ? (
        <Stack spacing={2}>
          <Stack direction="row" spacing={2}>
            <Skeleton variant="rounded" height={90} sx={{ flex: 1, borderRadius: "12px" }} />
            <Skeleton variant="rounded" height={90} sx={{ flex: 1, borderRadius: "12px" }} />
          </Stack>
          <Skeleton variant="rounded" height={200} sx={{ borderRadius: "12px" }} />
          <Skeleton variant="rounded" height={150} sx={{ borderRadius: "12px" }} />
        </Stack>
      ) : error || !analytics ? (
        <Alert severity="error" sx={{ borderRadius: "12px" }}>
          {error || "Analytics not available."}
        </Alert>
      ) : (
        <Stack spacing={2}>
          {/* Dashboard Summary Cards */}
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <Paper
                sx={{
                  p: 2,
                  ...cardSx,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: "uppercase", fontSize: "0.6rem" }}
                  display="block"
                >
                  Class Avg Mark
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  color="primary.main"
                  sx={{ mt: 0.5 }}
                >
                  {classAverage}%
                </Typography>
                <Stack
                  direction="row"
                  justifyContent="center"
                  spacing={0.5}
                  sx={{ mt: 1 }}
                >
                  <Chip
                    label={`Pass: ${passCount}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: "success.dark",
                    }}
                  />
                  <Chip
                    label={`Fail: ${failCount}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      color: "error.dark",
                    }}
                  />
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper
                sx={{
                  p: 2,
                  ...cardSx,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{ textTransform: "uppercase", fontSize: "0.6rem" }}
                  display="block"
                >
                  Avg Attendance
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={900}
                  color="success.main"
                  sx={{ mt: 0.5 }}
                >
                  {attendanceAverage}%
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  {totalStudents} students
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Hardest Subject Callout */}
          {hardestSubject && (
            <Card
              sx={{
                ...cardSx,
                borderColor: alpha(theme.palette.error.main, 0.2),
                bgcolor: alpha(theme.palette.error.main, 0.02),
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 4,
                      borderRadius: 2,
                      bgcolor: "error.main",
                      alignSelf: "stretch",
                      minHeight: 36,
                    }}
                  />
                  <Box>
                    <Typography
                      variant="caption"
                      fontWeight={800}
                      color="error.main"
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.6rem",
                      }}
                    >
                      Hardest Subject
                    </Typography>
                    <Typography variant="body2" fontWeight={900}>
                      {hardestSubject.subject} -{" "}
                      {hardestSubject.average}% class average
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Top Performers */}
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 2 }}
              >
                <EmojiEvents sx={{ fontSize: 18, color: "#f59e0b" }} />
                <Typography variant="subtitle2" fontWeight={900}>
                  Top Performers ({topPerformers.length})
                </Typography>
              </Stack>
              {topPerformers.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No marks data available yet.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {topPerformers.map((student) => (
                    <Stack
                      key={student.id}
                      direction="row"
                      alignItems="center"
                      spacing={1.5}
                      sx={{
                        p: 1.5,
                        borderRadius: "10px",
                        bgcolor: "rgba(0,0,0,0.015)",
                        border: "1px solid rgba(0,0,0,0.04)",
                      }}
                    >
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor:
                            student.rank === 1
                              ? "#fbbf24"
                              : student.rank === 2
                              ? "#d1d5db"
                              : student.rank === 3
                              ? "#d97706"
                              : "rgba(0,0,0,0.06)",
                          color: student.rank <= 3 ? "#fff" : "text.secondary",
                          fontWeight: 900,
                          fontSize: "0.7rem",
                        }}
                      >
                        {student.rank}
                      </Box>

                      {/* Student Avatar */}
                      <Avatar
                        src={getAssetUrl(student.avatar_url)}
                        alt={student.name}
                        sx={{
                          width: 28,
                          height: 28,
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          bgcolor: "primary.main",
                        }}
                      >
                        {student.name ? student.name.charAt(0).toUpperCase() : "?"}
                      </Avatar>

                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ flex: 1 }}
                        noWrap
                      >
                        {student.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        color="primary.main"
                      >
                        {student.percentage}%
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* At-Risk warning block */}
          <Card
            sx={{
              ...cardSx,
              borderColor: alpha(theme.palette.error.main, 0.15),
              bgcolor: alpha(theme.palette.error.main, 0.01),
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="subtitle2"
                fontWeight={900}
                sx={{
                  color: "error.main",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Warning /> At-Risk Students ({atRisk.length})
              </Typography>
              {atRisk.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No students are currently flagged as at-risk in this
                  class-section.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {atRisk.map((student) => (
                    <Paper
                      key={student.id}
                      sx={{
                        p: 2,
                        borderRadius: "10px",
                        border: "1px solid rgba(239, 68, 68, 0.1)",
                        boxShadow: "none",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          {/* Student Avatar */}
                          <Avatar
                            src={getAssetUrl(student.avatar_url)}
                            alt={student.name}
                            sx={{
                              width: 32,
                              height: 32,
                              fontSize: "0.8rem",
                              fontWeight: "bold",
                              bgcolor: "error.main",
                            }}
                          >
                            {student.name ? student.name.charAt(0).toUpperCase() : "?"}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {student.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="error.main"
                              display="block"
                              sx={{ mt: 0.5, fontWeight: 600 }}
                            >
                              {student.reasons}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{ textAlign: "right" }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              Score
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {student.academic_percentage}%
                            </Typography>
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                            >
                              Attend
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {student.attendance_percentage}%
                            </Typography>
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
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="subtitle2"
                fontWeight={900}
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <School color="primary" sx={{ fontSize: 18 }} /> Grade
                Distribution
              </Typography>
              <CustomHistogram data={distributions} />
            </CardContent>
          </Card>

          {/* Subject averages progress list */}
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="subtitle2"
                fontWeight={900}
                sx={{
                  mb: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Star color="primary" sx={{ fontSize: 18 }} /> Subject
                Breakdowns
              </Typography>
              {subjectAverages.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No subject average data found.
                </Typography>
              ) : (
                subjectAverages.map((sub, i) => (
                  <SubjectBar
                    key={i}
                    name={sub.subject}
                    score={sub.average}
                    isHardest={
                      hardestSubject?.subject === sub.subject
                    }
                  />
                ))
              )}
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Help Dialog Modal */}
      <Dialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px", p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1, fontFamily: "'Outfit', sans-serif" }}>
          Understanding Insights
        </DialogTitle>
        <DialogContent sx={{ py: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
              📈 Class Performance Metrics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Class Avg Mark</strong>: The average mark percentage scored by all students in this class-section.
              <br />
              • <strong>Attendance Avg</strong>: The average attendance percentage across all students in the class.
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
              ⚠️ At-Risk Students
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Highlights students needing urgent support because of:
              <br />
              • Attendance under <strong>75%</strong>
              <br />
              • Academic score under <strong>40%</strong>
              <br />
              • A sudden grade drop of more than <strong>15%</strong> compared to the previous test.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
              📊 Grade Distribution
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A bar chart displaying the count of students grouped by their mark percentages (0-40%, 41-60%, 61-80%, and 81-100%). This helps you understand the overall score distribution.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
              🏆 Top Performers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Displays the top 5 ranking students in this class-section.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
              ⭐ Subject Breakdowns
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Shows average marks scored in each subject class-wide. The subject with the lowest class average is highlighted with a <strong>Lowest</strong> tag to indicate it is the most difficult subject.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setHelpOpen(false)} variant="contained" sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}>
            Got It
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
