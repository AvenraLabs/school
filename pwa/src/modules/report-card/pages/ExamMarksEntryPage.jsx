import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Container,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Stack,
  Avatar,
  Divider,
  Chip,
  InputAdornment,
} from "@mui/material";
import { ArrowBack, Save, CheckCircle, Warning } from "@mui/icons-material";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { useAuth } from "../../../auth/AuthProvider";

export default function ExamMarksEntryPage() {
  const { examId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const classId = searchParams.get("class_id");
  const sectionId = searchParams.get("section_id");
  const targetSubjectId = searchParams.get("subject_id");

  // Page state
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [existingReportCards, setExistingReportCards] = useState([]);
  const [examDetails, setExamDetails] = useState(null);
  const [assignments, setAssignments] = useState([]);

  // Edit states
  const [marksState, setMarksState] = useState({}); // { [studentId]: { [subjectId]: marks_obtained } }
  const [remarksState, setRemarksState] = useState({}); // { [studentId]: remarks }

  // Actions loading & messaging
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Helper to extract arrays safely from API responses
  const extractArray = (resData) => {
    if (Array.isArray(resData)) return resData;
    if (Array.isArray(resData?.items)) return resData.items;
    if (Array.isArray(resData?.data)) return resData.data;
    if (Array.isArray(resData?.students)) return resData.students;
    return [];
  };

  // Load data
  const loadData = useCallback(async () => {
    if (!classId || !examId) {
      setError("Missing parameters for loading exam marks entry.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch assignments if user is a teacher
      let assignmentsData = [];
      if (user?.role === "teacher") {
        try {
          const assignRes = await api.get("/teacher-assignments/teacher/me");
          assignmentsData = extractArray(assignRes.data);
          setAssignments(assignmentsData);
        } catch (e) {
          console.warn("Could not fetch teacher assignments", e);
        }
      }

      // Fetch students, report cards, and exams in parallel
      const studentParams = { class_id: classId, limit: 200 };
      if (sectionId) studentParams.section_id = sectionId;

      const [studentsRes, reportCardsRes, examsRes] = await Promise.all([
        api.get("/students", { params: studentParams }),
        api.get("/report-cards", { params: { class_id: classId, exam_id: examId } }),
        api.get("/exams", { params: { class_id: classId } }),
      ]);

      const studs = extractArray(studentsRes.data);
      const rCards = extractArray(reportCardsRes.data);
      const examsList = extractArray(examsRes.data);

      let activeExam = examsList.find((e) => String(e.id) === String(examId));

      // Direct fallback fetch for single exam details if not in list
      if (!activeExam) {
        try {
          const singleExamRes = await api.get(`/exams/${examId}`);
          activeExam = singleExamRes.data?.data || singleExamRes.data?.item || singleExamRes.data;
        } catch (e) {
          console.warn("Single exam fetch fallback skipped", e);
        }
      }

      setStudents(studs);
      setExistingReportCards(rCards);
      setExamDetails(activeExam || null);

      // Populate form states
      const initialMarks = {};
      const initialRemarks = {};

      studs.forEach((student) => {
        const rc = rCards.find((card) => Number(card.student_id) === Number(student.id));
        initialMarks[student.id] = {};
        initialRemarks[student.id] = rc?.remarks || "";

        if (rc && Array.isArray(rc.report_card_marks)) {
          rc.report_card_marks.forEach((mark) => {
            initialMarks[student.id][mark.subject_id] = mark.marks_obtained;
          });
        }
      });

      setMarksState(initialMarks);
      setRemarksState(initialRemarks);
    } catch (err) {
      console.error("Failed to load marks entry data", err);
      setError("Failed to load student list or exam details. Please refresh or try again.");
    } finally {
      setLoading(false);
    }
  }, [classId, sectionId, examId, user]);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, [loadData]);

  const scheduledSubjects = useMemo(() => {
    return examDetails?.exam_subjects || examDetails?.subjects || [];
  }, [examDetails]);

  const targetSubjectObj = useMemo(() => {
    if (!targetSubjectId) return null;
    return scheduledSubjects.find((s) => String(s.subject_id) === String(targetSubjectId));
  }, [scheduledSubjects, targetSubjectId]);

  const targetSubjectName =
    targetSubjectObj?.subject?.name || targetSubjectObj?.Subject?.name || "";

  // Check if subject is editable by the current teacher
  const isSubjectEditable = useCallback(
    (subjectId) => {
      if (!user || user?.role !== "teacher" || assignments.length === 0) return true;
      return assignments.some((a) => {
        const subId = a.subject_id || a.Subject?.id;
        return String(subId) === String(subjectId);
      });
    },
    [assignments, user]
  );

  const filteredSubjects = useMemo(() => {
    if (targetSubjectId) {
      const matched = scheduledSubjects.filter(
        (sub) => String(sub.subject_id) === String(targetSubjectId)
      );
      if (matched.length > 0) return matched;
    }
    const list = scheduledSubjects.filter((sub) => isSubjectEditable(sub.subject_id));
    return list.length > 0 ? list : scheduledSubjects;
  }, [scheduledSubjects, targetSubjectId, isSubjectEditable]);

  const handleMarkChange = (studentId, subjectId, val) => {
    setMarksState((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [subjectId]: val,
      },
    }));
  };

  const handleRemarkChange = (studentId, val) => {
    setRemarksState((prev) => ({
      ...prev,
      [studentId]: val,
    }));
  };

  // Save single student row
  const handleSaveSingle = async (studentId) => {
    try {
      setActionLoading(true);
      setError("");

      const studentMarks = marksState[studentId] || {};
      const marksList = [];

      filteredSubjects.forEach((sub) => {
        const val = studentMarks[sub.subject_id];
        marksList.push({
          subject_id: Number(sub.subject_id),
          marks_obtained: val !== undefined && val !== "" ? Number(val) : 0,
          max_marks: Number(sub.max_marks || 100),
        });
      });

      if (marksList.length === 0) {
        setError("No valid subject marks to save.");
        setActionLoading(false);
        return;
      }

      const payload = [
        {
          student_id: Number(studentId),
          marks: marksList,
          remarks: remarksState[studentId]?.trim() || null,
        },
      ];

      await api.post("/report-cards/bulk-marks", {
        class_id: Number(classId),
        section_id: sectionId ? Number(sectionId) : null,
        exam_id: Number(examId),
        report_cards: payload,
      });

      setSuccessMsg("Marks saved successfully!");
      setSuccess(true);
    } catch (err) {
      console.error("Save row failed", err);
      setError(err.response?.data?.message || "Failed to save student marks.");
    } finally {
      setActionLoading(false);
    }
  };

  // Save all student marks in bulk
  const handleSaveAll = async () => {
    try {
      setActionLoading(true);
      setError("");

      const payload = students
        .map((student) => {
          const studentMarks = marksState[student.id] || {};
          const marksPayload = [];

          filteredSubjects.forEach((sub) => {
            const val = studentMarks[sub.subject_id];
            marksPayload.push({
              subject_id: Number(sub.subject_id),
              marks_obtained: val !== undefined && val !== "" ? Number(val) : 0,
              max_marks: Number(sub.max_marks || 100),
            });
          });

          return {
            student_id: Number(student.id),
            marks: marksPayload,
            remarks: remarksState[student.id]?.trim() || null,
          };
        })
        .filter((item) => item.marks.length > 0);

      if (payload.length === 0) {
        setError("No valid student marks to save.");
        setActionLoading(false);
        return;
      }

      await api.post("/report-cards/bulk-marks", {
        class_id: Number(classId),
        section_id: sectionId ? Number(sectionId) : null,
        exam_id: Number(examId),
        report_cards: payload,
      });

      setSuccessMsg("All student marks saved successfully!");
      setSuccess(true);
      setTimeout(() => {
        navigate("/teacher/exams/create");
      }, 1000);
    } catch (err) {
      console.error("Bulk save failed", err);
      setError(err.response?.data?.message || "Failed to save marks.");
    } finally {
      setActionLoading(false);
    }
  };

  const classNameText =
    students[0]?.Class?.class_name ||
    students[0]?.class_name ||
    examDetails?.class_name ||
    `Class ${classId}`;

  const sectionNameText =
    students[0]?.Section?.name ||
    students[0]?.section_name ||
    examDetails?.section_name ||
    "";

  return (
    <Container maxWidth="md" sx={{ pt: 2, pb: { xs: 18, sm: 12 } }}>
      {/* Back Button Action */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/teacher/exams/create")}
        sx={{ mb: 2.5, textTransform: "none", fontWeight: 700, color: "#14213D" }}
      >
        Back to Exams
      </Button>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8 }}>
          <CircularProgress sx={{ color: "#2F6F5E" }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading students and exam marks...
          </Typography>
        </Box>
      ) : (
        <Box>
          {/* Header Card */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: "14px",
              borderColor: "#E4E1D8",
              bgcolor: "#FFFFFF",
            }}
          >
            <Typography variant="h5" fontWeight={900} color="#14213D" sx={{ fontFamily: "'Outfit', sans-serif" }}>
              {examDetails?.name
                ? `${examDetails.name}${targetSubjectName ? ` - ${targetSubjectName}` : ""}`
                : targetSubjectName
                ? targetSubjectName
                : "Exam Marks Entry"}
            </Typography>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
              {error}
            </Alert>
          )}

          {filteredSubjects.length === 0 ? (
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
              <Warning sx={{ fontSize: 44, color: "#8C97AB", mb: 1 }} />
              <Typography variant="h6" fontWeight={800} color="#14213D" sx={{ mb: 0.5 }}>
                No Subjects Scheduled
              </Typography>
              <Typography variant="body2" color="text.secondary">
                There are no subjects scheduled for this exam yet. Add a subject test on the Exams page first.
              </Typography>
            </Paper>
          ) : students.length === 0 ? (
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
              <Warning sx={{ fontSize: 44, color: "#8C97AB", mb: 1 }} />
              <Typography variant="h6" fontWeight={800} color="#14213D" sx={{ mb: 0.5 }}>
                No Active Students Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No active students are currently enrolled in {classNameText} {sectionNameText ? `- ${sectionNameText}` : ""}.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={3}>
              {/* Student Rows */}
              <Stack spacing={2}>
                {students.map((student) => {
                  const studentName =
                    student.user?.name || student.name || `Student #${student.id}`;

                  const studentMarks = marksState[student.id] || {};
                  const hasSavedMarks = filteredSubjects.some(
                    (sub) => studentMarks[sub.subject_id] !== undefined
                  );

                  return (
                    <Paper
                      key={student.id}
                      variant="outlined"
                      sx={{
                        borderRadius: "14px",
                        borderColor: "#E4E1D8",
                        bgcolor: "#FFFFFF",
                        overflow: "hidden",
                      }}
                    >
                      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                        {/* Student Row Header */}
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                              sx={{
                                width: 38,
                                height: 38,
                                fontSize: 15,
                                fontWeight: 800,
                                bgcolor: "#EAF3F0",
                                color: "#2F6F5E",
                              }}
                            >
                              {studentName[0]?.toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" fontWeight={800} color="#14213D">
                                {studentName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Roll No: {student.roll_no || student.roll_number || "—"}
                              </Typography>
                            </Box>
                          </Stack>

                          <Chip
                            label={hasSavedMarks ? "Saved" : "Not Entered"}
                            size="small"
                            color={hasSavedMarks ? "success" : "default"}
                            icon={hasSavedMarks ? <CheckCircle sx={{ fontSize: 13 }} /> : undefined}
                            sx={{ fontWeight: 800, height: 22, borderRadius: "6px" }}
                          />
                        </Stack>

                        <Divider sx={{ mb: 2, borderColor: "#E4E1D8" }} />

                        {/* Subject Inputs Grid */}
                        <Grid container spacing={2}>
                          {filteredSubjects.map((sub) => {
                            const subjectName =
                              sub.subject?.name || sub.Subject?.name || `Subject ${sub.subject_id}`;
                            const maxLimit = sub.max_marks || 100;
                            const currentMark = marksState[student.id]?.[sub.subject_id] ?? "";
                            const isMarkExceeded = Number(currentMark) > maxLimit;
                            const singleMode = Boolean(targetSubjectId);

                            return (
                              <Grid item xs={12} sm={singleMode ? 12 : 6} key={sub.subject_id}>
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  alignItems="center"
                                  spacing={2}
                                  sx={{ width: "100%" }}
                                >
                                  {!singleMode && (
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography variant="subtitle2" fontWeight={800} color="#14213D">
                                        {subjectName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Max Marks: {maxLimit}
                                      </Typography>
                                    </Box>
                                  )}
                                  <Box sx={{ width: singleMode ? "100%" : 130, flexShrink: 0 }}>
                                    <TextField
                                      type="number"
                                      size="small"
                                      fullWidth
                                      label="Marks"
                                      placeholder={`/ ${maxLimit}`}
                                      value={currentMark}
                                      onChange={(e) =>
                                        handleMarkChange(student.id, sub.subject_id, e.target.value)
                                      }
                                      disabled={actionLoading}
                                      error={isMarkExceeded}
                                      helperText={isMarkExceeded ? `Exceeds max (${maxLimit})` : ""}
                                      inputProps={{ min: 0, max: maxLimit }}
                                      InputProps={{
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <Typography variant="body2" fontWeight={800} color="text.secondary">
                                              / {maxLimit}
                                            </Typography>
                                          </InputAdornment>
                                        ),
                                      }}
                                    />
                                  </Box>
                                </Stack>
                              </Grid>
                            );
                          })}
                        </Grid>

                      </CardContent>
                    </Paper>
                  );
                })}
              </Stack>

              {/* Actions Button Bar */}
              {students.length > 0 && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: "16px",
                    borderColor: "#E4E1D8",
                    position: "sticky",
                    bottom: { xs: 76, sm: 24 },
                    zIndex: 100,
                    bgcolor: "#FFFFFF",
                    boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
                  }}
                >
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSaveAll}
                    disabled={actionLoading}
                    startIcon={<Save />}
                    sx={{
                      bgcolor: "#2F6F5E",
                      color: "#FFFFFF",
                      textTransform: "none",
                      borderRadius: "10px",
                      py: 1.3,
                      fontWeight: 800,
                      fontSize: 15,
                      "&:hover": { bgcolor: "#245749" },
                    }}
                  >
                    Save All Marks
                  </Button>
                </Paper>
              )}
            </Stack>
          )}
        </Box>
      )}

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
