import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Container,
    Grid,
    MenuItem,
    CircularProgress,
    Alert,
    Snackbar,
    Card,
    CardContent,
    Stack,
    Avatar,
    Divider,
    IconButton,
} from "@mui/material";
import { Save, CalendarMonth, EditNote, Launch, Send } from "@mui/icons-material";
import { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../../api/axios";

const fetchAssignments = () => api.get("/teacher-assignments/teacher/me");

export default function ReportCardEntryPage() {
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);
    const [assignments, setAssignments] = useState([]);
    
    // Selection states
    const [selectedAssignmentKey, setSelectedAssignmentKey] = useState("");
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSectionId, setSelectedSectionId] = useState("");
    const [selectedExamId, setSelectedExamId] = useState("");

    // Data lists
    const [exams, setExams] = useState([]);
    const [examsLoading, setExamsLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [reportCards, setReportCards] = useState([]);
    const [reportCardsLoading, setReportCardsLoading] = useState(false);

    // Selected student to edit marks
    const [activeStudent, setActiveStudent] = useState(null); // student object
    const [activeReportCard, setActiveReportCard] = useState(null); // report card object
    const [activeMarks, setActiveMarks] = useState({}); // { [subject_id]: marks_obtained }
    const [activeRemarks, setActiveRemarks] = useState("");

    // UI Action loading & messaging
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    // Load assignments
    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                setAssignmentsLoading(true);
                const res = await fetchAssignments();
                const data = res?.data?.data ?? res?.data?.items ?? [];
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

    // Unique Class-Section options mapping
    const classSectionOptions = useMemo(() => {
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
                        section_id: sectionObj.id,
                        label: `Class ${classObj.class_name} - ${sectionObj.name}`,
                    });
                }
            }
        });
        return list;
    }, [assignments]);

    // Handle Class-Section dropdown changes
    const handleClassSectionChange = (key) => {
        setSelectedAssignmentKey(key);
        setSelectedExamId("");
        setActiveStudent(null);
        setActiveReportCard(null);
        if (key) {
            const [classId, sectionId] = key.split("-");
            setSelectedClassId(classId);
            setSelectedSectionId(sectionId);
        } else {
            setSelectedClassId("");
            setSelectedSectionId("");
        }
    };

    // Load exams for class
    useEffect(() => {
        if (!selectedClassId) {
            setExams([]);
            return;
        }
        let active = true;
        const loadExams = async () => {
            try {
                setExamsLoading(true);
                const res = await api.get("/exams", { params: { class_id: selectedClassId } });
                const data = res?.data?.items || res?.data?.data || [];
                if (!active) return;
                setExams(data);
            } catch (err) {
                console.error("Failed to load exams", err);
                if (!active) return;
                setExams([]);
            } finally {
                if (active) setExamsLoading(false);
            }
        };
        loadExams();
        return () => {
            active = false;
        };
    }, [selectedClassId]);

    // Load students & report cards
    const loadStudentsAndReportCards = useCallback(async () => {
        if (!selectedClassId || !selectedSectionId || !selectedExamId) return;

        try {
            setStudentsLoading(true);
            setReportCardsLoading(true);

            const [studentsRes, reportCardsRes] = await Promise.all([
                api.get("/students", { params: { class_id: selectedClassId, section_id: selectedSectionId } }),
                api.get("/report-cards", { params: { class_id: selectedClassId, exam_id: selectedExamId } }),
            ]);

            const studs = studentsRes.data?.items ?? studentsRes.data ?? [];
            const rCards = reportCardsRes.data?.data ?? reportCardsRes.data ?? [];

            setStudents(Array.isArray(studs) ? studs : []);
            setReportCards(Array.isArray(rCards) ? rCards : []);
        } catch (err) {
            console.error("Failed to load students/report cards", err);
            setError("Failed to load students or report cards");
        } finally {
            setStudentsLoading(false);
            setReportCardsLoading(false);
        }
    }, [selectedClassId, selectedSectionId, selectedExamId]);

    useEffect(() => {
        loadStudentsAndReportCards();
        setActiveStudent(null);
        setActiveReportCard(null);
    }, [selectedClassId, selectedSectionId, selectedExamId, loadStudentsAndReportCards]);

    // Current selected exam object details
    const selectedExamObj = useMemo(() => {
        return exams.find((e) => String(e.id) === String(selectedExamId));
    }, [exams, selectedExamId]);

    // Exam subject schedules list
    const scheduledSubjects = useMemo(() => {
        return selectedExamObj?.exam_subjects || [];
    }, [selectedExamObj]);

    // Maps student user_id to report card data
    const studentReportCardMap = useMemo(() => {
        const map = new Map();
        reportCards.forEach((rc) => {
            if (rc.student_id) {
                map.set(Number(rc.student_id), rc);
            }
        });
        return map;
    }, [reportCards]);

    // Initialize all missing report cards as drafts
    const handleInitializeReportCards = async () => {
        try {
            setActionLoading(true);
            setError("");
            
            // Filter students who don't have report cards yet
            const missing = students.filter((s) => !studentReportCardMap.has(Number(s.id)));
            if (missing.length === 0) return;

            await Promise.all(
                missing.map((s) =>
                    api.post("/report-cards", {
                        student_id: Number(s.id),
                        exam_id: Number(selectedExamId),
                    })
                )
            );

            setSuccessMsg("Initialized report cards for all students");
            setSuccess(true);
            loadStudentsAndReportCards();
        } catch (err) {
            console.error("Failed to initialize report cards", err);
            setError(err.response?.data?.message || "Failed to initialize report cards");
        } finally {
            setActionLoading(false);
        }
    };

    // Open editor for a student
    const handleEditStudentMarks = (student) => {
        const rCard = studentReportCardMap.get(Number(student.id)) || null;
        setActiveStudent(student);
        setActiveReportCard(rCard);

        const initialMarks = {};
        if (rCard && Array.isArray(rCard.report_card_marks)) {
            rCard.report_card_marks.forEach((m) => {
                initialMarks[m.subject_id] = m.marks_obtained;
            });
        }
        setActiveMarks(initialMarks);
        setActiveRemarks(rCard?.remarks || "");
    };

    // Save student marks entry
    const handleSaveStudentMarks = async (publish = false) => {
        if (!activeReportCard) return;

        try {
            setActionLoading(true);
            setError("");

            const marksPayload = scheduledSubjects.map((sub) => {
                const val = activeMarks[sub.subject_id];
                return {
                    subject_id: Number(sub.subject_id),
                    marks_obtained: val !== undefined && val !== "" ? Number(val) : 0,
                    max_marks: 100, // standard default Max Marks
                };
            });

            // Save marks
            await api.post(`/report-cards/${activeReportCard.id}/marks`, {
                marks: marksPayload,
                remarks: activeRemarks.trim() || null,
            });

            if (publish) {
                // Publish report card
                await api.post(`/report-cards/${activeReportCard.id}/publish`, {
                    remarks: activeRemarks.trim() || null,
                });
            }

            setSuccessMsg(publish ? "Report card published successfully!" : "Marks saved as draft!");
            setSuccess(true);
            
            // Reload and close edit drawer
            loadStudentsAndReportCards();
            setActiveStudent(null);
            setActiveReportCard(null);
        } catch (err) {
            console.error("Failed to save report card marks", err);
            setError(err.response?.data?.message || "Failed to save marks");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4, pb: 12 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={900} sx={{ fontFamily: "'Outfit', sans-serif" }}>
                    Marks Entry (Report Cards)
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Select Class and Exam to enter, save, and publish exam marks.
                </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                {/* Class Assignment Selector */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        fullWidth
                        label="Class Assignment"
                        value={selectedAssignmentKey}
                        onChange={(e) => handleClassSectionChange(e.target.value)}
                        disabled={assignmentsLoading}
                        slotProps={{
                            select: {
                                displayEmpty: true,
                                renderValue: (selected) => {
                                    if (!selected) return "Select Class & Section";
                                    const opt = classSectionOptions.find(o => o.key === selected);
                                    return opt ? opt.label : selected;
                                }
                            }
                        }}
                    >
                        {assignmentsLoading && (
                            <MenuItem value="">
                                <CircularProgress size={18} sx={{ mr: 1 }} /> Loading assignments...
                            </MenuItem>
                        )}
                        {!assignmentsLoading && classSectionOptions.length === 0 && (
                            <MenuItem value="">No assignments assigned</MenuItem>
                        )}
                        {classSectionOptions.map((opt) => (
                            <MenuItem key={opt.key} value={opt.key}>
                                {opt.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                {/* Exam Group Selector */}
                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        fullWidth
                        label="Exam / Test"
                        value={selectedExamId}
                        onChange={(e) => setSelectedExamId(e.target.value)}
                        disabled={!selectedClassId || examsLoading}
                        slotProps={{
                            select: {
                                displayEmpty: true,
                                renderValue: (selected) => {
                                    if (!selected) return "Select Exam";
                                    const opt = exams.find(e => String(e.id) === String(selected));
                                    return opt ? opt.name : selected;
                                }
                            }
                        }}
                    >
                        {!selectedClassId && <MenuItem value="">Select Class Assignment First</MenuItem>}
                        {examsLoading && (
                            <MenuItem value="">
                                <CircularProgress size={18} sx={{ mr: 1 }} /> Loading exams...
                            </MenuItem>
                        )}
                        {selectedClassId && !examsLoading && exams.length === 0 && (
                            <MenuItem value="">No scheduled exams found</MenuItem>
                        )}
                        {exams.map((exam) => (
                            <MenuItem key={exam.id} value={exam.id}>
                                {exam.name} {exam.is_locked ? "🔒" : ""}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
            </Grid>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>}

            {/* Content area */}
            {selectedClassId && selectedSectionId && selectedExamId ? (
                <Grid container spacing={3}>
                    {/* Left: Students List */}
                    <Grid item xs={12} md={activeStudent ? 6 : 12}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: "24px",
                                border: "1px solid rgba(0,0,0,0.06)",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                            }}
                        >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" fontWeight={800}>
                                    Students List
                                </Typography>

                                {students.length > 0 && reportCards.length < students.length && (
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleInitializeReportCards}
                                        disabled={actionLoading}
                                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: "10px" }}
                                    >
                                        Initialize Cards
                                    </Button>
                                )}
                            </Stack>

                            <Divider />

                            {studentsLoading || reportCardsLoading ? (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                                    <CircularProgress />
                                </Box>
                            ) : students.length === 0 ? (
                                <Box sx={{ textAlign: "center", py: 4 }}>
                                    <Typography color="text.secondary" variant="body2">
                                        No students found in this class.
                                    </Typography>
                                </Box>
                            ) : (
                                <Stack spacing={1.5}>
                                    {students.map((student) => {
                                        const rCard = studentReportCardMap.get(Number(student.id));
                                        const name = student.user?.name || student.name || "Student";
                                        const roll = student.roll_no || "—";
                                        const isSelected = activeStudent?.id === student.id;

                                        return (
                                            <Card
                                                key={student.id}
                                                onClick={() => handleEditStudentMarks(student)}
                                                sx={{
                                                    borderRadius: "14px",
                                                    border: isSelected
                                                        ? "1.5px solid"
                                                        : "1px solid rgba(0,0,0,0.05)",
                                                    borderColor: isSelected ? "primary.main" : "rgba(0,0,0,0.05)",
                                                    cursor: "pointer",
                                                    bgcolor: isSelected ? "action.hover" : "background.paper",
                                                    boxShadow: "none",
                                                    transition: "all 0.15s",
                                                    "&:hover": { borderColor: "primary.main" },
                                                }}
                                            >
                                                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                                    <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
                                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                                            <Avatar sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 700 }}>
                                                                {name[0]?.toUpperCase()}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight="bold">
                                                                    {name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Roll No: {roll}
                                                                </Typography>
                                                            </Box>
                                                        </Stack>

                                                        {rCard ? (
                                                            <Chip
                                                                label={rCard.published_at ? "Published" : "Draft"}
                                                                size="small"
                                                                color={rCard.published_at ? "success" : "default"}
                                                                sx={{ fontWeight: 800, height: 20, fontSize: "10px" }}
                                                            />
                                                        ) : (
                                                            <Chip
                                                                label="Not Init"
                                                                size="small"
                                                                variant="outlined"
                                                                color="error"
                                                                sx={{ fontWeight: 800, height: 20, fontSize: "10px" }}
                                                            />
                                                        )}
                                                    </Stack>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </Stack>
                            )}
                        </Paper>
                    </Grid>

                    {/* Right: Enter Marks Panel */}
                    {activeStudent && (
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    borderRadius: "24px",
                                    border: "1px solid rgba(0,0,0,0.06)",
                                    position: "sticky",
                                    top: 16,
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.5 }}>
                                    Enter Marks
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                    Editing report card marks for <strong>{activeStudent.user?.name || activeStudent.name}</strong>.
                                </Typography>

                                <Divider sx={{ mb: 2 }} />

                                {!activeReportCard ? (
                                    <Box sx={{ py: 3, textAlign: "center" }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            You must initialize the report card draft first.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={handleInitializeReportCards}
                                            disabled={actionLoading}
                                            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
                                        >
                                            Initialize Now
                                        </Button>
                                    </Box>
                                ) : scheduledSubjects.length === 0 ? (
                                    <Box sx={{ py: 3, textAlign: "center" }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No subjects have been scheduled for this exam yet. Go to Schedule Exams page to schedule subjects first.
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Stack spacing={2.5}>
                                        {/* Scheduled subjects listing with inputs */}
                                        <Stack spacing={2}>
                                            {scheduledSubjects.map((sub) => {
                                                const subName = sub.Subject?.name || `Subject ${sub.subject_id}`;
                                                const currentMark = activeMarks[sub.subject_id] ?? "";

                                                return (
                                                    <Box
                                                        key={sub.subject_id}
                                                        sx={{
                                                            p: 2,
                                                            borderRadius: "12px",
                                                            bgcolor: "action.hover",
                                                            border: "1px solid rgba(0,0,0,0.02)",
                                                        }}
                                                    >
                                                        <Grid container alignItems="center" spacing={1}>
                                                            <Grid item xs={7}>
                                                                <Typography variant="body2" fontWeight="bold">
                                                                    {subName}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary" display="block">
                                                                    Test Date: {sub.exam_date}
                                                                </Typography>
                                                            </Grid>
                                                            <Grid item xs={5}>
                                                                <TextField
                                                                    type="number"
                                                                    size="small"
                                                                    label="Marks Obtained"
                                                                    placeholder="/ 100"
                                                                    value={currentMark}
                                                                    onChange={(e) =>
                                                                        setActiveMarks((prev) => ({
                                                                            ...prev,
                                                                            [sub.subject_id]: e.target.value,
                                                                        }))
                                                                    }
                                                                    disabled={selectedExamObj?.is_locked}
                                                                    inputProps={{ min: 0, max: 100 }}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                    </Box>
                                                );
                                            })}
                                        </Stack>

                                        {/* General Remarks Input */}
                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={2}
                                            label="Teacher General Remarks"
                                            value={activeRemarks}
                                            onChange={(e) => setActiveRemarks(e.target.value)}
                                            placeholder="e.g. Excellent progress, needs to focus on presentation."
                                            disabled={selectedExamObj?.is_locked}
                                        />

                                        {/* Actions */}
                                        {!selectedExamObj?.is_locked && (
                                            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    startIcon={<Save />}
                                                    onClick={() => handleSaveStudentMarks(false)}
                                                    disabled={actionLoading}
                                                    sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, py: 1.2 }}
                                                >
                                                    Save Draft
                                                </Button>

                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    fullWidth
                                                    startIcon={<Send />}
                                                    onClick={() => handleSaveStudentMarks(true)}
                                                    disabled={actionLoading}
                                                    sx={{
                                                        borderRadius: "10px",
                                                        textTransform: "none",
                                                        fontWeight: 700,
                                                        py: 1.2,
                                                        bgcolor: "success.main",
                                                        "&:hover": { bgcolor: "success.dark" },
                                                    }}
                                                >
                                                    Publish
                                                </Button>
                                            </Stack>
                                        )}
                                    </Stack>
                                )}
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            ) : (
                <Card sx={{ borderRadius: 5, border: "1px solid rgba(0,0,0,0.05)", bgcolor: "action.hover", boxShadow: "none", mt: 2 }}>
                    <CardContent sx={{ textAlign: "center", py: 8 }}>
                        <Typography color="text.secondary">
                            Please select a Class Assignment and Exam Group first.
                        </Typography>
                    </CardContent>
                </Card>
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
