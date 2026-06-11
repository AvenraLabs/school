import { Container, Typography, Grid, Box } from "@mui/material";
import DashboardCard from "./DashboardCard";

export default function ParentDashboard({ data }) {
  const firstChild = Array.isArray(data?.children) ? data.children[0] : data?.students?.[0];
  const metrics = data?.metrics || firstChild?.metrics || {
    attendance: { percentage: 0 },
    homework_pending: 0,
    exams_upcoming: 0,
    notifications_unread: 0
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}>
      {/* 
         If multi-child support is fully backend ready, we would toggle children here.
         For now assume aggregated or single primary child metrics.
      */}

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <DashboardCard
            title="Attendance"
            value={`${metrics.attendance.percentage}%`}
          />
        </Grid>

        <Grid item xs={6}>
          <DashboardCard
            title="Homework"
            value={metrics.homework_pending}
            subtitle="Pending"
          />
        </Grid>

        <Grid item xs={6}>
          <DashboardCard
            title="Exams"
            value={metrics.exams_upcoming}
            subtitle="Upcoming"
          />
        </Grid>

        <Grid item xs={6}>
          <DashboardCard
            title="Notifications"
            value={metrics.notifications_unread}
            subtitle="Unread"
          />
        </Grid>
      </Grid>
    </Container>
  );
}
