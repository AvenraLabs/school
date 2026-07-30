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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  PauseCircle,
  Search,
  Save,
  AccessTime,
  CalendarMonth,
  Message,
} from "@mui/icons-material";
import { useAuth } from "../../auth/AuthProvider";
import { getMyTeacherAssignments } from "../teacher-timetable/teacherTimetable.api";
import {
  getDailyAttendance,
  markAttendance,
  sendAbsentWhatsApp,
  listAllClasses,
  listSectionsForClass,
} from "./attendance.api";
import { useSearchParams } from "react-router-dom";
import { getAssetUrl } from "../../utils/asset";

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function TeacherAttendancePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  // Navigation / Filter States
  const [classSectionOptions, setClassSectionOptions] = useState([]);
  const [selectedClassSectionKey, setSelectedClassSectionKey] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [date, setDate] = useState(() => getTodayDateString());

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
        setWhatsappSentToday(Boolean(data.whatsapp_sent_today));
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
    let leave = 0;
    let onDuty = 0;

    students.forEach((s) => {
      if (s.status === "absent") absent += 1;
      else if (s.status === "leave") leave += 1;
      else if (s.status === "on_duty") onDuty += 1;
      else present += 1;
    });

    return { total, present, absent, leave, onDuty };
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

  // 8️⃣ Manual WhatsApp Absent Alerts
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [whatsappSentToday, setWhatsappSentToday] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);

  const absentStudentsCount = useMemo(() => {
    return students.filter((s) => s.status === "absent").length;
  }, [students]);

  const isToday = useMemo(() => {
    return date === getTodayDateString();
  }, [date]);

  const handleSendAbsentWhatsApp = async () => {
    if (!selectedClassId || !selectedSectionId || !date || !isToday || whatsappSentToday) return;

    try {
      setSendingWhatsApp(true);
      setOpenConfirmModal(false);

      const res = await sendAbsentWhatsApp({
        class_id: selectedClassId,
        section_id: selectedSectionId,
        date,
      });

      const data = res?.data?.data || res?.data || res;
      setWhatsappSentToday(true);
      setAlertMsg({
        text: data.message || `Sent WhatsApp alerts to ${data.sent_count || 0} parent(s).`,
        type: "success",
      });
      setOpenSnackbar(true);
    } catch (err) {
      console.error("Failed to send WhatsApp absent alerts", err);
      setAlertMsg({
        text: err.response?.data?.message || "Failed to send WhatsApp alerts. Please try again.",
        type: "error",
      });
      setOpenSnackbar(true);
    } finally {
      setSendingWhatsApp(false);
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
    <Container maxWidth="sm" sx={{ mt: 2, pb: isToday && absentStudentsCount > 0 ? 20 : 14 }}>
      <Stack spacing={1.5}>
        {/* Page Title */}
        <Typography variant="h5" fontWeight="bold">
          Daily Attendance
        </Typography>

        {/* Filters Card */}
        <Card sx={{ borderRadius: 3, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "none" }}>
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1.5}>
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
              gap: 0.75,
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 2.5,
                bgcolor: "background.paper",
                border: "1px solid rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" fontWeight="800" sx={{ color: "#1e293b" }}>
                {stats.total}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
                Total
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 2.5,
                bgcolor: "background.paper",
                border: "1px solid rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" fontWeight="800" sx={{ color: "#10b981" }}>
                {stats.present}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
                Present
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 2.5,
                bgcolor: "background.paper",
                border: "1px solid rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" fontWeight="800" sx={{ color: "#ef4444" }}>
                {stats.absent}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
                Absent
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 2.5,
                bgcolor: "background.paper",
                border: "1px solid rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" fontWeight="800" sx={{ color: "#d97706" }}>
                {stats.leave}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
                Leave
              </Typography>
            </Paper>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 2.5,
                bgcolor: "background.paper",
                border: "1px solid rgba(0,0,0,0.06)",
                textAlign: "center",
              }}
            >
              <Typography variant="body2" fontWeight="800" sx={{ color: "#3b82f6" }}>
                {stats.onDuty}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
                On Duty
              </Typography>
            </Paper>
          </Box>
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
                            minWidth: 34,
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
                            minWidth: 34,
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
                          onClick={() => handleToggleStatus(s.id, "leave")}
                          sx={{
                            minWidth: 34,
                            height: 32,
                            p: 0,
                            borderRadius: "16px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "none",
                            bgcolor: s.status === "leave" ? "#fff8e1" : "transparent",
                            borderColor: s.status === "leave" ? "#ffe082" : "rgba(0,0,0,0.08)",
                            color: s.status === "leave" ? "#b78103" : "text.secondary",
                            "&:hover": {
                              bgcolor: s.status === "leave" ? "#ffecb3" : "rgba(0,0,0,0.04)",
                              borderColor: s.status === "leave" ? "#ffd54f" : "rgba(0,0,0,0.12)",
                            },
                          }}
                        >
                          L
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => handleToggleStatus(s.id, "on_duty")}
                          sx={{
                            minWidth: 34,
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

      {/* Spacer to prevent bottom fixed action bar overlap */}
      {students.length > 0 && (
        <Box sx={{ height: isToday && absentStudentsCount > 0 ? 110 : 64 }} />
      )}

      {/* Sticky Bottom Action Bar */}
      {students.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            bottom: 64,
            left: 0,
            right: 0,
            p: 1.5,
            bgcolor: "background.default",
            boxShadow: "0 -8px 24px rgba(0,0,0,0.06)",
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Container maxWidth="sm" sx={{ p: "0 !important" }}>
            <Stack spacing={1}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveAttendance}
                fullWidth
                disabled={saving}
                startIcon={saving ? <CircularProgress size={18} /> : <Save />}
                sx={{
                  py: 1.1,
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
                }}
              >
                {saving ? "Saving..." : "Save Attendance"}
              </Button>

              {/* Manual WhatsApp Alert Button for Absent Students */}
              {isToday && absentStudentsCount > 0 && (
                <Button
                  variant={whatsappSentToday ? "contained" : "outlined"}
                  color="success"
                  onClick={() => setOpenConfirmModal(true)}
                  fullWidth
                  disabled={sendingWhatsApp || whatsappSentToday}
                  startIcon={
                    sendingWhatsApp ? (
                      <CircularProgress size={18} />
                    ) : whatsappSentToday ? (
                      <CheckCircle />
                    ) : (
                      <Message />
                    )
                  }
                  sx={{
                    py: 1,
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    borderColor: whatsappSentToday ? "transparent" : "#25D366",
                    color: whatsappSentToday ? "#0f5132" : "#128C7E",
                    bgcolor: whatsappSentToday ? "#d1e7dd !important" : "transparent",
                    "&:hover": {
                      borderColor: "#128C7E",
                      bgcolor: "rgba(37, 211, 102, 0.08)",
                    },
                    "&.Mui-disabled": {
                      color: "#0f5132",
                      bgcolor: "#d1e7dd !important",
                      borderColor: "transparent",
                    },
                  }}
                >
                  {sendingWhatsApp
                    ? "Sending..."
                    : whatsappSentToday
                    ? "WhatsApp Alert Sent"
                    : "Send WhatsApp Alert"}
                </Button>
              )}
            </Stack>
          </Container>
        </Box>
      )}

      {/* Confirmation Dialog for WhatsApp Alerts */}
      <Dialog
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        PaperProps={{ sx: { borderRadius: 2.5, p: 0.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, textTransform: "capitalize" }}>
          Send Absent WhatsApp Alerts
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to dispatch WhatsApp absent notifications to parents of the{" "}
            <strong>{absentStudentsCount}</strong> student(s) marked absent today?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenConfirmModal(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSendAbsentWhatsApp}
            variant="contained"
            color="success"
            disabled={sendingWhatsApp}
            startIcon={sendingWhatsApp ? <CircularProgress size={16} /> : <Message />}
            sx={{ fontWeight: 800, borderRadius: "8px", bgcolor: "#128C7E", "&:hover": { bgcolor: "#075E54" } }}
          >
            {sendingWhatsApp ? "Sending..." : "Confirm & Send"}
          </Button>
        </DialogActions>
      </Dialog>

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
