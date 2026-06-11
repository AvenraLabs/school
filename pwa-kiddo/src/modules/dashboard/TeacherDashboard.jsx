import { Grid, Card, CardContent, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { fetchTeacherDashboard } from "./dashboard.api";
import TeacherUpcomingClasses from "./TeacherUpcomingClasses";

export default function TeacherDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const dashboard = await fetchTeacherDashboard();
      const timetable = dashboard?.timetable || {};
      const periodsToday = Object.values(timetable).flat().length;

      setData({
        todayClasses: periodsToday,
        pendingHomework: dashboard?.homework_summary?.pending ?? 0,
        pendingReportCards: dashboard?.pending_report_cards ?? 0,
        classes: dashboard?.classes?.length ?? 0,
        aiTokens: dashboard?.ai_tokens ?? { remaining: 0, used: 0, total: 0 },
      });
    } catch {
      setData({
        todayClasses: 0,
        pendingHomework: 0,
        pendingReportCards: 0,
        classes: 0,
        aiTokens: { remaining: 0, used: 0, total: 0 },
      });
    }
  }

  if (!data) return null;

  return (
    <Grid container spacing={2}>
      <KpiCard title="Today's Classes" value={data.todayClasses} />
      <KpiCard title="My Classes" value={data.classes} />
      <KpiCard title="Pending Homework" value={data.pendingHomework} />
      <KpiCard title="Report Cards" value={data.pendingReportCards} />
      <KpiCard
        title="AI Tokens"
        value={`${data.aiTokens.remaining}/${data.aiTokens.total}`}
        subtitle={`Used: ${data.aiTokens.used}`}
      />
      <TeacherUpcomingClasses />
    </Grid>
  );
}

function KpiCard({ title, value, subtitle }) {
  return (
    <Grid item xs={6}>
      <Card>
        <CardContent>
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
}
