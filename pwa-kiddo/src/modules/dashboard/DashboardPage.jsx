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
      <Box sx={{ pb: 2, bgcolor: 'background.default' }}>
        <Box
          sx={{
            p: 3,
            pt: 4,
            background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)', // Distinct color for Parents
            color: 'white',
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            boxShadow: '0 4px 20px rgba(255, 107, 107, 0.3)'
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar src={user.avatar_url} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                {user.name[0]}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Welcome,</Typography>
                <Typography variant="h6" fontWeight="bold">{user.name}</Typography>
              </Box>
            </Stack>
            <IconButton color="inherit" onClick={() => navigate('/parent/notifications')}>
              <NotifIcon />
            </IconButton>
          </Stack>
        </Box>

        <ParentDashboard data={data} />

        {/* Quick Actions / Content */}
        <Container sx={{ mt: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Quick Actions
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card
                sx={{ borderRadius: 4, display: 'flex', alignItems: 'center', p: 2, cursor: 'pointer' }}
                onClick={() => navigate('/parent/diary')}
              >
                <Avatar sx={{ bgcolor: '#E1F5FE', color: '#039BE5', mr: 2 }}>
                  <Assignment />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Check Homework</Typography>
                  <Typography variant="body2" color="text.secondary">
                    View pending assignments
                  </Typography>
                </Box>
                <ChevronRight color="action" />
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card
                sx={{ borderRadius: 4, display: 'flex', alignItems: 'center', p: 2, cursor: 'pointer' }}
                onClick={() => navigate('/parent/group-chat')}
              >
                <Avatar sx={{ bgcolor: '#F3E5F5', color: '#8E24AA', mr: 2 }}>
                  <MenuIcon />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Parent Group</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Discuss with other parents
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

  // TEACHER VIEW
  if (user.role === 'teacher') {
    return (
      <Box sx={{ pb: 2, bgcolor: 'background.default' }}>
        <Box
          sx={{
            p: 3,
            pt: 4,
            background: 'linear-gradient(135deg, #20BF6B 0%, #0FB9B1 100%)',
            color: 'white',
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
            boxShadow: '0 4px 20px rgba(32, 191, 107, 0.3)'
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Avatar src={user.avatar_url} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                {user.name?.[0] || "T"}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Welcome back,</Typography>
                <Typography variant="h6" fontWeight="bold">{user.name || "Teacher"}</Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Container sx={{ mt: 3 }}>
          <TeacherDashboard />

          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
            Quick Actions
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card
                sx={{ borderRadius: 4, display: 'flex', alignItems: 'center', p: 2, cursor: 'pointer' }}
                onClick={() => navigate('/teacher/diary')}
              >
                <Avatar sx={{ bgcolor: '#E1F5FE', color: '#039BE5', mr: 2 }}>
                  <Assignment />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Diary & Homework</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Manage class homework
                  </Typography>
                </Box>
                <ChevronRight color="action" />
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card
                sx={{ borderRadius: 4, display: 'flex', alignItems: 'center', p: 2, cursor: 'pointer' }}
                onClick={() => navigate('/teacher/class-sessions')}
              >
                <Avatar sx={{ bgcolor: '#FFF3E0', color: '#FB8C00', mr: 2 }}>
                  <Timer />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">Class Sessions</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start or end sessions
                  </Typography>
                </Box>
                <ChevronRight color="action" />
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card
                sx={{ borderRadius: 4, display: 'flex', alignItems: 'center', p: 2, cursor: 'pointer' }}
                onClick={() => navigate('/teacher/timetable')}
              >
                <Avatar sx={{ bgcolor: '#E8F5E9', color: '#2E7D32', mr: 2 }}>
                  <School />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">My Classes</Typography>
                  <Typography variant="body2" color="text.secondary">
                    View timetable
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
