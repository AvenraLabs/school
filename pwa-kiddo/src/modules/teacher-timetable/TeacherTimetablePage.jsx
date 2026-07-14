import { useState, useEffect } from "react";
import {
  Container,
  CircularProgress,
  Alert,
  Typography,
  Box,
  Button,
  Stack,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { Edit, AccessTime, School, CalendarMonth } from "@mui/icons-material";
import { useTeacherTimetable } from "./useTeacherTimetable";
import ManageTimetableDialog from "./ManageTimetableDialog";
import { useTeacherAssignments } from "./useTeacherAssignments";
import { getTimetable } from "./teacherTimetable.api";

export default function TeacherTimetablePage() {
  const { timetable, loading: myTimetableLoading, error: myTimetableError, refresh } = useTeacherTimetable();
  const { classTeacherSections, loading: assignmentsLoading } = useTeacherAssignments();
  const [activeTab, setActiveTab] = useState(0); // 0 = My Timetable, 1 = Class Timetable
  const [showManage, setShowManage] = useState(false);

  // Class Timetable states
  const [selectedSection, setSelectedSection] = useState("");
  const [classTimetable, setClassTimetable] = useState(null);
  const [classTimetableLoading, setClassTimetableLoading] = useState(false);
  const [classTimetableError, setClassTimetableError] = useState(null);

  // Active day selection
  const today = new Date().toLocaleString("en-US", { weekday: "long" }).toLowerCase();
  const [activeDay, setActiveDay] = useState(
    ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].includes(today) ? today : "monday"
  );

  const canManage = (classTeacherSections?.length || 0) > 0;

  // Initialize selectedSection when assignments load
  useEffect(() => {
    if (classTeacherSections?.length > 0 && !selectedSection) {
      const first = classTeacherSections[0];
      setSelectedSection(`${first.class_id},${first.section_id}`);
    }
  }, [classTeacherSections, selectedSection]);

  // Load class timetable
  const loadClassTimetable = async () => {
    if (!selectedSection) return;
    const [classId, sectionId] = selectedSection.split(",");
    try {
      setClassTimetableLoading(true);
      setClassTimetableError(null);
      const res = await getTimetable({ class_id: Number(classId), section_id: Number(sectionId) });
      setClassTimetable(res?.data?.data ?? {});
    } catch (e) {
      console.error(e);
      setClassTimetableError("Failed to load class timetable");
    } finally {
      setClassTimetableLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 1 && selectedSection) {
      loadClassTimetable();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedSection]);

  const handleClassChange = (e) => {
    setSelectedSection(e.target.value);
  };

  // Helper formatting functions
  const fmtTime = (time) => time?.slice(0, 5) || "";
  const durationLabel = (start, end) => {
    if (!start || !end) return "";
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (Number.isNaN(mins) || mins <= 0) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  };

  const classScheduleLabel = (() => {
    if (!classTeacherSections || classTeacherSections.length === 0) return "Class Schedule";
    const first = classTeacherSections[0];
    const className = first?.Class?.class_name || first?.class?.class_name || "";
    const sectionName = first?.Section?.name || first?.section?.name || "";
    return className && sectionName ? `${className}-${sectionName} Schedule` : "Class Schedule";
  })();

  const classPeriods = classTimetable?.[activeDay] || [];

  return (
    <Container maxWidth="sm" sx={{ mt: 3, pb: 10 }}>
      {/* Title Header */}
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <CalendarMonth color="primary" />
        <Typography variant="h5" fontWeight="bold">
          Class Schedules
        </Typography>
      </Stack>

      {/* Tabs Selection (only if the teacher is also a class teacher/incharge) */}
      {canManage && (
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="fullWidth"
          sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="My Classes" />
          <Tab label={classScheduleLabel} />
        </Tabs>
      )}

      {/* TAB 0: TEACHER'S OWN TIMETABLE */}
      {activeTab === 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            Your personal teaching schedule across different sections.
          </Typography>

          {/* Day of Week Selector */}
          <Tabs
            value={activeDay}
            onChange={(_, val) => setActiveDay(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", borderRadius: 2 }}
          >
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((day) => (
              <Tab key={day} label={day.slice(0, 3).toUpperCase()} value={day} />
            ))}
          </Tabs>

          {myTimetableLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : myTimetableError ? (
            <Alert severity="error" sx={{ mt: 2 }}>{myTimetableError}</Alert>
          ) : !timetable?.[activeDay] || timetable[activeDay].length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, border: "1px dashed rgba(0,0,0,0.12)" }}>
              <Typography color="text.secondary">
                No classes scheduled for you on {activeDay.charAt(0).toUpperCase() + activeDay.slice(1)} yet.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2} sx={{ pb: 3 }}>
              {timetable[activeDay].map((p, idx) => {
                const isBreak = p.is_break;
                const className = p.class?.class_name || p.Class?.class_name || "";
                const sectionName = p.section?.name || p.Section?.name || "";
                const classSection = [className, sectionName].filter(Boolean).join("-");
                const start = fmtTime(p.start_time);
                const end = fmtTime(p.end_time);
                const dur = durationLabel(p.start_time, p.end_time);
                const timeLabel = `${start}${end ? ` - ${end}` : ""}`;

                return (
                  <Paper
                    key={p.id || idx}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderLeft: 6,
                      borderColor: isBreak ? "warning.main" : "primary.main",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      bgcolor: isBreak ? "warning.light" : "background.paper"
                    }}
                  >
                    <Box sx={{ mr: 2, color: "text.secondary" }}>
                      <AccessTime fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
                      <Typography variant="body2" fontWeight="bold" display="inline-block">
                        {timeLabel}
                      </Typography>
                      {dur && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {dur}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ textAlign: "right", flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color={isBreak ? "warning.dark" : "text.primary"}>
                        {isBreak ? (p.title || "Break") : (p.subject?.name || "Subject")}
                      </Typography>
                      {!isBreak && classSection && (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, mt: 0.5 }}>
                          <School fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            Class {classSection}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Box>
      )}

      {/* TAB 1: CLASS TIMETABLE (FOR INCHARGE SECTION) */}
      {activeTab === 1 && canManage && (
        <Box>
          {/* Multiple class section dropdown selection */}
          {classTeacherSections.length > 1 && (
            <FormControl fullWidth size="small" sx={{ mb: 3 }}>
              <InputLabel>Choose Class</InputLabel>
              <Select
                value={selectedSection}
                label="Choose Class"
                onChange={handleClassChange}
              >
                {classTeacherSections.map((sec) => (
                  <MenuItem key={`${sec.class_id},${sec.section_id}`} value={`${sec.class_id},${sec.section_id}`}>
                    Class {sec.Class?.class_name || sec.class_id} - Section {sec.Section?.name || sec.section_id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Day of Week Selector */}
          <Tabs
            value={activeDay}
            onChange={(_, val) => setActiveDay(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 3, borderBottom: 1, borderColor: "divider", bgcolor: "background.paper", borderRadius: 2 }}
          >
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].map((day) => (
              <Tab key={day} label={day.slice(0, 3).toUpperCase()} value={day} />
            ))}
          </Tabs>

          {classTimetableLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : classTimetableError ? (
            <Alert severity="error" sx={{ mt: 2 }}>{classTimetableError}</Alert>
          ) : classPeriods.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3, border: "1px dashed rgba(0,0,0,0.12)" }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No periods scheduled for {activeDay.charAt(0).toUpperCase() + activeDay.slice(1)} yet.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setShowManage(true)}
                disabled={assignmentsLoading}
              >
                Create Timetable
              </Button>
            </Paper>
          ) : (
            <Stack spacing={2} sx={{ pb: 3 }}>
              {classPeriods.map((p, idx) => {
                const isBreak = p.is_break;
                const teacherName = p.teacher?.name || p.teacher_name || "";
                const start = fmtTime(p.start_time);
                const end = fmtTime(p.end_time);
                const dur = durationLabel(p.start_time, p.end_time);
                const timeLabel = `${start}${end ? ` - ${end}` : ""}`;

                return (
                  <Paper
                    key={p.id || idx}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderLeft: 6,
                      borderColor: isBreak ? "warning.main" : "primary.main",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      bgcolor: isBreak ? "warning.light" : "background.paper"
                    }}
                  >
                    <Box sx={{ mr: 2, color: "text.secondary" }}>
                      <AccessTime fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />
                      <Typography variant="body2" fontWeight="bold" display="inline-block">
                        {timeLabel}
                      </Typography>
                      {dur && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {dur}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ textAlign: "right", flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold" color={isBreak ? "warning.dark" : "text.primary"}>
                        {isBreak ? (p.title || "Break") : (p.subject?.name || "Subject")}
                      </Typography>
                      {!isBreak && teacherName && (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, mt: 0.5 }}>
                          <School fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {teacherName}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                );
              })}

              <Card sx={{ mt: 3, borderRadius: 3 }}>
                <CardContent sx={{ py: "16px !important" }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Modify Class Timetable
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={() => setShowManage(true)}
                      disabled={assignmentsLoading}
                    >
                      Manage
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          )}
        </Box>
      )}

      {/* MANAGE DIALOG */}
      <ManageTimetableDialog
        open={showManage}
        onClose={() => setShowManage(false)}
        onSuccess={() => {
          refresh?.();
          loadClassTimetable();
        }}
        classTeacherSections={classTeacherSections}
      />
    </Container>
  );
}
