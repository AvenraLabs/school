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
  Stack
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Menu as MenuIcon,
  Notifications as NotifIcon,
  EmojiEvents, // for Tokens
  FactCheck, // for Attendance
  Assignment, // for Homework
  ChevronRight,
  Timer,
  School
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
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
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
            <Paper
              sx={{
                p: 2,
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                borderRadius: 3
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Attendance</Typography>
              <Stack direction="row" alignItems="flex-end" spacing={0.5}>
                <Typography variant="h4" fontWeight="bold">
                  {metrics.attendance.percentage}%
                </Typography>
                <FactCheck sx={{ fontSize: 20, opacity: 0.8, mb: 1 }} />
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper
              sx={{
                p: 2,
                bgcolor: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                borderRadius: 3
              }}
            >
              <Typography variant="caption" sx={{ opacity: 0.8 }}>AI Tokens</Typography>
              <Stack direction="row" alignItems="flex-end" spacing={0.5}>
                <Typography variant="h4" fontWeight="bold">
                  {metrics.ai_tokens.remaining}/{metrics.ai_tokens.total}
                </Typography>
                <EmojiEvents sx={{ fontSize: 20, opacity: 0.8, mb: 1 }} />
              </Stack>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Used: {metrics.ai_tokens.used ?? 0}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Quick Actions / Content */}
      <Container sx={{ mt: 3 }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Quick Actions
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card
              sx={{ borderRadius: 4, display: 'flex', alignItems: 'center', p: 2, cursor: 'pointer' }}
              onClick={() => navigate('/student/diary')}
            >
              <Avatar sx={{ bgcolor: '#E1F5FE', color: '#039BE5', mr: 2 }}>
                <Assignment />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">Homework</Typography>
                <Typography variant="body2" color="text.secondary">
                  {metrics.homework_pending} pending assignments
                </Typography>
              </Box>
              <ChevronRight color="action" />
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card
              sx={{ borderRadius: 4, display: 'flex', alignItems: 'center', p: 2, cursor: 'pointer' }}
              onClick={() => navigate('/student/ai-chat')}
            >
              <Avatar sx={{ bgcolor: '#F3E5F5', color: '#8E24AA', mr: 2 }}>
                <EmojiEvents />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">Ask AI Tutor</Typography>
                <Typography variant="body2" color="text.secondary">
                  Helps with your studies
                </Typography>
              </Box>
              <ChevronRight color="action" />
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card
              sx={{ borderRadius: 4, display: 'flex', alignItems: 'center', p: 2, cursor: 'pointer' }}
              onClick={() => navigate('/student/report-cards')}
            >
              <Avatar sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', mr: 2 }}>
                <Assignment />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">Report Cards</Typography>
                <Typography variant="body2" color="text.secondary">
                  View your exam results
                </Typography>
              </Box>
              <ChevronRight color="action" />
            </Card>
          </Grid>
        </Grid>

      </Container>
    </Box>
  );
}
