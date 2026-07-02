import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Paper,
  Tabs,
  Tab,
  Container,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Avatar,
  Chip
} from "@mui/material";
import { AccessTime, School, Person } from "@mui/icons-material";

export default function TimetableParentView({
  timetable,
  children = [],
  selectedStudentId,
  setSelectedStudentId,
}) {
  const slots = timetable?.timetable || timetable || {};
  const days = Object.keys(slots);

  const today = new Date()
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase();
  const [activeDay, setActiveDay] = useState(today);

  useEffect(() => {
    if (days.length > 0 && !days.includes(activeDay)) {
      setActiveDay(days[0] || "monday");
    }
  }, [days, activeDay]);

  const periods = slots[activeDay] || [];

  const fmtTime = (time) => time?.slice(0, 5) || "";
  const durationLabel = (start, end) => {
    if (!start || !end) return "";
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const mins = eh * 60 + em - (sh * 60 + sm);
    if (Number.isNaN(mins) || mins <= 0) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  };

  const activeChild = children.find(
    (c) => c.student?.id === selectedStudentId
  );
  const studentDetail = activeChild?.student;
  const studentName =
    studentDetail?.user?.name || studentDetail?.User?.name || "Student";
  const className = studentDetail?.class?.class_name || "";
  const sectionName = studentDetail?.section?.name || "";

  return (
    <Container sx={{ mt: 2 }}>
      {/* Child Selector & Context Header */}
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {studentName}
            </Typography>
            {(className || sectionName) && (
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                {className && (
                  <Chip
                    label={`Class ${className}`}
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                )}
                {sectionName && (
                  <Chip
                    label={`Section ${sectionName}`}
                    size="small"
                    sx={{ fontWeight: "bold" }}
                  />
                )}
              </Stack>
            )}
          </Box>
        </Box>

        {children.length > 1 && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="child-select-label">Select Child</InputLabel>
            <Select
              labelId="child-select-label"
              value={selectedStudentId || ""}
              label="Select Child"
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              {children.map((c) => (
                <MenuItem key={c.student?.id} value={c.student?.id}>
                  {c.student?.user?.name || c.student?.User?.name || "Student"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Weekday Tabs */}
      {days.length > 0 ? (
        <Tabs
          value={activeDay}
          onChange={(_, v) => setActiveDay(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        >
          {days.map((day) => (
            <Tab key={day} label={day.slice(0, 3).toUpperCase()} value={day} />
          ))}
        </Tabs>
      ) : null}

      {/* Timetable List */}
      <Stack spacing={2} sx={{ pb: 10 }}>
        {periods.length === 0 ? (
          <Typography textAlign="center" color="text.secondary" sx={{ mt: 4 }}>
            No classes scheduled for today.
          </Typography>
        ) : (
          periods.map((p, idx) => {
            const isBreak = p.is_break;
            const teacherName =
              p.teacher?.name ||
              p.teacher?.user?.name ||
              p.teacher_name ||
              "";
            const start = fmtTime(p.start_time);
            const end = fmtTime(p.end_time);
            const dur = durationLabel(p.start_time, p.end_time);
            const timeLabel = `${start}${end ? ` - ${end}` : ""}`;
            return (
              <Paper
                key={idx}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderLeft: 6,
                  borderColor: isBreak ? "warning.main" : "primary.main",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  bgcolor: isBreak ? "warning.light" : "background.paper",
                }}
              >
                <Box sx={{ mr: 2, color: "text.secondary" }}>
                  <AccessTime fontSize="small" />
                  <Typography variant="body2" fontWeight="bold">
                    {timeLabel}
                  </Typography>
                  {dur && (
                    <Typography variant="caption" color="text.secondary">
                      {dur}
                    </Typography>
                  )}
                </Box>

                <Box sx={{ textAlign: "right", flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {isBreak ? "Break" : p.subject?.name || "Subject"}
                  </Typography>
                  {!isBreak && teacherName && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 0.5,
                      }}
                    >
                      <School fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {teacherName}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            );
          })
        )}
      </Stack>
    </Container>
  );
}

