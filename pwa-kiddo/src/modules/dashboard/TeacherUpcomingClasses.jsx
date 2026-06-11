import { Card, CardContent, Typography, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { getMyTeacherTimetable } from "../teacher-timetable/teacherTimetable.api";

export default function TeacherUpcomingClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const today = new Date().toLocaleString("en-US", { weekday: "long" }).toLowerCase();
    const res = await getMyTeacherTimetable();
    const grouped = res.data?.data || res.data || {};
    setClasses(grouped[today] || []);
  }

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600}>
          Todays Classes
        </Typography>

        <Stack spacing={1} sx={{ mt: 2 }}>
          {classes.length === 0 && (
            <Typography color="text.secondary">
              No classes today
            </Typography>
          )}

          {classes.map((c) => (
            <Typography key={c.id}>
              {c.start_time} - {c.end_time} | Class {c.class?.class_name || c.class?.name || c.class_id} ({c.section?.name ?? c.section_id}) | {c.subject?.name || "Subject"}
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
