import React, { useState, useEffect } from "react";
import {
  Container,
  CircularProgress,
  Alert,
  Typography,
  Box,
  Stack,
  Tabs,
  Tab,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { AccessTime, School, CalendarMonth } from "@mui/icons-material";
import { useTeacherTimetable } from "./useTeacherTimetable";
import { useTeacherAssignments } from "./useTeacherAssignments";
import { getTimetable } from "./teacherTimetable.api";

export default function TeacherTimetablePage() {
  const { timetable, loading: myTimetableLoading, error: myTimetableError } = useTeacherTimetable();
  const { classTeacherSections } = useTeacherAssignments();
  const [activeTab, setActiveTab] = useState(0); // 0 = My Timetable, 1 = Class Timetable

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
                const isCovering = p.is_covering;          // this teacher substituting for someone else today
                const isSubstituted = p.is_substituted;    // this teacher is absent; someone else covering
                const className = p.class?.class_name || p.Class?.class_name || "";
                const sectionName = p.section?.name || p.Section?.name || "";
                const classSection = [className, sectionName].filter(Boolean).join("-");
                const start = fmtTime(p.start_time);
                const end = fmtTime(p.end_time);
                const dur = durationLabel(p.start_time, p.end_time);
                const timeLabel = `${start}${end ? ` - ${end}` : ""}`;

                // Border color: covering=secondary, substituted=info, break=grey, normal=primary
                const borderColor = isCovering
                  ? "secondary.main"
                  : isSubstituted
                  ? "info.main"
                  : isBreak
                  ? "grey.400"
                  : "primary.main";

                const bgColor = isCovering
                  ? "rgba(20,184,166,0.06)"
                  : isSubstituted
                  ? "rgba(14,165,233,0.06)"
                  : isBreak
                  ? "action.hover"
                  : "background.paper";

                return (
                  <Paper
                    key={`${p.id}-${idx}`}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderLeft: 6,
                      borderColor,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      bgcolor: bgColor,
                      opacity: isSubstituted ? 0.75 : 1,
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
                      {/* Subject + sub indicator row */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.75, flexWrap: "wrap" }}>
                        <Typography variant="subtitle1" fontWeight="bold" color={isBreak ? "text.secondary" : "text.primary"}>
                          {isBreak ? (p.title || "Break") : (p.subject?.name || "Subject")}
                        </Typography>
                        {isCovering && (
                          <Box
                            component="span"
                            sx={{
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: 0.4,
                              px: 0.75,
                              py: 0.2,
                              bgcolor: "secondary.main",
                              color: "white",
                              borderRadius: "4px",
                              lineHeight: 1.6,
                              textTransform: "uppercase",
                            }}
                          >
                            Substituting
                          </Box>
                        )}
                        {isSubstituted && (
                          <Box
                            component="span"
                            sx={{
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: 0.4,
                              px: 0.75,
                              py: 0.2,
                              bgcolor: "info.main",
                              color: "white",
                              borderRadius: "4px",
                              lineHeight: 1.6,
                              textTransform: "uppercase",
                            }}
                          >
                            Covered
                          </Box>
                        )}
                      </Box>

                      {!isBreak && classSection && (
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, mt: 0.5 }}>
                          <School fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            Class {classSection}
                          </Typography>
                        </Box>
                      )}

                      {/* "For: Original Teacher Name" when substituting */}
                      {isCovering && p.original_teacher_name && (
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                          For: {p.original_teacher_name}
                        </Typography>
                      )}
                      {/* "Covered by: Sub Name" when absent */}
                      {isSubstituted && p.substitute_teacher_name && (
                        <Typography variant="caption" color="info.main" display="block" sx={{ mt: 0.25 }}>
                          Covered by: {p.substitute_teacher_name}
                        </Typography>
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
              <Typography color="text.secondary">
                No periods scheduled for {activeDay.charAt(0).toUpperCase() + activeDay.slice(1)} yet.
              </Typography>
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
                      borderColor: isBreak ? "grey.400" : "primary.main",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      bgcolor: isBreak ? "action.hover" : "background.paper"
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
                      <Typography variant="subtitle1" fontWeight="bold" color={isBreak ? "text.secondary" : "text.primary"}>
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
            </Stack>
          )}
        </Box>
      )}
    </Container>
  );
}
