import { Typography, Paper, TextField, Button, Box, Grid, MenuItem, Alert, CircularProgress, Snackbar, Container } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";
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
    
    const [formData, setFormData] = useState({
        subject_id: "",
        exam_date: "",
        syllabus: "",
        class_id: "",
    });

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

        let active = true;
        const loadExams = async () => {
            try {
                setExamsLoading(true);
                const res = await api.get("/exams", { params: { class_id: formData.class_id } });
                const data = res?.data?.items || res?.data?.data || [];
                if (!active) return;
                setExams(data);
                setSelectedExamId("");
                setNewExamName("");
            } catch (err) {
                console.error("Failed to load exams for class", err);
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
    }, [formData.class_id]);

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
                // 1. Create a new exam with the subject scheduled (backend POST /exams accepts subjects array)
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
                // 2. Schedule a subject on an existing exam via PUT /exams/:id/subjects
                await api.put(`/exams/${selectedExamId}/subjects`, {
                    subject_id: Number(formData.subject_id),
                    exam_date: formData.exam_date,
                    syllabus: formData.syllabus?.trim() || null,
                });
            }

            setSuccess(true);
            setFormData({
                subject_id: "",
                exam_date: "",
                syllabus: "",
                class_id: "",
            });
            setSelectedExamId("");
            setNewExamName("");
        } catch (err) {
            console.error("Failed to schedule exam subject", err);
            setError(err.response?.data?.message || "Failed to schedule exam subject");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 3, pb: 12 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: "text.primary" }}>
                Schedule Exam
            </Typography>

            <Paper
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: 4,
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "none",
                    bgcolor: "background.paper",
                    overflow: "hidden"
                }}
            >
                <Grid container spacing={2.5}>
                    {error && (
                        <Grid size={12}>
                            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
                        </Grid>
                    )}

                    {/* Class Dropdown */}
                    <Grid size={12}>
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
                    <Grid size={12}>
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
                                    {exam.name} {exam.is_locked ? "(Locked)" : ""}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    {/* New Exam Name Input */}
                    {selectedExamId === "new" && (
                        <Grid size={12}>
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
                    <Grid size={{ xs: 12, sm: 6 }}>
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
                    <Grid size={{ xs: 12, sm: 6 }}>
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
                    <Grid size={12}>
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
                    <Grid size={12}>
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

            <Snackbar
                open={success}
                autoHideDuration={2500}
                onClose={() => setSuccess(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="success" onClose={() => setSuccess(false)} sx={{ borderRadius: 2 }}>
                    Exam subject scheduled successfully
                </Alert>
            </Snackbar>
        </Container>
    );
}
