import { Typography, Paper, TextField, Button, Box, Grid, MenuItem, Alert, CircularProgress, Snackbar } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";
import api from "../../../api/axios";
import DatePickerField from "../../../components/DatePickerField";

const createExam = (data) => api.post("/exams", data);
const fetchAssignments = () => api.get("/teacher-assignments/teacher/me");

export default function ExamCreationPage() {
    const [loading, setLoading] = useState(false);
    const [assignmentsLoading, setAssignmentsLoading] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
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
            await createExam({
                class_id: Number(formData.class_id),
                name: formData.name.trim(),
                subjects: [
                    {
                        subject_id: Number(formData.subject_id),
                        exam_date: formData.exam_date,
                        syllabus: formData.syllabus?.trim() || null,
                    },
                ],
            });
            setSuccess(true);
            setFormData({
                name: "",
                subject_id: "",
                exam_date: "",
                syllabus: "",
                class_id: "",
            });
        } catch (err) {
            console.error("Failed to create exam", err);
            setError(err.response?.data?.message || "Failed to create exam");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ py: 4, px: 2, width: "100%" }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Create New Exam
            </Typography>

            <Paper
                component="form"
                onSubmit={handleSubmit}
                sx={{ p: 4, borderRadius: 2, width: "100%" }}
            >
                <Grid container spacing={3} sx={{ width: "100%" }}>
                    {error && (
                        <Grid item xs={12}>
                            <Alert severity="error">{error}</Alert>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <TextField
                            required
                            fullWidth
                            label="Exam Name"
                            name="name"
                            placeholder="e.g., Unit Test 1"
                            value={formData.name}
                            onChange={handleChange}
                            helperText="Creates this exam for the selected class"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <DatePickerField
                            label="Exam Date"
                            value={formData.exam_date}
                            onChange={(val) =>
                                setFormData((prev) => ({ ...prev, exam_date: val }))
                            }
                        />
                    </Grid>

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
                        >
                            {!formData.class_id && <MenuItem value="">Select class first</MenuItem>}
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

                    <Grid item xs={12}>
                        <TextField
                            select
                            required
                            label="Class"
                            name="class_id"
                            value={formData.class_id}
                            onChange={(event) => setFormData((prev) => ({ ...prev, class_id: event.target.value, subject_id: "" }))}
                            disabled={assignmentsLoading}
                            fullWidth
                            slotProps={{
                                select: {
                                    displayEmpty: true,
                                    renderValue: (selected) => {
                                        if (!selected) return "Select your class";
                                        const match = classOptions.find(
                                            (c) => String(c.class_id) === String(selected)
                                        );
                                        return match ? `Class ${match.class_name}` : `Class ${selected}`;
                                    },
                                },
                            }}
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: "100%", "& .MuiInputBase-root": { width: "100%" } }}
                        >
                            {assignmentsLoading && (
                                <MenuItem value="">
                                    <CircularProgress size={18} sx={{ mr: 1 }} />
                                    Loading classes...
                                </MenuItem>
                            )}
                            {!assignmentsLoading && classOptions.length === 0 && (
                                <MenuItem value="">
                                    No assigned classes
                                </MenuItem>
                            )}
                            {classOptions.map((c) => (
                                <MenuItem key={c.class_id} value={c.class_id}>
                                    Class {c.class_name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            minRows={3}
                            label="Syllabus"
                            name="syllabus"
                            placeholder="e.g., Fractions, decimals, Chapter 3 exercises"
                            value={formData.syllabus}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={loading || !formData.class_id || !formData.name.trim() || !formData.subject_id || !formData.exam_date}
                            startIcon={<Add />}
                            sx={{ mt: 2 }}
                        >
                            {loading ? "Scheduling..." : "Schedule Subject"}
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
                <Alert severity="success" onClose={() => setSuccess(false)}>
                    Exam subject scheduled successfully
                </Alert>
            </Snackbar>
        </Box>
    );
}
