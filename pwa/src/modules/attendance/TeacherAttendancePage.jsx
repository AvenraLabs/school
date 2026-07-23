import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Box,
  Button,
  TextField,
  MenuItem,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  PauseCircle,
  Search,
  Save,
  AccessTime,
  CalendarMonth,
} from "@mui/icons-material";
import { useAuth } from "../../auth/AuthProvider";
import { getMyTeacherAssignments } from "../teacher-timetable/teacherTimetable.api";
import {
  getDailyAttendance,
  markAttendance,
  listAllClasses,
  listSectionsForClass,
} from "./attendance.api";
import { useSearchParams } from "react-router-dom";
import { getAssetUrl } from "../../utils/asset";

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Navigation / Filter States
  const [classSectionOptions, setClassSectionOptions] = useState([]);
  const [selectedClassSectionKey, setSelectedClassSectionKey] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Data / Loading States
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Audit info
  const [auditInfo, setAuditInfo] = useState({ lastUpdatedBy: "", lastUpdatedAt: "" });

  // Notifications / Feedback
  const [alertMsg, setAlertMsg] = useState({ text: "", type: "success" });
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // 1️⃣ Load class/section filters based on user role
  useEffect(() => {
    async function loadFilters() {
      try {
        setLoadingFilters(true);
        let uniqueOptions = [];

        if (user.role === "teacher") {
          // Fetch assignments for teacher
          const res = await getMyTeacherAssignments();
          const items = res?.data?.data ?? res?.data?.items ?? [];
          setAssignments(items);

          const seenKeys = new Set();
          items.forEach((a) => {
            const classObj = a.Class || a.class;
            const sectionObj = a.Section || a.section;
            if (classObj && sectionObj) {
              const key = `${classObj.id}-${sectionObj.id}`;
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                uniqueOptions.push({
                  key,
                  class_id: classObj.id,
                  section_id: sectionObj.id,
                  label: `Class ${classObj.class_name} - ${sectionObj.name}`,
                });
              }
            }
          });
        } else {
          // School Admin: load all classes
          const res = await listAllClasses();
          const items = res?.data?.data ?? res?.data?.items ?? [];

          // Load sections for all classes in parallel
          await Promise.all(
            items.map(async (c) => {
              try {
                const secRes = await listSectionsForClass(c.id);
                const secs = secRes?.data?.data ?? secRes?.data?.items ?? [];
                secs.forEach((s) => {
                  uniqueOptions.push({
                    key: `${c.id}-${s.id}`,
                    class_id: c.id,
                    section_id: s.id,
                    label: `Class ${c.class_name} - ${s.name}`,
                  });
                });
              } catch (e) {
                console.error(`Failed to load sections for class ${c.id}`, e);
              }
            })
          );
        }

        // Sort options numerically/alphabetically by class & section name
        uniqueOptions.sort((a, b) =>
          a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" })
        );
        setClassSectionOptions(uniqueOptions);

        // Auto-select class & section from URL search params or default to first
        const urlClassId = searchParams.get("class_id");
        const urlSectionId = searchParams.get("section_id");

        if (urlClassId && urlSectionId) {
          const key = `${urlClassId}-${urlSectionId}`;
          if (uniqueOptions.some((opt) => opt.key === key)) {
            setSelectedClassSectionKey(key);
            setSelectedClassId(urlClassId);
            setSelectedSectionId(urlSectionId);
          } else if (uniqueOptions.length > 0) {
            const first = uniqueOptions[0];
            setSelectedClassSectionKey(first.key);
            setSelectedClassId(first.class_id);
            setSelectedSectionId(first.section_id);
          }
        } else if (uniqueOptions.length > 0) {
          const first = uniqueOptions[0];
          setSelectedClassSectionKey(first.key);
          setSelectedClassId(first.class_id);
          setSelectedSectionId(first.section_id);
        }
      } catch (err) {
        console.error("Failed to load filters", err);
      } finally {
        setLoadingFilters(false);
      }
    }

    loadFilters();
  }, [user.role, searchParams]);

  // 2️⃣ Handle dropdown selection changes
  const handleClassSectionChange = (key) => {
    setSelectedClassSectionKey(key);
    if (key) {
      const [classId, sectionId] = key.split("-");
      setSelectedClassId(classId);
      setSelectedSectionId(sectionId);
    } else {
      setSelectedClassId("");
      setSelectedSectionId("");
    }
  };

  // 3️⃣ Load Daily Attendance List
  useEffect(() => {
    if (!selectedClassId || !selectedSectionId || !date) return;

    async function loadAttendance() {
      try {
        setLoadingStudents(true);
        const res = await getDailyAttendance({
          class_id: selectedClassId,
          section_id: selectedSectionId,
          date,
        });

        const data = res?.data || res;
        setStudents(data.students || []);
        setAuditInfo({
          lastUpdatedBy: data.last_updated_by || "",
          lastUpdatedAt: data.last_updated_at ? new Date(data.last_updated_at).toLocaleString() : "",
        });
      } catch (err) {
        console.error("Failed to load attendance", err);
        setStudents([]);
        setAuditInfo({ lastUpdatedBy: "", lastUpdatedAt: "" });
      } finally {
        setLoadingStudents(false);
      }
    }

    loadAttendance();
  }, [selectedClassId, selectedSectionId, date]);

  // 4️⃣ Quick Toggle Status Action
  const handleToggleStatus = (studentId, nextStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status: nextStatus } : s))
    );
  };

  // 5️⃣ Calculate Real-Time Stats
  const stats = useMemo(() => {
    const total = students.length;
    let present = 0;
    let absent = 0;
    let onDuty = 0;

    students.forEach((s) => {
      if (s.status === "absent") absent += 1;
      else if (s.status === "on_duty") onDuty += 1;
      else present += 1;
    });

    return { total, present, absent, onDuty };
  }, [students]);

  // 6️⃣ Filtered Student List
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;

    return students.filter(
      (s) =>
        (s.name || "").toLowerCase().includes(q) ||
        String(s.roll_no || "").toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // 7️⃣ Save Attendance Action
  const handleSaveAttendance = async () => {
    if (!selectedClassId || !selectedSectionId || !date) return;

    try {
      setSaving(true);
      const records = students.map((s) => ({
        student_id: s.id,
        status: s.status,
      }));

      await markAttendance({
        class_id: selectedClassId,
        section_id: selectedSectionId,
        date,
        records,
      });

      setAlertMsg({ text: "Attendance saved successfully!", type: "success" });
      setOpenSnackbar(true);

      // Refresh to fetch latest audit details
      const refreshRes = await getDailyAttendance({
        class_id: selectedClassId,
        section_id: selectedSectionId,
        date,
      });
      const data = refreshRes?.data || refreshRes;
      setAuditInfo({
        lastUpdatedBy: data.last_updated_by || "",
        lastUpdatedAt: data.last_updated_at ? new Date(data.last_updated_at).toLocaleString() : "",
      });
    } catch (err) {
      console.error("Failed to save attendance", err);
      setAlertMsg({
        text: err.response?.data?.message || "Failed to save attendance. Please try again.",
        type: "error",
      });
      setOpenSnackbar(true);
    } finally {
      setSaving(false);
    }
  };

  if (loadingFilters) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 3, pb: 12 }}>
      <Stack spacing={3}>
        {/* Page Title */}
        <Typography variant="h5" fontWeight="bold">
          Daily Attendance
        </Typography>

        {/* Filters Card */}
        <Card sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "none" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              <TextField
                select
                label="Class & Section"
                value={selectedClassSectionKey}
                onChange={(e) => handleClassSectionChange(e.target.value)}
                fullWidth
                size="small"
                disabled={classSectionOptions.length === 0}
              >
                {classSectionOptions.map((opt) => (
                  <MenuItem key={opt.key} value={opt.key}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                type="date"
                label="Attendance Date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Stats Summary Panel */}
        {students.length > 0 && (
          <Grid container spacing={1}>
            <Grid item xs={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.2,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  border: "1px solid rgba(0,0,0,0.06)",
                  textAlign: "center",
                }}
              >
                <Typography variant="body1" fontWeight="800" sx={{ color: "#1e293b" }}>
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  Total
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.2,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  border: "1px solid rgba(0,0,0,0.06)",
                  textAlign: "center",
                }}
              >
                <Typography variant="body1" fontWeight="800" sx={{ color: "#10b981" }}>
                  {stats.present}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  Present
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.2,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  border: "1px solid rgba(0,0,0,0.06)",
                  textAlign: "center",
                }}
              >
                <Typography variant="body1" fontWeight="800" sx={{ color: "#ef4444" }}>
                  {stats.absent}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  Absent
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.2,
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  border: "1px solid rgba(0,0,0,0.06)",
                  textAlign: "center",
                }}
              >
                <Typography variant="body1" fontWeight="800" sx={{ color: "#3b82f6" }}>
                  {stats.onDuty}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                  On Duty
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Audit / Update Log Info */}
        {auditInfo.lastUpdatedBy && (
          <Alert
            severity="info"
            icon={<AccessTime fontSize="small" />}
            sx={{
              borderRadius: 3,
              fontSize: "0.8rem",
              fontWeight: 500,
              py: 0.5,
              border: "1px solid rgba(0,0,0,0.03)",
              boxShadow: "none",
            }}
          >
            Attendance last updated by <strong>{auditInfo.lastUpdatedBy}</strong> at{" "}
            {auditInfo.lastUpdatedAt}
          </Alert>
        )}

        {/* Roster Section */}
        {loadingStudents ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : students.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 3 }}>
            No students registered in this class section.
          </Alert>
        ) : (
          <Stack spacing={2}>
            {/* Students List */}
            <Stack spacing={1}>
              {students.map((s) => (
                <Card
                  key={s.id}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(0,0,0,0.03)",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.01)",
                    overflow: "visible",
                  }}
                >
                  <CardContent sx={{ p: "12px 16px !important" }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="space-between">
                      {/* Avatar & Name Info */}
                      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0, flex: 1 }}>
                        <Avatar
                          src={getAssetUrl(s.avatar_url) || ""}
                          sx={{
                            width: 38,
                            height: 38,
                            bgcolor: "primary.faint",
                            color: "primary.main",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            border: "1px solid rgba(0,0,0,0.05)",
                          }}
                        >
                          {s.roll_no || (s.name ? s.name[0].toUpperCase() : "")}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" fontWeight="bold" noWrap>
                            {s.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Roll No: {s.roll_no || "—"}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Status Selector Pills (Single-Click Toggle buttons) */}
                      <Stack direction="row" spacing={0.5}>
                        <Button
                          variant="outlined"
                          onClick={() => handleToggleStatus(s.id, "present")}
                          sx={{
                            minWidth: 40,
                            height: 32,
                            p: 0,
                            borderRadius: "16px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "none",
                            bgcolor: s.status === "present" ? "#e6f4ea" : "transparent",
                            borderColor: s.status === "present" ? "#a3cfbb" : "rgba(0,0,0,0.08)",
                            color: s.status === "present" ? "#137333" : "text.secondary",
                            "&:hover": {
                              bgcolor: s.status === "present" ? "#d1e7dd" : "rgba(0,0,0,0.04)",
                              borderColor: s.status === "present" ? "#a3cfbb" : "rgba(0,0,0,0.12)",
                            },
                          }}
                        >
                          P
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleToggleStatus(s.id, "absent")}
                          sx={{
                            minWidth: 40,
                            height: 32,
                            p: 0,
                            borderRadius: "16px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "none",
                            bgcolor: s.status === "absent" ? "#fce8e6" : "transparent",
                            borderColor: s.status === "absent" ? "#f5c2c7" : "rgba(0,0,0,0.08)",
                            color: s.status === "absent" ? "#c5221f" : "text.secondary",
                            "&:hover": {
                              bgcolor: s.status === "absent" ? "#f8d7da" : "rgba(0,0,0,0.04)",
                              borderColor: s.status === "absent" ? "#f5c2c7" : "rgba(0,0,0,0.12)",
                            },
                          }}
                        >
                          A
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleToggleStatus(s.id, "on_duty")}
                          sx={{
                            minWidth: 40,
                            height: 32,
                            p: 0,
                            borderRadius: "16px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "none",
                            bgcolor: s.status === "on_duty" ? "#e8f0fe" : "transparent",
                            borderColor: s.status === "on_duty" ? "#d2e3fc" : "rgba(0,0,0,0.08)",
                            color: s.status === "on_duty" ? "#1a73e8" : "text.secondary",
                            "&:hover": {
                              bgcolor: s.status === "on_duty" ? "#d2e3fc" : "rgba(0,0,0,0.04)",
                              borderColor: s.status === "on_duty" ? "#b4cffc" : "rgba(0,0,0,0.12)",
                            },
                          }}
                        >
                          OD
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Stack>
        )}
      </Stack>

      {/* Sticky Bottom Save Button */}
      {students.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            bottom: 64, // Keep space for bottom navigation
            left: 0,
            right: 0,
            p: 2,
            bgcolor: "background.default",
            boxShadow: "0 -8px 24px rgba(0,0,0,0.04)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Container maxWidth="sm" sx={{ p: "0 !important" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveAttendance}
              fullWidth
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} /> : <Save />}
              sx={{
                py: 1.4,
                borderRadius: "14px",
                fontWeight: 800,
                fontSize: "0.95rem",
                boxShadow: "0 8px 16px rgba(79, 70, 229, 0.25)",
              }}
            >
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </Container>
        </Box>
      )}

      {/* Feedback Toast */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={alertMsg.type} onClose={() => setOpenSnackbar(false)} sx={{ borderRadius: 3 }}>
          {alertMsg.text}
        </Alert>
      </Snackbar>
    </Container>
  );
}
