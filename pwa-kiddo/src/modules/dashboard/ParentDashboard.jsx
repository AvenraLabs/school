import { Container, Grid } from "@mui/material";
import DashboardCard from "./DashboardCard";
import { FactCheck, Assignment, School, Notifications } from "@mui/icons-material";

export default function ParentDashboard({ data }) {
  const firstChild = Array.isArray(data?.children) ? data.children[0] : data?.students?.[0];
  const metrics = data?.metrics || firstChild?.metrics || {
    attendance: { percentage: 0 },
    homework_pending: 0,
    exams_upcoming: 0,
    notifications_unread: 0
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 3, px: 2 }}>
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={6} sx={{ display: "flex" }}>
          <DashboardCard
            title="Attendance"
            value={`${metrics.attendance?.percentage ?? 0}%`}
            subtitle="Overall Presence"
            icon={<FactCheck sx={{ fontSize: 20 }} />}
            iconColor="#4f46e5"
            iconBg="rgba(79, 70, 229, 0.08)"
          />
        </Grid>

        <Grid item xs={6} sx={{ display: "flex" }}>
          <DashboardCard
            title="Homework"
            value={metrics.homework_pending ?? 0}
            subtitle="Pending Tasks"
            icon={<Assignment sx={{ fontSize: 20 }} />}
            iconColor="#e11d48"
            iconBg="rgba(225, 29, 72, 0.08)"
          />
        </Grid>

        <Grid item xs={6} sx={{ display: "flex" }}>
          <DashboardCard
            title="Exams"
            value={metrics.exams_upcoming ?? 0}
            subtitle="Upcoming Tests"
            icon={<School sx={{ fontSize: 20 }} />}
            iconColor="#0ea5e9"
            iconBg="rgba(14, 165, 233, 0.08)"
          />
        </Grid>

        <Grid item xs={6} sx={{ display: "flex" }}>
          <DashboardCard
            title="Alerts"
            value={metrics.notifications_unread ?? 0}
            subtitle="Unread Messages"
            icon={<Notifications sx={{ fontSize: 20 }} />}
            iconColor="#d97706"
            iconBg="rgba(217, 119, 6, 0.08)"
          />
        </Grid>
      </Grid>
    </Container>
  );
}
