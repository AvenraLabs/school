import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Notifications as NotifIcon,
  EmojiEvents,
  FactCheck,
  AutoGraph,
  Book,
  TrendingUp,
  WarningAmber
} from "@mui/icons-material";
import { fetchStudentDashboard, fetchTeacherDashboard } from "./dashboard.api";
import { useAuth } from "../../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import TeacherDashboard from "./TeacherDashboard";
import { getAssetUrl } from "../../utils/asset";
import { getActivePosters } from "../notifications/notifications.api";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posters, setPosters] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        if (user.role === 'student') {
          const res = await fetchStudentDashboard();
          setData(res);
        } else if (user.role === 'teacher') {
          const res = await fetchTeacherDashboard();
          setData(res);
        }

        const postersRes = await getActivePosters();
        if (postersRes.success) {
          setPosters(postersRes.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();

    const refreshHandler = () => {
      getActivePosters().then(res => {
        if (res.success) setPosters(res.data || []);
      }).catch(console.error);
    };
    window.addEventListener("posters:refresh", refreshHandler);
    return () => {
      window.removeEventListener("posters:refresh", refreshHandler);
    };
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderPosters = () => {
    if (!posters || posters.length === 0) return null;
    return (
      <Stack spacing={2} sx={{ mb: 3 }}>
        {posters.map((poster) => (
          <Paper
            key={poster.id}
            sx={{
              p: 2.5,
              borderRadius: "16px",
              border: "1px solid",
              borderColor: "primary.light",
              background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              {poster.image_url && (
                <Box
                  sx={{
                    width: { xs: "100%", sm: 120 },
                    height: { xs: 120, sm: 90 },
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.06)",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={getAssetUrl(poster.image_url)}
                    alt="poster"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
              )}
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.dark" sx={{ mb: 0.5 }}>
                  📢 {poster.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                  {poster.message}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Stack>
    );
  };

  // TEACHER VIEW
  if (user.role === 'teacher') {
    const aiTokens = data?.ai_tokens || { remaining: 0, used: 0, total: 0 };
    const aiRemaining = aiTokens.remaining ?? 0;
    const aiUsed = aiTokens.used ?? 0;
    const aiTotal = aiTokens.total ?? 0;

    const homeworkSummary = data?.homework_summary || [];
    const pendingHomeworkCount = homeworkSummary.reduce((sum, hw) => sum + (hw.pending || 0), 0);
    const pendingReportCardsCount = data?.pending_report_cards ?? 0;
    const totalPendingTasks = pendingHomeworkCount + pendingReportCardsCount;

    return (
      <Box sx={{ pb: 2, bgcolor: 'background.default' }}>
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            pt: 4,
            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.dark} 100%)`,
            color: 'white',
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.25)}`
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar src={getAssetUrl(user.avatar_url)} sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
                {user.name?.[0] || "T"}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ opacity: 0.9, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Welcome back,
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {user.name || "Teacher"}
                </Typography>
              </Box>
            </Stack>
          </Stack>

          {/* Stats Grid inside header */}
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <Paper
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                  color: 'white',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.6rem', sm: '0.68rem' }, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    AI Tokens
                  </Typography>
                  <Typography sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' }, fontWeight: 950, lineHeight: 1.2 }}>
                    {aiRemaining}
                  </Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.75, fontSize: { xs: '0.58rem', sm: '0.68rem' } }}>
                    Used: {aiUsed} / {aiTotal}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={6}>
              <Paper
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: 'rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                  color: 'white',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.6rem', sm: '0.68rem' }, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    Grading Tasks
                  </Typography>
                  <Typography sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' }, fontWeight: 950, lineHeight: 1.2 }}>
                    {totalPendingTasks} Pending
                  </Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.75, fontSize: { xs: '0.58rem', sm: '0.68rem' } }}>
                    HW: {pendingHomeworkCount} • Exams: {pendingReportCardsCount}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Container sx={{ mt: 3 }}>
          {renderPosters()}
          <TeacherDashboard data={data} />
        </Container>
      </Box>
    );
  }

  // STUDENT VIEW (Default)
  const metrics = data?.metrics || {
    attendance: { percentage: 0 },
    ai_tokens: { remaining: 0, used: 0, total: 0 },
    homework_pending: 0
  };

  const studentName = data?.student?.name || user?.name || "Student";
  const attendance = metrics.attendance || { percentage: 0, weekly: {}, monthly: {} };
  const aiTokens = metrics.ai_tokens || { remaining: 0, used: 0, total: 0 };
  const performance = metrics.performance || {};
  const trend = performance.trend || [];
  const subjectAverages = performance.subject_averages || [];
  const latestExam = performance.latest_exam;
  const focusSubject = performance.focus_subject;
  const strongSubject = performance.strong_subject;
  const weakSyllabus = performance.weak_syllabus;

  // Shared card style matching teacher dashboard
  const cardSx = {
    borderRadius: '20px',
    border: '1px solid rgba(0,0,0,0.05)',
    boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
    overflow: 'hidden',
  };

  return (
    <Box sx={{ pb: 10, bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          pt: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2.5 }}>
          <Avatar src={getAssetUrl(user.avatar_url)} sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40, border: '2px solid rgba(255,255,255,0.3)' }}>
            {studentName[0]}
          </Avatar>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 500, display: 'block' }}>Welcome back,</Typography>
            <Typography variant="h6" fontWeight="bold">{studentName.split(' ')[0]}</Typography>
          </Box>
        </Stack>

        {/* Header stat pills */}
        <Grid container spacing={1.5}>
          <Grid item xs={6}>
            <Box
              onClick={() => navigate('/student/attendance')}
              sx={{
                p: 1.5,
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.62rem', display: 'block', mb: 0.3 }}>Attendance</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1 }}>{attendance.percentage}%</Typography>
              <Typography variant="caption" sx={{ opacity: 0.75, fontSize: '0.65rem' }}>Month: {attendance.monthly?.percentage ?? 0}%</Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box
              sx={{
                p: 1.5,
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: '14px',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.62rem', display: 'block', mb: 0.3 }}>AI Tokens</Typography>
              <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1 }}>{aiTokens.remaining}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.75, fontSize: '0.65rem' }}>Used: {aiTokens.used ?? 0} / {aiTokens.total ?? 0}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Container sx={{ mt: 3 }}>
        {renderPosters()}
        <Stack spacing={2}>

          {/* Latest Exam Card */}
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width: 4, borderRadius: 2, bgcolor: theme.palette.primary.main, alignSelf: 'stretch', minHeight: 40 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 900, color: 'text.primary', fontSize: '0.95rem', mb: 0.3 }}>
                    {latestExam ? latestExam.name : 'No published exam yet'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {latestExam
                      ? `Score: ${latestExam.obtained}/${latestExam.max_marks}`
                      : 'Will appear after report card is published'}
                  </Typography>
                </Box>
                {latestExam && (
                  <Chip
                    label={`${latestExam.percentage}%`}
                    size="small"
                    sx={{
                      fontWeight: 900,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontSize: '0.8rem',
                      borderRadius: '8px',
                    }}
                  />
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Exam Trend Card */}
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <TrendingUp sx={{ color: theme.palette.primary.main, fontSize: '1.2rem' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 850, letterSpacing: '-0.3px', fontSize: '1rem' }}>Exam Trend</Typography>
              </Stack>
              {trend.length > 0 ? (
                <Box sx={{ height: 130, display: 'flex', alignItems: 'flex-end', gap: 1, px: 0.5 }}>
                  {(() => {
                    const maxPct = Math.max(...trend.map(t => t.percentage), 1);
                    return trend.map((item) => {
                      const barH = Math.max(8, Math.round((item.percentage / maxPct) * 80));
                      return (
                        <Box key={`${item.id}-${item.date}`} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, mb: 0.4, lineHeight: 1, color: 'text.secondary' }}>
                            {item.percentage}%
                          </Typography>
                          <Box
                            sx={{
                              width: '100%',
                              height: barH,
                              borderRadius: '6px 6px 3px 3px',
                              background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                              transition: 'height 0.4s ease',
                            }}
                          />
                          <Typography sx={{ fontSize: '0.55rem', color: 'text.disabled', mt: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                            {item.name?.split(' ').slice(-1)[0] || item.date || ''}
                          </Typography>
                        </Box>
                      );
                    });
                  })()}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>Trend starts after the first published report card.</Typography>
              )}
            </CardContent>
          </Card>

          {/* Needs Attention Card */}
          <Card sx={{ ...cardSx, border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`, bgcolor: alpha(theme.palette.warning.main, 0.03) }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                <Box sx={{ width: 4, borderRadius: 2, bgcolor: theme.palette.warning.main, alignSelf: 'stretch', minHeight: 40 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 900, fontSize: '0.95rem', mb: 0.3 }}>Needs Attention</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {focusSubject
                      ? `${focusSubject.subject} avg is ${focusSubject.percentage}% across ${focusSubject.tests} test(s).`
                      : 'Subject focus will appear after marks are published.'}
                  </Typography>
                  {weakSyllabus?.syllabus && (
                    <Chip
                      size="small"
                      icon={<Book sx={{ fontSize: '0.8rem' }} />}
                      label={`${weakSyllabus.subject}: ${weakSyllabus.syllabus}`}
                      sx={{ mt: 1, maxWidth: '100%', borderRadius: '6px', bgcolor: alpha(theme.palette.warning.main, 0.1), color: 'warning.dark', fontWeight: 700, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                    />
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Subject Overview Card */}
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 850, letterSpacing: '-0.3px', fontSize: '1rem' }}>Subject Overview</Typography>
                {strongSubject && (
                  <Chip
                    size="small"
                    label={`Best: ${strongSubject.subject}`}
                    sx={{ fontWeight: 800, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.7rem', height: 20, borderRadius: '6px' }}
                  />
                )}
              </Stack>
              <Stack spacing={1.5}>
                {subjectAverages.length > 0 ? subjectAverages.slice(0, 5).map((subject) => (
                  <Box key={subject.subject}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>{subject.subject}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>{subject.percentage}%</Typography>
                    </Stack>
                    {/* Clean progress bar using Box instead of LinearProgress */}
                    <Box sx={{ height: 6, borderRadius: 6, bgcolor: 'rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                      <Box
                        sx={{
                          height: '100%',
                          width: `${subject.percentage}%`,
                          borderRadius: 6,
                          bgcolor: theme.palette.primary.main,
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </Box>
                  </Box>
                )) : (
                  <Box sx={{ textAlign: 'center', py: 3, bgcolor: '#f8fafc', borderRadius: '14px', border: '1px dashed rgba(0,0,0,0.06)' }}>
                    <Typography variant="body2" color="text.secondary">Subject analytics appear after marks are published.</Typography>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

        </Stack>
      </Container>
    </Box>
  );
}
