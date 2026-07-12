import { Box, Typography, Paper, Stack } from "@mui/material";

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export default function TeacherTimetableView({ timetable }) {
  return DAYS.map((day) => {
    const periods = timetable?.[day] || [];

    if (!periods.length) return null;

    return (
      <Box key={day} sx={{ mb: 3 }}>
        <Typography variant="h6">{day.toUpperCase()}</Typography>

        <Stack spacing={1} sx={{ mt: 1 }}>
          {periods.map((p) => (
            <Paper key={p.id} sx={{ p: 1.5 }}>
              <Typography fontWeight={700} variant="body2">
                {p.subject?.name || p.title || "Period"}
                {(() => {
                  const className = p.class?.class_name || p.Class?.class_name || "";
                  const sectionName = p.section?.name || p.Section?.name || "";
                  const classSection = [className, sectionName].filter(Boolean).join("-");
                  return classSection ? ` · ${classSection}` : "";
                })()}
              </Typography>

              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.25 }}>
                {p.start_time} - {p.end_time}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Box>
    );
  });
}
