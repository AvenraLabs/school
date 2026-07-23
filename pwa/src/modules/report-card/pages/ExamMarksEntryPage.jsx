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
} from "@mui/material";
import { ArrowBack, Save, CheckCircle, Warning, Edit } from "@mui/icons-material";
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

    // Load data
    const loadData = useCallback(async () => {
        if (!classId || !sectionId || !examId) {
            setError("Missing query parameters (class_id, section_id, or examId).");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Fetch assignments if user is a teacher
            let assignmentsData = [];
            if (user?.role === "teacher") {
                const assignRes = await api.get("/teacher-assignments/teacher/me");
                assignmentsData = assignRes.data?.data ?? assignRes.data ?? [];
                setAssignments(assignmentsData);
            }

            const [studentsRes, reportCardsRes, examRes] = await Promise.all([
                api.get("/students", { params: { class_id: classId, section_id: sectionId } }),
                api.get("/report-cards", { params: { class_id: classId, exam_id: examId } }),
                api.get(`/exams`, { params: { class_id: classId } }), // get all exams to find this one
            ]);

            const studs = studentsRes.data?.items ?? studentsRes.data ?? [];
            const rCards = reportCardsRes.data?.data ?? reportCardsRes.data ?? [];
            const examsList = examRes.data?.items ?? examRes.data?.data ?? [];
            
            const activeExam = examsList.find(e => String(e.id) === String(examId));

            setStudents(Array.isArray(studs) ? studs : []);
            setExistingReportCards(Array.isArray(rCards) ? rCards : []);
            setExamDetails(activeExam);

            // Populate form states
            const initialMarks = {};
            const initialRemarks = {};

            studs.forEach((student) => {
                const rc = rCards.find(card => Number(card.student_id) === Number(student.id));
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
            setError("Failed to load student list or exam data.");
        } finally {
            setLoading(false);
        }
    }, [classId, sectionId, examId, user]);

    useEffect(() => {
        window.scrollTo(0, 0);
        loadData();
    }, [loadData]);

    const scheduledSubjects = useMemo(() => {
        return examDetails?.exam_subjects || [];
    }, [examDetails]);

    // Check if subject is editable by the current teacher
    const isSubjectEditable = useCallback((subjectId) => {
        if (user?.role !== "teacher") return true; // Admins can edit anything
        return assignments.some(
            (a) =>
                String(a.subject_id) === String(subjectId) &&
                String(a.section_id) === String(sectionId) &&
                String(a.class_id) === String(classId)
        );
    }, [assignments, user, sectionId, classId]);

    const filteredSubjects = useMemo(() => {
        return scheduledSubjects.filter(sub => isSubjectEditable(sub.subject_id));
    }, [scheduledSubjects, isSubjectEditable]);

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
            
            // Filter payload to only send subjects this teacher is authorized to edit
            const marksList = [];
            filteredSubjects.forEach((sub) => {
                if (isSubjectEditable(sub.subject_id)) {
                    const val = studentMarks[sub.subject_id];
                    marksList.push({
                        subject_id: Number(sub.subject_id),
                        marks_obtained: val !== undefined && val !== "" ? Number(val) : 0,
                        max_marks: Number(sub.max_marks || 100),
                    });
                }
            });

            if (marksList.length === 0) {
                setError("You don't have permission to save marks for any of the scheduled subjects.");
                setActionLoading(false);
                return;
            }

            const payload = [{
                student_id: Number(studentId),
                marks: marksList,
                remarks: remarksState[studentId]?.trim() || null
            }];

            await api.post("/report-cards/bulk-marks", {
                class_id: Number(classId),
                section_id: Number(sectionId),
                exam_id: Number(examId),
                report_cards: payload,
            });

            setSuccessMsg("Marks saved successfully!");
            setSuccess(true);
        } catch (err) {
            console.error("Save row failed", err);
            setError(err.response?.data?.message || "Failed to save marks.");
        } finally {
            setActionLoading(false);
        }
    };

    // Save all student marks in bulk
    const handleSaveAll = async () => {
        try {
            setActionLoading(true);
            setError("");

            const payload = students.map((student) => {
                const studentMarks = marksState[student.id] || {};
                
                // Filter payload to only subjects this teacher can edit
                const marksPayload = [];
                filteredSubjects.forEach((sub) => {
                    if (isSubjectEditable(sub.subject_id)) {
                        const val = studentMarks[sub.subject_id];
                        marksPayload.push({
                            subject_id: Number(sub.subject_id),
                            marks_obtained: val !== undefined && val !== "" ? Number(val) : 0,
                            max_marks: Number(sub.max_marks || 100),
                        });
                    }
                });

                return {
                    student_id: Number(student.id),
                    marks: marksPayload,
                    remarks: remarksState[student.id]?.trim() || null,
                };
            }).filter(item => item.marks.length > 0);

            if (payload.length === 0) {
                setError("You don't have permission to save marks for any of the scheduled subjects.");
                setActionLoading(false);
                return;
            }

            await api.post("/report-cards/bulk-marks", {
                class_id: Number(classId),
                section_id: Number(sectionId),
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

    return (
        <Container maxWidth="md" sx={{ py: 4, pb: 12 }}>
            {/* Header / Back Action */}
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate("/teacher/exams/create")}
                sx={{ mb: 3, textTransform: "none", fontWeight: 700 }}
            >
                Back to Exams
            </Button>

            {loading ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyItems: "center", py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" fontWeight={900} sx={{ fontFamily: "'Outfit', sans-serif" }}>
                            {examDetails?.name || "Exam Details"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Class {students[0]?.Class?.class_name || ""} - {students[0]?.Section?.name || ""} | Enter marks for subjects you teach.
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

                    {filteredSubjects.length === 0 ? (
                        <Card sx={{ borderRadius: "12px", p: 3, textAlign: "center", border: "1px solid rgba(0,0,0,0.06)", bgcolor: "action.hover", boxShadow: "none" }}>
                            <CardContent>
                                <Warning color="warning" sx={{ fontSize: 40, mb: 1 }} />
                                <Typography variant="body1" fontWeight="bold" sx={{ mb: 1 }}>
                                    No Assigned Subjects
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {user?.role === "teacher" 
                                        ? "You are not mapped to teach any of the subjects scheduled in this exam."
                                        : "There are no subjects scheduled for this test."}
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Stack spacing={3.5}>
                            {/* Student inline-editable rows list */}
                            <Stack spacing={2}>
                                {students.map((student) => {
                                    const studentName = student.user?.name || student.name || "Student";
                                    
                                    // Check if marks are already saved for subjects editable by this teacher
                                    const studentMarks = marksState[student.id] || {};
                                    const hasSavedMarks = filteredSubjects.some(
                                        (sub) => studentMarks[sub.subject_id] !== undefined
                                    );

                                    return (
                                        <Card
                                            key={student.id}
                                            sx={{
                                                borderRadius: "12px",
                                                border: "1px solid rgba(0,0,0,0.05)",
                                                boxShadow: "none",
                                            }}
                                        >
                                            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                                                {/* Student Header */}
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                        <Avatar sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
                                                            {studentName[0]?.toUpperCase()}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {studentName}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Roll No: {student.roll_no || "—"}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>

                                                    <Chip
                                                        label={hasSavedMarks ? "Saved" : "Not Entered"}
                                                        size="small"
                                                        color={hasSavedMarks ? "success" : "default"}
                                                        icon={hasSavedMarks ? <CheckCircle sx={{ fontSize: 13 }} /> : undefined}
                                                        sx={{ fontWeight: 800, height: 20 }}
                                                    />
                                                </Stack>

                                                <Divider sx={{ mb: 2.5 }} />

                                                {/* Subject Inputs Grid */}
                                                <Grid container spacing={2}>
                                                    {filteredSubjects.map((sub) => {
                                                        const subjectName = sub.subject?.name || sub.Subject?.name || `Subject ${sub.subject_id}`;
                                                        const maxLimit = sub.max_marks || 100;
                                                        const currentMark = marksState[student.id]?.[sub.subject_id] ?? "";
                                                        const isMarkExceeded = Number(currentMark) > maxLimit;
                                                        const editable = isSubjectEditable(sub.subject_id);

                                                        return (
                                                                                           <Grid item xs={12} sm={6} key={sub.subject_id}>
                                                                <Stack
                                                                    direction="row"
                                                                    justifyContent="space-between"
                                                                    alignItems="center"
                                                                    spacing={2}
                                                                    sx={{ width: "100%" }}
                                                                >
                                                                    <Box sx={{ minWidth: 0 }}>
                                                                        <Typography
                                                                            variant="body2"
                                                                            fontWeight="bold"
                                                                            color={editable ? "text.primary" : "text.secondary"}
                                                                        >
                                                                            {subjectName} {!editable && "🔒"}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            Max Marks: {maxLimit}
                                                                        </Typography>
                                                                    </Box>
                                                                    <Box sx={{ width: 120, flexShrink: 0 }}>
                                                                        <TextField
                                                                            type="number"
                                                                            size="small"
                                                                            fullWidth
                                                                            label={editable ? "Marks" : "Read-only"}
                                                                            placeholder={`/ ${maxLimit}`}
                                                                            value={currentMark}
                                                                            onChange={(e) => handleMarkChange(student.id, sub.subject_id, e.target.value)}
                                                                            disabled={examDetails?.is_locked || actionLoading || !editable}
                                                                            error={isMarkExceeded}
                                                                            helperText={isMarkExceeded ? "Exceeds max" : ""}
                                                                            inputProps={{ min: 0, max: maxLimit }}
                                                                        />
                                                                    </Box>
                                                                </Stack>
                                                            </Grid>
                                                        );
                                                    })}
                                                </Grid>

                                                {/* Row Level Individual Actions */}
                                                {!examDetails?.is_locked && (
                                                    <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 2.5 }}>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="primary"
                                                            startIcon={<Save />}
                                                            onClick={() => handleSaveSingle(student.id)}
                                                            disabled={actionLoading}
                                                            sx={{ textTransform: "none", borderRadius: "8px", fontWeight: 700 }}
                                                        >
                                                            Save
                                                        </Button>
                                                    </Stack>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </Stack>

                            {/* Batch Actions Button Bar */}
                            {!examDetails?.is_locked && students.length > 0 && (
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: "20px",
                                        border: "1px solid rgba(0,0,0,0.06)",
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        gap: 2,
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        position: "sticky",
                                        bottom: 16,
                                        zIndex: 100,
                                        bgcolor: "background.paper",
                                        boxShadow: "0px 4px 20px rgba(0,0,0,0.05)",
                                    }}
                                >
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            Bulk Actions
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Save edits for all students in one click.
                                        </Typography>
                                    </Box>

                                    <Stack direction="row" spacing={2} sx={{ width: { xs: "100%", sm: "auto" } }}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            fullWidth
                                            onClick={handleSaveAll}
                                            disabled={actionLoading}
                                            startIcon={<Save />}
                                            sx={{ textTransform: "none", borderRadius: "10px", py: 1.2, fontWeight: 700, px: 3 }}
                                        >
                                            Save Marks
                                        </Button>
                                    </Stack>
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
                <Alert severity="success" onClose={() => setSuccess(false)} sx={{ borderRadius: 2 }}>
                    {successMsg}
                </Alert>
            </Snackbar>
        </Container>
    );
}
