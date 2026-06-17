import { Grid, Card, CardContent, Typography, Box, Avatar } from "@mui/material";
import { AutoAwesome, Book, Assessment, Assignment } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import TeacherUpcomingClasses from "./TeacherUpcomingClasses";

export default function TeacherDashboard({ data }) {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "AI Tools",
      desc: "Generate lessons & quizzes",
      icon: <AutoAwesome />,
      path: "/teacher/ai-tools",
      color: "#8E24AA",
      bg: "#F3E5F5",
    },
    {
      title: "Homework & Diary",
      desc: "Assign & grade homework",
      icon: <Book />,
      path: "/teacher/diary",
      color: "#039BE5",
      bg: "#E1F5FE",
    },
    {
      title: "Exams & Reports",
      desc: "Grade exams & report cards",
      icon: <Assessment />,
      path: "/teacher/exams/create",
      color: "#2E7D32",
      bg: "#E8F5E9",
    },
    {
      title: "Approvals",
      desc: "Approve student updates",
      icon: <Assignment />,
      path: "/teacher/approvals",
      color: "#FB8C00",
      bg: "#FFF3E0",
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
      {/* Section 1: Today's Schedule */}
      <TeacherUpcomingClasses />

      {/* Section 2: Quick Actions */}
      <Box>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, letterSpacing: '-0.3px', fontSize: '1.1rem' }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action) => (
            <Grid item xs={6} key={action.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(0,0,0,0.05)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.01)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
                    borderColor: 'rgba(0,0,0,0.08)'
                  }
                }}
                onClick={() => navigate(action.path)}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Avatar sx={{ bgcolor: action.bg, color: action.color, mb: 1.5, width: 36, height: 36 }}>
                    {action.icon}
                  </Avatar>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.85rem', lineHeight: 1.2, mb: 0.5 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.3 }}>
                    {action.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
