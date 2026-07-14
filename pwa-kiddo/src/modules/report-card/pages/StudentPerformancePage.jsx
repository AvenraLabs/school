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
  ToggleButton,
  ToggleButtonGroup,
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
  TrendingUp,
  TrendingDown,
  AutoGraph,
  School,
  CalendarMonth,
  EmojiEvents,
  ArrowUpward,
  ArrowDownward,
  Remove,
  HelpOutline,
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { getAssetUrl } from "../../../utils/asset";

// Custom SVG Line Chart
function TrendLineChart({ data }) {
  const theme = useTheme();
  if (!data || data.length === 0)
    return (
      <Typography variant="caption" color="text.secondary">
        No trend data available.
      </Typography>
    );

  const width = 500;
  const height = 200;
  const padding = 40;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * chartWidth;
    const y = padding + chartHeight - (d.percentage / 100) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const primaryColor = theme.palette.primary.main;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      style={{ overflow: "visible" }}
    >
      {[0, 25, 50, 75, 100].map((level) => {
        const y = padding + chartHeight - (level / 100) * chartHeight;
        return (
          <g key={level}>
            <line
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="rgba(0,0,0,0.05)"
              strokeDasharray="3 3"
            />
            <text
              x={padding - 8}
              y={y + 4}
              fontSize="10"
              fill="#94a3b8"
              textAnchor="end"
            >
              {level}%
            </text>
          </g>
        );
      })}

      {points.length > 1 && (
        <path
          d={pathD}
          fill="none"
          stroke={primaryColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r="5"
            fill={primaryColor}
            stroke="#ffffff"
            strokeWidth="2.5"
          />
          <text
            x={p.x}
            y={p.y - 12}
            fontSize="11"
            fontWeight="bold"
            fill="#334155"
            textAnchor="middle"
          >
            {p.percentage}%
          </text>
          <text
            x={p.x}
            y={height - 8}
            fontSize="10"
            fill="#64748b"
            textAnchor="middle"
          >
            {p.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

// Custom SVG Radar Chart
function SubjectRadarChart({ data }) {
  const theme = useTheme();
  if (!data || data.length === 0)
    return (
      <Typography variant="caption" color="text.secondary">
        No subject breakdown available.
      </Typography>
    );

  const size = 300;
  const center = size / 2;
  const maxRadius = size * 0.35;
  const totalAxes = data.length;

  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const gridRings = [25, 50, 75, 100].map((pct) => {
    const points = [];
    for (let i = 0; i < totalAxes; i++) {
      const c = getCoordinates(i, pct);
      points.push(`${c.x},${c.y}`);
    }
    return points.join(" ");
  });

  const dataPoints = data
    .map((d, i) => {
      const c = getCoordinates(i, d.score);
      return `${c.x},${c.y}`;
    })
    .join(" ");

  const primaryColor = theme.palette.primary.main;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height={size}
      style={{ overflow: "visible" }}
    >
      {gridRings.map((pts, i) => (
        <polygon
          key={i}
          points={pts}
          fill="none"
          stroke="rgba(0,0,0,0.06)"
          strokeWidth="1"
        />
      ))}

      {data.map((d, index) => {
        const outerCoord = getCoordinates(index, 100);
        const labelCoord = getCoordinates(index, 115);
        return (
          <g key={index}>
            <line
              x1={center}
              y1={center}
              x2={outerCoord.x}
              y2={outerCoord.y}
              stroke="rgba(0,0,0,0.06)"
              strokeWidth="1"
            />
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

      <polygon
        points={dataPoints}
        fill={alpha(primaryColor, 0.15)}
        stroke={primaryColor}
        strokeWidth="2.5"
      />

      {data.map((d, index) => {
        const c = getCoordinates(index, d.score);
        return (
          <circle key={index} cx={c.x} cy={c.y} r="3.5" fill={primaryColor} />
        );
      })}
    </svg>
  );
}

// Improvement arrow component
function ImprovementArrow({ change }) {
  if (change === null || change === undefined) return null;
  const isUp = change > 0;
  const isFlat = change === 0;

  return (
    <Stack direction="row" alignItems="center" spacing={0.3}>
      {isFlat ? (
        <Remove sx={{ fontSize: 14, color: "text.secondary" }} />
      ) : isUp ? (
        <ArrowUpward sx={{ fontSize: 14, color: "success.main" }} />
      ) : (
        <ArrowDownward sx={{ fontSize: 14, color: "error.main" }} />
      )}
      <Typography
        variant="caption"
        fontWeight={700}
        sx={{
          color: isFlat
            ? "text.secondary"
            : isUp
            ? "success.main"
            : "error.main",
        }}
      >
        {isFlat ? "No change" : `${change > 0 ? "+" : ""}${change}%`}
      </Typography>
    </Stack>
  );
}

export default function StudentPerformancePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [scope, setScope] = useState("section");
  const [helpOpen, setHelpOpen] = useState(false);

  const loadAnalytics = async (rankScope) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/analytics/student", {
        params: { scope: rankScope },
      });
      setAnalytics(res.data?.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load performance analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(scope);
  }, [scope]);

  const handleScopeChange = (_, newScope) => {
    if (newScope !== null) {
      setScope(newScope);
    }
  };

  // Shared card style
  const cardSx = {
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    overflow: "hidden",
  };

  if (loading && !analytics) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Skeleton variant="rounded" height={48} sx={{ mb: 2, borderRadius: "12px" }} />
        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
          <Skeleton variant="rounded" height={80} sx={{ flex: 1, borderRadius: "12px" }} />
          <Skeleton variant="rounded" height={80} sx={{ flex: 1, borderRadius: "12px" }} />
          <Skeleton variant="rounded" height={80} sx={{ flex: 1, borderRadius: "12px" }} />
        </Stack>
        <Skeleton variant="rounded" height={200} sx={{ mb: 2, borderRadius: "12px" }} />
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: "12px" }} />
      </Container>
    );
  }

  if (error || !analytics) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: "12px" }}>
          {error || "Analytics not available."}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/student/report-cards")}
          sx={{ mt: 2, fontWeight: 700 }}
        >
          Back
        </Button>
      </Container>
    );
  }

  const {
    academic_percentage,
    attendance_percentage,
    rank,
    total_students,
    improvement,
    trends,
    radar,
    strong_subject,
    focus_subject,
    leaderboard,
  } = analytics;

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

      <Stack spacing={2}>
        {/* Page title */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Performance & Insights
          </Typography>
          <IconButton onClick={() => setHelpOpen(true)} size="small" color="primary">
            <HelpOutline />
          </IconButton>
        </Stack>

        {/* Stat Cards Row */}
        <Stack direction="row" spacing={1.5}>
          {/* Overall % */}
          <Paper
            sx={{
              flex: 1,
              p: 2,
              ...cardSx,
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.6rem",
                display: "block",
                mb: 0.5,
              }}
            >
              Overall
            </Typography>
            <Typography
              variant="h5"
              fontWeight={900}
              color="primary.main"
              sx={{ lineHeight: 1 }}
            >
              {academic_percentage}%
            </Typography>
          </Paper>

          {/* Class Rank */}
          <Paper
            sx={{
              flex: 1,
              p: 2,
              ...cardSx,
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.6rem",
                display: "block",
                mb: 0.5,
              }}
            >
              Rank
            </Typography>
            <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1 }}>
              {rank}
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                fontWeight={600}
              >
                {" "}
                / {total_students}
              </Typography>
            </Typography>
          </Paper>

          {/* Attendance */}
          <Paper
            sx={{
              flex: 1,
              p: 2,
              ...cardSx,
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontSize: "0.6rem",
                display: "block",
                mb: 0.5,
              }}
            >
              Attendance
            </Typography>
            <Typography
              variant="h5"
              fontWeight={900}
              color={attendance_percentage >= 75 ? "success.main" : "error.main"}
              sx={{ lineHeight: 1 }}
            >
              {attendance_percentage}%
            </Typography>
          </Paper>
        </Stack>

        {/* Rank Scope Toggle */}
        <Stack direction="row" justifyContent="center">
          <ToggleButtonGroup
            value={scope}
            exclusive
            onChange={handleScopeChange}
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.75rem",
                px: 2,
                borderRadius: "8px !important",
              },
            }}
          >
            <ToggleButton value="section">Section Rank</ToggleButton>
            <ToggleButton value="class">Class-wide Rank</ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Improvement Indicator */}
        {improvement && (
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    color="text.secondary"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontSize: "0.6rem",
                    }}
                  >
                    vs {improvement.previous_exam}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {improvement.change > 0 ? (
                      <ArrowUpward
                        sx={{ fontSize: 20, color: "success.main" }}
                      />
                    ) : improvement.change < 0 ? (
                      <ArrowDownward
                        sx={{ fontSize: 20, color: "error.main" }}
                      />
                    ) : (
                      <Remove sx={{ fontSize: 20, color: "text.secondary" }} />
                    )}
                    <Typography
                      variant="h6"
                      fontWeight={900}
                      sx={{
                        color:
                          improvement.change > 0
                            ? "success.main"
                            : improvement.change < 0
                            ? "error.main"
                            : "text.secondary",
                      }}
                    >
                      {improvement.change > 0 ? "+" : ""}
                      {improvement.change}%
                    </Typography>
                  </Stack>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="caption" color="text.secondary">
                    {improvement.previous_exam}: {improvement.previous}%
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={800}
                    display="block"
                  >
                    {improvement.current_exam}: {improvement.current}%
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Best Subject / Needs Focus */}
        <Stack direction="row" spacing={1.5}>
          <Paper
            sx={{
              flex: 1,
              p: 2,
              ...cardSx,
              bgcolor: alpha(theme.palette.success.main, 0.04),
              borderColor: alpha(theme.palette.success.main, 0.15),
            }}
          >
            <Stack
              direction="row"
              spacing={0.6}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <TrendingUp sx={{ fontSize: 14, color: "success.main" }} />
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{
                  textTransform: "uppercase",
                  color: "text.secondary",
                  fontSize: "0.6rem",
                }}
              >
                Best Subject
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              fontWeight={900}
              color="success.dark"
              noWrap
            >
              {strong_subject?.subject || "--"}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                {strong_subject ? `${strong_subject.score}% avg` : "No data"}
              </Typography>
              {strong_subject?.change != null && (
                <ImprovementArrow change={strong_subject.change} />
              )}
            </Stack>
          </Paper>

          <Paper
            sx={{
              flex: 1,
              p: 2,
              ...cardSx,
              bgcolor: alpha(theme.palette.warning.main, 0.04),
              borderColor: alpha(theme.palette.warning.main, 0.15),
            }}
          >
            <Stack
              direction="row"
              spacing={0.6}
              alignItems="center"
              sx={{ mb: 0.5 }}
            >
              <AutoGraph sx={{ fontSize: 14, color: "warning.main" }} />
              <Typography
                variant="caption"
                fontWeight={800}
                sx={{
                  textTransform: "uppercase",
                  color: "text.secondary",
                  fontSize: "0.6rem",
                }}
              >
                Needs Focus
              </Typography>
            </Stack>
            <Typography
              variant="body2"
              fontWeight={900}
              color="warning.dark"
              noWrap
            >
              {focus_subject?.subject || "--"}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                {focus_subject ? `${focus_subject.score}% avg` : "No data"}
              </Typography>
              {focus_subject?.change != null && (
                <ImprovementArrow change={focus_subject.change} />
              )}
            </Stack>
          </Paper>
        </Stack>

        {/* Exam Score Trend */}
        <Card sx={cardSx}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <School color="primary" sx={{ fontSize: 18 }} />
              <Typography variant="subtitle2" fontWeight={900}>
                Exam Score Trend
              </Typography>
            </Stack>
            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <TrendLineChart data={trends} />
            </Box>
          </CardContent>
        </Card>

        {/* Subject Comparison Radar */}
        <Card sx={cardSx}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <CalendarMonth color="primary" sx={{ fontSize: 18 }} />
              <Typography variant="subtitle2" fontWeight={900}>
                Subject Comparison
              </Typography>
            </Stack>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <SubjectRadarChart data={radar} />
            </Box>
          </CardContent>
        </Card>

        {/* Class Leaderboard */}
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
                {scope === "section" ? "Section" : "Class"} Leaderboard
              </Typography>
            </Stack>

            {!leaderboard || leaderboard.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Leaderboard will appear after marks are published.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {leaderboard.map((entry, idx) => {
                  // Gap separator before own rank if rank > 5
                  const showGap =
                    idx > 0 &&
                    entry.is_me &&
                    entry.rank > 5 &&
                    leaderboard[idx - 1].rank !== entry.rank - 1;

                  return (
                    <Box key={`${entry.rank}-${idx}`}>
                      {showGap && (
                        <Divider sx={{ my: 0.5, borderStyle: "dashed" }} />
                      )}
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                        sx={{
                          p: 1.5,
                          borderRadius: "10px",
                          bgcolor: entry.is_me
                            ? alpha(theme.palette.primary.main, 0.06)
                            : "transparent",
                          border: entry.is_me
                            ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                            : "1px solid transparent",
                        }}
                      >
                        {/* Rank badge */}
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor:
                              entry.rank === 1
                                ? "#fbbf24"
                                : entry.rank === 2
                                ? "#d1d5db"
                                : entry.rank === 3
                                ? "#d97706"
                                : "rgba(0,0,0,0.06)",
                            color:
                              entry.rank <= 3 ? "#fff" : "text.secondary",
                            fontWeight: 900,
                            fontSize: "0.75rem",
                          }}
                        >
                          {entry.rank}
                        </Box>

                        {/* Student Avatar */}
                        <Avatar
                          src={getAssetUrl(entry.avatar_url)}
                          alt={entry.name}
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            bgcolor: entry.is_me ? "primary.main" : "grey.400",
                          }}
                        >
                          {entry.name ? entry.name.charAt(0).toUpperCase() : "?"}
                        </Avatar>

                        <Typography
                          variant="body2"
                          fontWeight={entry.is_me ? 900 : 600}
                          sx={{ flex: 1 }}
                          noWrap
                        >
                          {entry.name}
                          {entry.is_me && (
                            <Typography
                              component="span"
                              variant="caption"
                              color="primary.main"
                              fontWeight={800}
                              sx={{ ml: 0.5 }}
                            >
                              (You)
                            </Typography>
                          )}
                        </Typography>

                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color={
                            entry.is_me ? "primary.main" : "text.secondary"
                          }
                        >
                          {entry.percentage}%
                        </Typography>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>

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
              📈 Stat Cards (Top Row)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Overall Marks %</strong>: The combined average of all exams in the current school term.
              <br />
              • <strong>Class Rank</strong>: Your child's standing. You can toggle between <em>Section Rank</em> (only their classroom, e.g. 6A) or <em>Class Rank</em> (the entire 6th grade).
              <br />
              • <strong>Attendance %</strong>: Percentage of school days attended. Anything below 75% triggers an alert.
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
              📊 Exam Score Trend
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This line chart shows how your child's average marks change from one exam to the next (e.g. Unit Test 1 ➡️ Mid-Term ➡️ Final). A line moving upwards shows improvement.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
              🕸️ Subject Comparison Chart
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This is a Radar chart showing your child's performance in each subject:
              <br />
              • The center is <strong>0%</strong> (low score) and the outer edges are <strong>100%</strong> (perfect score).
              <br />
              • The blue shaded area highlights your child's average in each subject.
              <br />
              • A shape stretched far to one side means high strength in that specific subject, while a large, balanced shape indicates high performance across all subjects.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="primary.main" gutterBottom>
              🏆 Class Leaderboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Highlights the top 5 students in the class/section to encourage healthy academic competition. If your child is not in the top 5, their personal rank will be shown at the bottom.
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
