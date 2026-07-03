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
  Chip,
  LinearProgress
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
import { fetchStudentDashboard, fetchParentDashboard, fetchTeacherDashboard } from "./dashboard.api";
import { useAuth } from "../../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import ParentDashboard from "./ParentDashboard";
import TeacherDashboard from "./TeacherDashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        if (user.role === 'student') {
          const res = await fetchStudentDashboard();
          setData(res);
        } else if (user.role === 'parent') {
          const res = await fetchParentDashboard();
          setData(res);
        } else if (user.role === 'teacher') {
          const res = await fetchTeacherDashboard();
          setData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // PARENT VIEW
  if (user.role === 'parent') {
    return (
      <Box sx={{ pb: 4, bgcolor: '#f8fafc', minHeight: 'calc(100vh - 120px)' }}>
        <Box
          sx={{
            p: 3,
            pt: 4,
            background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', // Premium Indigo-to-Blue gradient
            color: 'white',
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.12)'
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar src={user.avatar_url} sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 44, height: 44, border: '2px solid rgba(255,255,255,0.3)' }}>
                {user.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ opacity: 0.85, fontSize: '12px', fontWeight: 500 }}>Welcome,</Typography>
                <Typography variant="h6" fontWeight="bold" sx={{ fontFamily: "'Outfit', sans-serif" }}>{user.name}</Typography>
              </Box>
            </Stack>
            <IconButton color="inherit" onClick={() => navigate('/parent/notifications')} sx={{ bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
              <NotifIcon />
            </IconButton>
          </Stack>
        </Box>

        <ParentDashboard data={data} />
      </Box>
    );
  }

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
            p: 3,
            pt: 4,
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            color: 'white',
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.25)'
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Avatar src={user.avatar_url} sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 40, height: 40 }}>
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
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper
                sx={{
                  p: 2,
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
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    AI Tokens
                  </Typography>
                  <Typography variant="h5" fontWeight="950">
                    {aiRemaining}
                  </Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.75, fontSize: '0.68rem' }}>
                    Used: {aiUsed} / {aiTotal}
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={6}>
              <Paper
                sx={{
                  p: 2,
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
                  <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                    Grading Tasks
                  </Typography>
                  <Typography variant="h5" fontWeight="950">
                    {totalPendingTasks} Pending
                  </Typography>
                </Box>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ opacity: 0.75, fontSize: '0.68rem' }}>
                    HW: {pendingHomeworkCount} | Exams: {pendingReportCardsCount}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Container sx={{ mt: 3 }}>
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
  const compactStatSx = {
    p: 1.35,
    bgcolor: 'rgba(255,255,255,0.14)',
    backdropFilter: 'blur(10px)',
    color: 'white',
    borderRadius: 3,
    border: '1px solid rgba(255,255,255,0.12)',
  };

  return (
    <Box sx={{ pb: 2, bgcolor: 'background.default' }}>
      {/* Header Section */}
      <Box
        sx={{
          p: 3,
          pt: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar src={user.avatar_url} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              {studentName[0]}
            </Avatar>
            <Typography variant="h6" fontWeight="bold">
              Welcome back, {studentName.split(' ')[0]}
            </Typography>
          </Stack>
        </Stack>

        {/* Stats Grid */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Paper sx={compactStatSx}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Attendance</Typography>
              <Stack direction="row" alignItems="center" spacing={0.7}>
                <Typography variant="h6" fontWeight={950}>
                  {attendance.percentage}%
                </Typography>
                <FactCheck sx={{ fontSize: 18, opacity: 0.8 }} />
              </Stack>
              <Typography variant="caption" sx={{ opacity: 0.74 }}>
                Month {attendance.monthly?.percentage ?? 0}%
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper sx={compactStatSx}>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>AI Tokens</Typography>
              <Stack direction="row" alignItems="center" spacing={0.7}>
                <Typography variant="h6" fontWeight={950}>
                  {aiTokens.remaining}
                </Typography>
                <EmojiEvents sx={{ fontSize: 18, opacity: 0.8 }} />
              </Stack>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Used {aiTokens.used ?? 0} / {aiTokens.total ?? 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Container sx={{ mt: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.6 }}>
          <Box>
            <Typography variant="h6" fontWeight={900}>
              Learning Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Small signals that help parents and students act early.
            </Typography>
          </Box>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, boxShadow: '0 10px 28px rgba(15,23,42,0.06)' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1.4}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main' }}>
                    <AutoGraph />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" fontWeight={900}>
                      {latestExam ? latestExam.name : 'No published exam yet'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Latest score {latestExam ? `${latestExam.percentage}% (${latestExam.obtained}/${latestExam.max_marks})` : 'will appear after report card publish'}
                    </Typography>
                  </Box>
                  {latestExam && <Chip color="primary" label={`${latestExam.percentage}%`} sx={{ fontWeight: 900 }} />}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, boxShadow: 'none', border: `1px solid ${alpha(theme.palette.divider, 0.9)}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.4 }}>
                  <TrendingUp color="primary" />
                  <Typography variant="subtitle1" fontWeight={900}>Exam Trend</Typography>
                </Stack>
                {trend.length > 0 ? (
                  <Stack direction="row" alignItems="flex-end" spacing={1} sx={{ height: 92 }}>
                    {trend.map((item) => (
                      <Box key={`${item.id}-${item.date}`} sx={{ flex: 1, textAlign: 'center' }}>
                        <Box
                          sx={{
                            height: `${Math.max(10, item.percentage)}%`,
                            minHeight: 10,
                            borderRadius: '10px 10px 4px 4px',
                            background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          }}
                        />
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: 800 }}>
                          {item.percentage}%
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">Trend starts after the first published report card.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, boxShadow: 'none', border: `1px solid ${alpha(theme.palette.warning.main, 0.22)}`, bgcolor: alpha(theme.palette.warning.main, 0.05) }}>
              <CardContent>
                <Stack direction="row" alignItems="flex-start" spacing={1.4}>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.14), color: 'warning.dark' }}>
                    <WarningAmber />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={900}>Needs Attention</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {focusSubject ? `${focusSubject.subject} average is ${focusSubject.percentage}% across ${focusSubject.tests} test(s).` : 'Subject focus will appear after marks are published.'}
                    </Typography>
                    {weakSyllabus?.syllabus && (
                      <Chip
                        size="small"
                        icon={<Book />}
                        label={`${weakSyllabus.subject}: ${weakSyllabus.syllabus}`}
                        sx={{ mt: 1, maxWidth: '100%', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                      />
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, boxShadow: 'none', border: `1px solid ${alpha(theme.palette.divider, 0.9)}` }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 1 }}>Attendance Check</Typography>
                {[
                  ['This week', attendance.weekly?.percentage ?? 0, attendance.weekly],
                  ['This month', attendance.monthly?.percentage ?? 0, attendance.monthly],
                ].map(([label, percentage, period]) => (
                  <Box key={label} sx={{ mb: 1.2 }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={800}>{label}</Typography>
                      <Typography variant="body2" color="text.secondary">{percentage}% · {period?.present ?? 0}/{period?.total ?? 0}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      sx={{ mt: 0.7, height: 7, borderRadius: 7 }}
                    />
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ borderRadius: 4, boxShadow: 'none', border: `1px solid ${alpha(theme.palette.divider, 0.9)}` }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={900}>Subject Overview</Typography>
                  {strongSubject && <Chip size="small" color="success" label={`Best: ${strongSubject.subject}`} />}
                </Stack>
                <Stack spacing={1.2}>
                  {subjectAverages.length > 0 ? subjectAverages.slice(0, 5).map((subject) => (
                    <Box key={subject.subject}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" fontWeight={800}>{subject.subject}</Typography>
                        <Typography variant="body2" color="text.secondary">{subject.percentage}%</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={subject.percentage}
                        sx={{ mt: 0.6, height: 7, borderRadius: 7 }}
                      />
                    </Box>
                  )) : (
                    <Typography variant="body2" color="text.secondary">
                      Subject analytics will appear after published marks.
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
}
