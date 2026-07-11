import {
    Typography,
    Paper,
    TextField,
    Button,
    Box,
    Grid,
    MenuItem,
    Alert,
    CircularProgress,
    Snackbar,
    Container,
    Card,
    CardContent,
    Stack,
    IconButton,
    Chip,
    Divider,
} from "@mui/material";
import { Add, Delete, CalendarMonth, Lock, LockOpen } from "@mui/icons-material";
import { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../../api/axios";
import DatePickerField from "../../../components/DatePickerField";

const fetchAssignments = () => api.get("/teacher-assignments/teacher/me");

export default function ExamCreationPage() {
    const [loading, setLoading] = useState(false);
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);
    const [assignments, setAssignments] = useState([]);
    
    // Existing exams state
    const [exams, setExams] = useState([]);
    const [examsLoading, setExamsLoading] = useState(false);
    const [selectedExamId, setSelectedExamId] = useState("");
    const [newExamName, setNewExamName] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    
    const [formData, setFormData] = useState({
        subject_id: "",
        exam_date: "",
        syllabus: "",
        class_id: "",
    });

    const loadExams = useCallback(async (classId) => {
        if (!classId) return;
        try {
            setExamsLoading(true);
            const res = await api.get("/exams", { params: { class_id: classId } });
            const data = res?.data?.items || res?.data?.data || [];
            setExams(data);
        } catch (err) {
            console.error("Failed to load exams for class", err);
            setExams([]);
        } finally {
            setExamsLoading(false);
        }
    }, []);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                setAssignmentsLoading(true);
                const assignmentRes = await fetchAssignments();
                const data = assignmentRes?.data?.data ?? assignmentRes?.data ?? [];
                if (!active) return;
                setAssignments(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to load exam setup", err);
                if (!active) return;
                setAssignments([]);
            } finally {
                if (active) setAssignmentsLoading(false);
            }
        };
        load();
        return () => {
            active = false;
        };
    }, []);

    // Fetch exams whenever class changes
    useEffect(() => {
        if (!formData.class_id) {
            setExams([]);
            setSelectedExamId("");
            return;
        }
        loadExams(formData.class_id);
        setSelectedExamId("");
        setNewExamName("");
    }, [formData.class_id, loadExams]);

    const classOptions = useMemo(() => {
        const map = new Map();
        assignments.forEach((a) => {
            const classId = a.class_id;
            const className = a.Class?.class_name || a.class?.class_name || a.class_id;
            if (!map.has(classId)) {
                map.set(classId, { class_id: classId, class_name: className });
            }
        });
        return Array.from(map.values());
    }, [assignments]);

    const subjectOptions = useMemo(() => {
        const map = new Map();
        assignments
            .filter((a) => !formData.class_id || String(a.class_id) === String(formData.class_id))
            .forEach((a) => {
                const subjectId = a.subject_id;
                const subjectName = a.Subject?.name || a.subject?.name || a.subject_name || subjectId;
                if (subjectId && !map.has(subjectId)) {
                    map.set(subjectId, { subject_id: subjectId, subject_name: subjectName });
                }
            });
        return Array.from(map.values());
    }, [assignments, formData.class_id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDeleteSubject = async (examId, subjectId) => {
        try {
            setError("");
            await api.delete(`/exams/${examId}/subjects/${subjectId}`);
            setSuccessMsg("Subject unscheduled successfully");
            setSuccess(true);
            loadExams(formData.class_id);
        } catch (err) {
            console.error("Failed to delete subject from exam", err);
            setError(err.response?.data?.message || "Failed to remove subject from exam");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");

            if (!formData.class_id) {
                setError("Please select a Class.");
                setLoading(false);
                return;
            }
            if (!selectedExamId) {
                setError("Please select an Exam / Test.");
                setLoading(false);
                return;
            }
            if (selectedExamId === "new" && !newExamName.trim()) {
                setError("Please enter a name for the new exam.");
                setLoading(false);
                return;
            }
            if (!formData.subject_id) {
                setError("Please select a Subject.");
                setLoading(false);
                return;
            }
            if (!formData.exam_date) {
                setError("Please select an Exam Date.");
                setLoading(false);
                return;
            }

            if (selectedExamId === "new") {
                await api.post("/exams", {
                    class_id: Number(formData.class_id),
                    name: newExamName.trim(),
                    subjects: [
                        {
                            subject_id: Number(formData.subject_id),
                            exam_date: formData.exam_date,
                            syllabus: formData.syllabus?.trim() || null,
                        },
                    ],
                });
            } else {
                await api.put(`/exams/${selectedExamId}/subjects`, {
                    subject_id: Number(formData.subject_id),
                    exam_date: formData.exam_date,
                    syllabus: formData.syllabus?.trim() || null,
                });
            }

            setSuccessMsg("Exam subject scheduled successfully");
            setSuccess(true);
            setFormData({
                subject_id: "",
                exam_date: "",
                syllabus: "",
                class_id: formData.class_id, // Keep selected class
            });
            setSelectedExamId("");
            setNewExamName("");
            loadExams(formData.class_id);
        } catch (err) {
            console.error("Failed to schedule exam subject", err);
            setError(err.response?.data?.message || "Failed to schedule exam subject");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 3, pb: 12 }}>
            <Typography variant="h5" fontWeight={900} sx={{ mb: 3, color: "text.primary", fontFamily: "'Outfit', sans-serif" }}>
                Schedule Exams
            </Typography>

            <Paper
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: 5,
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "none",
                    bgcolor: "background.paper",
                    overflow: "hidden",
                    mb: 4
                }}
            >
                <Grid container spacing={2.5}>
                    {error && (
                        <Grid item xs={12}>
                            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
                        </Grid>
                    )}

                    {/* Class Dropdown */}
                    <Grid item xs={12}>
                        <TextField
                            select
                            required
                            fullWidth
                            label="Class"
                            name="class_id"
                            value={formData.class_id}
                            onChange={(event) => setFormData((prev) => ({ ...prev, class_id: event.target.value, subject_id: "" }))}
                            disabled={assignmentsLoading}
                            slotProps={{
                                select: {
                                    displayEmpty: true,
                                    renderValue: (selected) => {
                                        if (!selected) return "Select Class";
                                        const match = classOptions.find(
                                            (c) => String(c.class_id) === String(selected)
                                        );
                                        return match ? `Class ${match.class_name}` : `Class ${selected}`;
                                    },
                                },
                            }}
                            InputLabelProps={{ shrink: true }}
                        >
                            {assignmentsLoading && (
                                <MenuItem value="">
                                    <CircularProgress size={18} sx={{ mr: 1 }} />
                                    Loading classes...
                                </MenuItem>
                            )}
                            {!assignmentsLoading && classOptions.length === 0 && (
                                <MenuItem value="">No assigned classes</MenuItem>
                            )}
                            {classOptions.map((c) => (
                                <MenuItem key={c.class_id} value={c.class_id}>
                                    Class {c.class_name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Exam Dropdown */}
                    <Grid item xs={12}>
                        <TextField
                            select
                            required
                            fullWidth
                            label="Exam"
                            name="exam_id"
                            value={selectedExamId}
                            onChange={(e) => setSelectedExamId(e.target.value)}
                            disabled={!formData.class_id || examsLoading}
                            InputLabelProps={{ shrink: true }}
                            slotProps={{
                                select: {
                                    displayEmpty: true,
                                    renderValue: (selected) => {
                                        if (!selected) return "Select Exam / Test";
                                        if (selected === "new") return "+ Create New Exam...";
                                        const match = exams.find((exam) => String(exam.id) === String(selected));
                                        return match ? match.name : selected;
                                    },
                                },
                            }}
                        >
                            {!formData.class_id && <MenuItem value="">Select Class First</MenuItem>}
                            {examsLoading && (
                                <MenuItem value="">
                                    <CircularProgress size={18} sx={{ mr: 1 }} />
                                    Loading exams...
                                </MenuItem>
                            )}
                            {formData.class_id && !examsLoading && (
                                <MenuItem value="new" sx={{ fontWeight: "bold", color: "primary.main" }}>
                                    + Create New Exam...
                                </MenuItem>
                            )}
                            {exams.map((exam) => (
                                <MenuItem key={exam.id} value={exam.id} disabled={exam.is_locked}>
                                    {exam.name} {exam.is_locked ? "(Locked) 🔒" : ""}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* New Exam Name Input */}
                    {selectedExamId === "new" && (
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="New Exam Name"
                                name="newExamName"
                                placeholder="e.g., Unit Test 1, Half Yearly"
                                value={newExamName}
                                onChange={(e) => setNewExamName(e.target.value)}
                                helperText="This will create a new exam group for this class."
                            />
                        </Grid>
                    )}

                    {/* Subject Dropdown */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            required
                            fullWidth
                            label="Subject"
                            name="subject_id"
                            value={formData.subject_id}
                            onChange={handleChange}
                            disabled={!formData.class_id}
                            InputLabelProps={{ shrink: true }}
                            slotProps={{
                                select: {
                                    displayEmpty: true,
                                    renderValue: (selected) => {
                                        if (!selected) return "Select Subject";
                                        const match = subjectOptions.find(
                                            (s) => String(s.subject_id) === String(selected)
                                        );
                                        return match ? match.subject_name : selected;
                                    },
                                },
                            }}
                        >
                            {!formData.class_id && <MenuItem value="">Select Class First</MenuItem>}
                            {formData.class_id && subjectOptions.length === 0 && (
                                <MenuItem value="">No assigned subjects</MenuItem>
                            )}
                            {subjectOptions.map((subject) => (
                                <MenuItem key={subject.subject_id} value={subject.subject_id}>
                                    {subject.subject_name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* Exam Date Picker */}
                    <Grid item xs={12} sm={6}>
                        <DatePickerField
                            label="Exam Date"
                            value={formData.exam_date}
                            onChange={(val) =>
                                setFormData((prev) => ({ ...prev, exam_date: val }))
                            }
                            size="medium"
                        />
                    </Grid>

                    {/* Syllabus multiline input */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label="Syllabus"
                            name="syllabus"
                            placeholder="e.g., Chapter 1 to 3, Grammar rules"
                            value={formData.syllabus}
                            onChange={handleChange}
                        />
                    </Grid>

                    {/* Submit Button */}
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading}
                            startIcon={<Add />}
                            sx={{
                                mt: 1,
                                py: 1.5,
                                borderRadius: 3,
                                textTransform: "none",
                                fontWeight: "bold",
                                fontSize: "16px",
                            }}
                        >
                            {loading ? "Scheduling..." : "Schedule Subject Test"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Scheduled Exams List (Fix: teacher can now see scheduled exams/syllabus) */}
            {formData.class_id && (
                <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 2, color: "text.primary", fontFamily: "'Outfit', sans-serif" }}>
                        Scheduled Exams ({exams.length})
                    </Typography>

                    {examsLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                            <CircularProgress size={24} />
                        </Box>
                    ) : exams.length === 0 ? (
                        <Card sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.05)", bgcolor: "action.hover", boxShadow: "none" }}>
                            <CardContent sx={{ textAlign: "center", py: 4 }}>
                                <Typography color="text.secondary" variant="body2">
                                    No exams scheduled yet for this class.
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Stack spacing={2.5}>
                            {exams.map((exam) => {
                                const subjectsList = exam.exam_subjects || [];
                                return (
                                    <Card key={exam.id} sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.05)", boxShadow: "none" }}>
                                        <CardContent sx={{ p: 2.5 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                                <Typography fontWeight="bold" variant="subtitle1">
                                                    {exam.name}
                                                </Typography>
                                                <Chip
                                                    label={exam.is_locked ? "Locked" : "Active"}
                                                    size="small"
                                                    color={exam.is_locked ? "default" : "success"}
                                                    icon={exam.is_locked ? <Lock sx={{ fontSize: 14 }} /> : <LockOpen sx={{ fontSize: 14 }} />}
                                                    sx={{ fontWeight: 800, height: 22 }}
                                                />
                                            </Stack>

                                            <Divider sx={{ mb: 2 }} />

                                            {subjectsList.length === 0 ? (
                                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                                    No subjects scheduled for this exam yet.
                                                </Typography>
                                            ) : (
                                                <Stack spacing={2}>
                                                    {subjectsList.map((es) => (
                                                        <Box key={es.subject_id} sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.02)" }}>
                                                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                                <Box>
                                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                                        {es.Subject?.name || `Subject ${es.subject_id}`}
                                                                    </Typography>
                                                                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5, color: "text.secondary" }}>
                                                                        <CalendarMonth sx={{ fontSize: 14 }} />
                                                                        <Typography variant="caption" fontWeight={600}>
                                                                            {es.exam_date}
                                                                        </Typography>
                                                                    </Stack>
                                                                </Box>
                                                                {!exam.is_locked && (
                                                                    <IconButton
                                                                        size="small"
                                                                        color="error"
                                                                        onClick={() => handleDeleteSubject(exam.id, es.subject_id)}
                                                                    >
                                                                        <Delete fontSize="small" />
                                                                    </IconButton>
                                                                )}
                                                            </Stack>
                                                            {es.syllabus && (
                                                                <Box sx={{ mt: 1 }}>
                                                                    <Typography variant="caption" color="text.secondary" fontWeight={800}>SYLLABUS:</Typography>
                                                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", mt: 0.2 }}>
                                                                        {es.syllabus}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>
                                                    ))}
                                                </Stack>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
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
