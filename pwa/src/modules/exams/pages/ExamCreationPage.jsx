import {
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
  Container,
  CardContent,
  Stack,
  IconButton,
  Chip,
  Divider,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
} from "@mui/material";
import {
  Add,
  Delete,
  CalendarMonth,
  ArrowForward,
  Check,
  ExpandMore,
  ExpandLess,
  Assignment,
  Assessment,
} from "@mui/icons-material";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import DatePickerField from "../../../components/DatePickerField";
import ConfirmationDialog from "../../../components/ConfirmationDialog";
import dayjs from "dayjs";

const fetchAssignments = () => api.get("/teacher-assignments/teacher/me");

export default function ExamCreationPage() {
  const navigate = useNavigate();

  // Main context selection
  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  // Exams lists
  const [exams, setExams] = useState([]);
  const [examsLoading, setExamsLoading] = useState(false);
  const [expandedExamId, setExpandedExamId] = useState(null);

  // Dialog state for scheduling new test
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogExamId, setDialogExamId] = useState("");
  const [newExamName, setNewExamName] = useState("");
  const [dialogSubjectId, setDialogSubjectId] = useState("");
  const [dialogExamDate, setDialogExamDate] = useState("");
  const [dialogSyllabus, setDialogSyllabus] = useState("");
  const [dialogMaxMarks, setDialogMaxMarks] = useState(100);

  // Action feedback states
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Confirmation dialog state for deletion
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { examId, subjectId }
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load teacher assignments on mount
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setAssignmentsLoading(true);
        const res = await fetchAssignments();
        const data = res?.data?.data ?? res?.data ?? [];
        if (!active) return;
        setAssignments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load teacher assignments", err);
      } finally {
        if (active) setAssignmentsLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  // Extract unique Class-Section tabs
  const classSections = useMemo(() => {
    const seen = new Set();
    const list = [];
    assignments.forEach((a) => {
      const classObj = a.Class || a.class;
      const sectionObj = a.Section || a.section;
      if (classObj && sectionObj) {
        const key = `${classObj.id}-${sectionObj.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            key,
            class_id: classObj.id,
            class_name: classObj.class_name,
            section_id: sectionObj.id,
            section_name: sectionObj.name,
          });
        }
      }
    });
    return list;
  }, [assignments]);

  // Auto-select the first Class-Section on load
  useEffect(() => {
    if (classSections.length > 0 && !selectedClassId) {
      setSelectedClassId(classSections[0].class_id);
      setSelectedSectionId(classSections[0].section_id);
    }
  }, [classSections, selectedClassId]);

  // Get subjects taught in the selected class-section
  const subjectOptions = useMemo(() => {
    const map = new Map();
    assignments
      .filter(
        (a) =>
          String(a.class_id) === String(selectedClassId) &&
          String(a.section_id) === String(selectedSectionId)
      )
      .forEach((a) => {
        const subjectId = a.subject_id;
        const subjectName = a.Subject?.name || a.subject?.name || a.subject_name || subjectId;
        if (subjectId && !map.has(subjectId)) {
          map.set(subjectId, { subject_id: subjectId, subject_name: subjectName });
        }
      });
    return Array.from(map.values());
  }, [assignments, selectedClassId, selectedSectionId]);

  const teacherSubjectIds = useMemo(() => {
    return new Set(subjectOptions.map((s) => String(s.subject_id)));
  }, [subjectOptions]);

  // Load exams for the selected class
  const loadExams = useCallback(async (classId) => {
    if (!classId) return;
    try {
      setExamsLoading(true);
      const res = await api.get("/exams", { params: { class_id: classId } });
      const data = res?.data?.items || res?.data?.data || [];
      setExams(data);
      if (data.length > 0 && !expandedExamId) {
        setExpandedExamId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load exams", err);
      setExams([]);
    } finally {
      setExamsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadExams(selectedClassId);
    }
  }, [selectedClassId, loadExams]);

  const handleSelectClassSection = (cs) => {
    setSelectedClassId(cs.class_id);
    setSelectedSectionId(cs.section_id);
  };

  // Open confirmation for subject deletion
  const handleDeleteClick = (examId, subjectId) => {
    setDeleteTarget({ examId, subjectId });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      setError("");
      await api.delete(`/exams/${deleteTarget.examId}/subjects/${deleteTarget.subjectId}`);
      setSuccessMsg("Subject schedule removed successfully");
      setSuccess(true);
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      loadExams(selectedClassId);
    } catch (err) {
      console.error("Failed to delete subject", err);
      setError(err.response?.data?.message || "Failed to remove subject from exam");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      setError("");

      if (!selectedClassId) {
        setError("Please select a Class-Section context.");
        setSaveLoading(false);
        return;
      }
      if (!dialogExamId) {
        setError("Please select an Exam / Test group.");
        setSaveLoading(false);
        return;
      }
      if (dialogExamId === "new" && !newExamName.trim()) {
        setError("Please enter a name for the new exam.");
        setSaveLoading(false);
        return;
      }
      if (!dialogSubjectId) {
        setError("Please select a Subject.");
        setSaveLoading(false);
        return;
      }
      if (!dialogExamDate) {
        setError("Please select an Exam Date.");
        setSaveLoading(false);
        return;
      }

      if (dialogExamId === "new") {
        await api.post("/exams", {
          class_id: Number(selectedClassId),
          name: newExamName.trim(),
          subjects: [
            {
              subject_id: Number(dialogSubjectId),
              exam_date: dialogExamDate,
              syllabus: dialogSyllabus?.trim() || null,
              max_marks: Number(dialogMaxMarks || 100),
            },
          ],
        });
      } else {
        await api.put(`/exams/${dialogExamId}/subjects`, {
          subject_id: Number(dialogSubjectId),
          exam_date: dialogExamDate,
          syllabus: dialogSyllabus?.trim() || null,
          max_marks: Number(dialogMaxMarks || 100),
        });
      }

      setSuccessMsg("Test scheduled successfully");
      setSuccess(true);
      setDialogOpen(false);
      setDialogExamId("");
      setNewExamName("");
      setDialogSubjectId("");
      setDialogExamDate("");
      setDialogSyllabus("");
      setDialogMaxMarks(100);
      loadExams(selectedClassId);
    } catch (err) {
      console.error("Failed to schedule exam subject", err);
      setError(err.response?.data?.message || "Failed to schedule exam subject");
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 2, pb: 12 }}>
      {/* 1. Compact Action Header Toolbar */}
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          border: "1px solid #E4E1D8",
          borderRadius: "14px",
          p: 2,
          mb: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              bgcolor: "#EAF3F0",
              color: "#2F6F5E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Assignment />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="#14213D" sx={{ lineHeight: 1.1 }}>
              Exams
            </Typography>
          </Box>
        </Box>

        <Button
          size="small"
          variant="outlined"
          onClick={() => navigate("/teacher/exams/insights")}
          startIcon={<Assessment />}
          sx={{
            borderColor: "#E4E1D8",
            color: "#14213D",
            fontWeight: 700,
            fontSize: 12,
            borderRadius: "8px",
            textTransform: "none",
            "&:hover": { borderColor: "#2F6F5E", bgcolor: "#EAF3F0" },
          }}
        >
          Analytics
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5, borderRadius: "12px" }}>
          {error}
        </Alert>
      )}

      {/* 2. Class-Section Selector Pills */}
      {assignmentsLoading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5, mb: 2 }}>
          <CircularProgress size={20} sx={{ color: "#2F6F5E" }} />
          <Typography variant="body2" color="text.secondary">
            Loading assigned classes...
          </Typography>
        </Box>
      ) : classSections.length === 0 ? (
        <Alert severity="warning" sx={{ mb: 2.5, borderRadius: "12px" }}>
          No class sections currently assigned to your profile.
        </Alert>
      ) : (
        <Box sx={{ mb: 2.5 }}>
          <Typography
            variant="caption"
            fontWeight={800}
            color="text.secondary"
            display="block"
            sx={{ mb: 1, textTransform: "uppercase", letterSpacing: 0.6, fontSize: "11px" }}
          >
            ASSIGNED CLASS & SECTION
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              pb: 0.5,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {classSections.map((cs) => {
              const isSelected =
                String(selectedClassId) === String(cs.class_id) &&
                String(selectedSectionId) === String(cs.section_id);
              return (
                <Chip
                  key={cs.key}
                  label={`Class ${cs.class_name} - ${cs.section_name}`}
                  onClick={() => handleSelectClassSection(cs)}
                  icon={isSelected ? <Check sx={{ fontSize: "15px !important", color: "#FFFFFF !important" }} /> : undefined}
                  sx={{
                    bgcolor: isSelected ? "#2F6F5E" : "#FFFFFF",
                    color: isSelected ? "#FFFFFF" : "#14213D",
                    border: "1px solid",
                    borderColor: isSelected ? "#2F6F5E" : "#E4E1D8",
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: 13,
                    px: 0.5,
                    py: 2,
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: isSelected ? "#2F6F5E" : "#EAF3F0",
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* 3. Scheduled Exams List */}
      {selectedClassId && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={800} color="#14213D">
              SCHEDULED EXAMS ({exams.length})
            </Typography>

            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setError("");
                setDialogOpen(true);
              }}
              sx={{
                bgcolor: "#2F6F5E",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 12,
                borderRadius: "8px",
                textTransform: "none",
                "&:hover": { bgcolor: "#245749" },
              }}
            >
              New Exam
            </Button>
          </Box>

          {examsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
              <CircularProgress size={30} sx={{ color: "#2F6F5E" }} />
            </Box>
          ) : exams.length === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: "14px",
                borderColor: "#E4E1D8",
                bgcolor: "#FFFFFF",
              }}
            >
              <Typography color="text.secondary" variant="body2" fontWeight={600}>
                No exams scheduled yet for this class section.
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={() => {
                  setError("");
                  setDialogOpen(true);
                }}
                sx={{
                  mt: 2,
                  borderColor: "#2F6F5E",
                  color: "#2F6F5E",
                  fontWeight: 700,
                  borderRadius: "8px",
                  textTransform: "none",
                }}
              >
                Schedule First Exam
              </Button>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {exams.map((exam) => {
                const subjectsList = exam.exam_subjects || [];
                const isExpanded = expandedExamId === exam.id;
                return (
                  <Paper
                    key={exam.id}
                    variant="outlined"
                    sx={{
                      borderRadius: "14px",
                      borderColor: isExpanded ? "#2F6F5E" : "#E4E1D8",
                      borderWidth: isExpanded ? 2 : 1,
                      bgcolor: "#FFFFFF",
                      overflow: "hidden",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Box
                      onClick={() => setExpandedExamId(isExpanded ? null : exam.id)}
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        bgcolor: isExpanded ? "#EAF3F0" : "#FFFFFF",
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Typography fontWeight={800} variant="subtitle1" color="#14213D">
                          {exam.name}
                        </Typography>
                      </Stack>
                      <IconButton size="small" sx={{ color: "#14213D" }}>
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>

                    <Collapse in={isExpanded}>
                      <CardContent sx={{ p: 2, pt: 1.5, "&:last-child": { pb: 2 } }}>
                        <Divider sx={{ mb: 2, borderColor: "#E4E1D8" }} />

                        {subjectsList.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mb: 2 }}>
                            No subject tests added to this exam group yet.
                          </Typography>
                        ) : (
                          <Stack spacing={1.5} sx={{ mb: 2.5 }}>
                            {subjectsList.map((es) => {
                              const subjectName =
                                es.subject?.name || es.Subject?.name || `Subject ${es.subject_id}`;
                              const isTaughtByTeacher =
                                teacherSubjectIds.size === 0 ||
                                teacherSubjectIds.has(String(es.subject_id));
                              return (
                                <Paper
                                  key={es.subject_id}
                                  variant="outlined"
                                  sx={{
                                    p: 1.5,
                                    bgcolor: "#FAFAF8",
                                    borderColor: "#E4E1D8",
                                    borderRadius: "10px",
                                  }}
                                >
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box>
                                      <Typography variant="subtitle2" fontWeight={800} color="#14213D">
                                        {subjectName}
                                      </Typography>
                                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.5 }}>
                                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "text.secondary" }}>
                                          <CalendarMonth sx={{ fontSize: 14, color: "#2F6F5E" }} />
                                          <Typography variant="caption" fontWeight={700}>
                                            {es.exam_date ? dayjs(es.exam_date).format("DD-MM-YYYY") : "TBD"}
                                          </Typography>
                                        </Stack>
                                        <Chip
                                          label={`Max: ${es.max_marks || 100}`}
                                          size="small"
                                          sx={{ bgcolor: "#EAF3F0", color: "#2F6F5E", fontWeight: 800, height: 18, fontSize: 10 }}
                                        />
                                      </Stack>
                                    </Box>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteClick(exam.id, es.subject_id)}
                                      sx={{ color: "#B0403A", "&:hover": { bgcolor: "#FDF2F1" } }}
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                  {es.syllabus && (
                                    <Box sx={{ mt: 1, pt: 1, borderTop: "1px dashed #E4E1D8" }}>
                                      <Typography variant="caption" color="#2F6F5E" fontWeight={800}>
                                        SYLLABUS:
                                      </Typography>
                                      <Typography variant="body2" color="#14213D" sx={{ fontSize: "12px", mt: 0.2 }}>
                                        {es.syllabus}
                                      </Typography>
                                    </Box>
                                  )}

                                  {isTaughtByTeacher && (
                                    <Button
                                      size="small"
                                      variant="contained"
                                      endIcon={<ArrowForward sx={{ fontSize: "14px !important" }} />}
                                      onClick={() =>
                                        navigate(
                                          `/teacher/exams/${exam.id}/marks?class_id=${selectedClassId}&section_id=${selectedSectionId}&subject_id=${es.subject_id}`
                                        )
                                      }
                                      sx={{
                                        mt: 1.5,
                                        bgcolor: "#2F6F5E",
                                        color: "#FFFFFF",
                                        borderRadius: "8px",
                                        textTransform: "none",
                                        fontWeight: 800,
                                        fontSize: 12,
                                        py: 0.8,
                                        px: 2,
                                        boxShadow: "none",
                                        "&:hover": { bgcolor: "#245749" },
                                      }}
                                    >
                                      Enter Marks
                                    </Button>
                                  )}
                                </Paper>
                              );
                            })}
                          </Stack>
                        )}
                      </CardContent>
                    </Collapse>
                  </Paper>
                );
              })}
            </Stack>
          )}
        </Box>
      )}

      {/* Floating Action Button for scheduling test */}
      {selectedClassId && (
        <Fab
          aria-label="schedule-test"
          onClick={() => {
            setError("");
            setDialogOpen(true);
          }}
          sx={{
            position: "fixed",
            bottom: 80,
            right: 20,
            bgcolor: "#2F6F5E",
            color: "#FFFFFF",
            boxShadow: "0px 4px 16px rgba(47, 111, 94, 0.35)",
            "&:hover": { bgcolor: "#245749" },
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Schedule New Test Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => !saveLoading && setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: { borderRadius: "16px", p: 1, bgcolor: "#FAFAF8" },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1, color: "#14213D" }}>
          Schedule Exam Subject
        </DialogTitle>
        <Box component="form" onSubmit={handleScheduleSubmit}>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, py: 1 }}>
            {/* Exam Group Selection */}
            <TextField
              select
              required
              fullWidth
              label="Exam Group"
              value={dialogExamId}
              onChange={(e) => setDialogExamId(e.target.value)}
              disabled={saveLoading}
              InputLabelProps={{ shrink: true }}
              slotProps={{
                select: {
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) return "Select Exam Group";
                    if (selected === "new") return "+ Create New Exam...";
                    const match = exams.find((e) => String(e.id) === String(selected));
                    return match ? match.name : selected;
                  },
                },
              }}
            >
              <MenuItem value="new" sx={{ fontWeight: "bold", color: "#2F6F5E" }}>
                + Create New Exam...
              </MenuItem>
              {exams.map((exam) => (
                <MenuItem key={exam.id} value={exam.id}>
                  {exam.name}
                </MenuItem>
              ))}
            </TextField>

            {/* New Exam Name Input */}
            {dialogExamId === "new" && (
              <TextField
                required
                fullWidth
                label="New Exam Name"
                placeholder="e.g. Unit Test 2, Revision Exam"
                value={newExamName}
                onChange={(e) => setNewExamName(e.target.value)}
                disabled={saveLoading}
              />
            )}

            {/* Subject Selection */}
            <TextField
              select
              required
              fullWidth
              label="Subject"
              value={dialogSubjectId}
              onChange={(e) => setDialogSubjectId(e.target.value)}
              disabled={saveLoading}
              InputLabelProps={{ shrink: true }}
              slotProps={{
                select: {
                  displayEmpty: true,
                  renderValue: (selected) => {
                    if (!selected) return "Select Subject";
                    const match = subjectOptions.find((s) => String(s.subject_id) === String(selected));
                    return match ? match.subject_name : selected;
                  },
                },
              }}
            >
              {subjectOptions.length === 0 && (
                <MenuItem value="">No assigned subjects in this class</MenuItem>
              )}
              {subjectOptions.map((sub) => (
                <MenuItem key={sub.subject_id} value={sub.subject_id}>
                  {sub.subject_name}
                </MenuItem>
              ))}
            </TextField>

            {/* Date Picker */}
            <DatePickerField
              label="Exam Date"
              value={dialogExamDate}
              onChange={(val) => setDialogExamDate(val)}
              disabled={saveLoading}
              size="medium"
              format="DD-MM-YYYY"
            />

            {/* Max Marks */}
            <TextField
              required
              fullWidth
              type="number"
              label="Maximum Marks"
              value={dialogMaxMarks}
              onChange={(e) => setDialogMaxMarks(e.target.value)}
              disabled={saveLoading}
              inputProps={{ min: 1 }}
            />

            {/* Syllabus */}
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Syllabus (Optional)"
              placeholder="e.g. Chapter 4 Fractions, Lesson 1 to 3 vocabulary"
              value={dialogSyllabus}
              onChange={(e) => setDialogSyllabus(e.target.value)}
              disabled={saveLoading}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setDialogOpen(false)}
              disabled={saveLoading}
              sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, color: "text.secondary" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saveLoading}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 800,
                px: 3,
                bgcolor: "#2F6F5E",
                "&:hover": { bgcolor: "#245749" },
              }}
            >
              {saveLoading ? "Saving..." : "Save Exam"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Confirm Subject Delete Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onClose={() => !deleteLoading && setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Remove Subject Schedule?"
        description="Are you sure you want to remove this subject from the exam? This will delete all marks entered for this subject."
        confirmText="Remove"
        cancelText="Keep Subject"
        severity="error"
        loading={deleteLoading}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={2500}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)} sx={{ borderRadius: "10px" }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
