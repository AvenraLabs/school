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
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Collapse,
} from "@mui/material";
import { Add, Delete, CalendarMonth, Lock, LockOpen, ArrowForward, Check, ExpandMore, ExpandLess } from "@mui/icons-material";
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
    const [selectedSubjectId, setSelectedSubjectId] = useState("all");

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
            .filter((a) => 
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

    // Load exams for the selected class
    const loadExams = useCallback(async (classId) => {
        if (!classId) return;
        try {
            setExamsLoading(true);
            const res = await api.get("/exams", { params: { class_id: classId } });
            const data = res?.data?.items || res?.data?.data || [];
            setExams(data);
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

    // Filter exams by selected subject chip
    const filteredExams = useMemo(() => {
        if (selectedSubjectId === "all") return exams;
        return exams.filter((exam) =>
            (exam.exam_subjects || []).some(
                (es) => String(es.subject_id) === String(selectedSubjectId)
            )
        );
    }, [exams, selectedSubjectId]);

    const handleSelectClassSection = (cs) => {
        setSelectedClassId(cs.class_id);
        setSelectedSectionId(cs.section_id);
        setSelectedSubjectId("all");
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
            setSuccessMsg("Subject unscheduled successfully");
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

            setSuccessMsg("Test subject scheduled successfully");
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
        <Container maxWidth="sm" sx={{ mt: 3, pb: 12 }}>
            {/* Header & Page Title */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                <Typography variant="h5" fontWeight={900} sx={{ color: "text.primary", fontFamily: "'Outfit', sans-serif", m: 0 }}>
                    Exams
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/teacher/exams/insights")}
                    sx={{ textTransform: "none", borderRadius: "10px", fontWeight: "bold" }}
                >
                    View Analytics
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 3 }}>{error}</Alert>}

            {/* Horizontally Scrollable Class Switcher */}
            {assignmentsLoading ? (
                <Box sx={{ display: "flex", gap: 1, py: 1 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">Loading class assignments...</Typography>
                </Box>
            ) : classSections.length === 0 ? (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>No class sections assigned to you.</Alert>
            ) : (
                <Box>
                    <Typography variant="caption" fontWeight={800} color="text.secondary" display="block" sx={{ mb: 1, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Assigned Class & Section
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1.2,
                            overflowX: "auto",
                            pb: 1.5,
                            scrollbarWidth: "none",
                            "&::-webkit-scrollbar": { display: "none" },
                        }}
                    >
                        {classSections.map((cs) => {
                            const isSelected = String(selectedClassId) === String(cs.class_id) && String(selectedSectionId) === String(cs.section_id);
                            return (
                                <Chip
                                    key={cs.key}
                                    label={`Class ${cs.class_name} - ${cs.section_name}`}
                                    onClick={() => handleSelectClassSection(cs)}
                                    color={isSelected ? "primary" : "default"}
                                    variant={isSelected ? "filled" : "outlined"}
                                    icon={isSelected ? <Check sx={{ fontSize: "14px !important" }} /> : undefined}
                                    sx={{
                                        fontWeight: "bold",
                                        borderRadius: "10px",
                                        px: 0.5,
                                        py: 1.8,
                                        boxShadow: isSelected ? "0px 4px 10px rgba(25, 118, 210, 0.15)" : "none",
                                    }}
                                />
                            );
                        })}
                    </Box>
                </Box>
            )}

            {/* Subject Filter Chips */}
            {selectedClassId && subjectOptions.length > 0 && (
                <Box sx={{ mt: 1.5, mb: 3 }}>
                    <Typography variant="caption" fontWeight={800} color="text.secondary" display="block" sx={{ mb: 1, textTransform: "uppercase", letterSpacing: 0.5 }}>
                        Filter by Subject
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            overflowX: "auto",
                            pb: 1,
                            scrollbarWidth: "none",
                            "&::-webkit-scrollbar": { display: "none" },
                        }}
                    >
                        <Chip
                            label="All Subjects"
                            onClick={() => setSelectedSubjectId("all")}
                            color={selectedSubjectId === "all" ? "secondary" : "default"}
                            variant={selectedSubjectId === "all" ? "filled" : "outlined"}
                            sx={{ fontWeight: "bold", borderRadius: "16px" }}
                        />
                        {subjectOptions.map((sub) => {
                            const isSelected = String(selectedSubjectId) === String(sub.subject_id);
                            return (
                                <Chip
                                    key={sub.subject_id}
                                    label={sub.subject_name}
                                    onClick={() => setSelectedSubjectId(sub.subject_id)}
                                    color={isSelected ? "secondary" : "default"}
                                    variant={isSelected ? "filled" : "outlined"}
                                    sx={{ fontWeight: "bold", borderRadius: "16px" }}
                                />
                            );
                        })}
                    </Box>
                </Box>
            )}

            {/* Exams list */}
            {selectedClassId && (
                <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 2, color: "text.primary", fontFamily: "'Outfit', sans-serif" }}>
                        Scheduled Exams ({filteredExams.length})
                    </Typography>

                    {examsLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                            <CircularProgress size={30} />
                        </Box>
                    ) : filteredExams.length === 0 ? (
                        <Card sx={{ borderRadius: 4, border: "1px solid rgba(0,0,0,0.05)", bgcolor: "action.hover", boxShadow: "none" }}>
                            <CardContent sx={{ textAlign: "center", py: 5 }}>
                                <Typography color="text.secondary" variant="body2" fontWeight={500}>
                                    No tests scheduled matching selected filter.
                                </Typography>
                            </CardContent>
                        </Card>
                    ) : (
                        <Stack spacing={2.5}>
                             {filteredExams.map((exam) => {
                                 const subjectsList = exam.exam_subjects || [];
                                 const isExpanded = expandedExamId === exam.id;
                                 return (
                                     <Card key={exam.id} sx={{ borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "none" }}>
                                         <Box 
                                             onClick={() => setExpandedExamId(isExpanded ? null : exam.id)} 
                                             sx={{ p: 2, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                         >
                                             <Stack direction="row" alignItems="center" spacing={1.5}>
                                                 <Typography fontWeight="800" variant="subtitle1" sx={{ fontFamily: "'Outfit', sans-serif" }}>
                                                     {exam.name}
                                                 </Typography>
                                                 <Chip
                                                     label={exam.is_locked ? "Locked" : "Active"}
                                                     size="small"
                                                     color={exam.is_locked ? "default" : "success"}
                                                     icon={exam.is_locked ? <Lock sx={{ fontSize: 13 }} /> : <LockOpen sx={{ fontSize: 13 }} />}
                                                     sx={{ fontWeight: 800, height: 22, borderRadius: "6px" }}
                                                 />
                                             </Stack>
                                             <IconButton size="small">
                                                 {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                             </IconButton>
                                         </Box>

                                         <Collapse in={isExpanded}>
                                             <CardContent sx={{ p: 2, pt: 0, "&:last-child": { pb: 2 } }}>
                                                 <Divider sx={{ mb: 2 }} />

                                                 {subjectsList.length === 0 ? (
                                                     <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mb: 2 }}>
                                                         No subjects scheduled for this exam yet.
                                                     </Typography>
                                                 ) : (
                                                     <Stack spacing={2} sx={{ mb: 2.5 }}>
                                                         {subjectsList.map((es) => {
                                                             const subjectName = es.subject?.name || es.Subject?.name || `Subject ${es.subject_id}`;
                                                             return (
                                                                 <Box key={es.subject_id} sx={{ p: 1.8, bgcolor: "action.hover", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.02)" }}>
                                                                     <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                                                         <Box>
                                                                             <Typography variant="subtitle2" fontWeight="bold">
                                                                                 {subjectName}
                                                                             </Typography>
                                                                             <Stack direction="row" spacing={1.5} sx={{ mt: 0.5 }}>
                                                                                 <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "text.secondary" }}>
                                                                                     <CalendarMonth sx={{ fontSize: 14 }} />
                                                                                     <Typography variant="caption" fontWeight={600}>
                                                                                         {es.exam_date ? dayjs(es.exam_date).format("DD-MM-YYYY") : ""}
                                                                                     </Typography>
                                                                                 </Stack>
                                                                                 <Typography variant="caption" fontWeight={700} color="primary.main">
                                                                                     Max Marks: {es.max_marks || 100}
                                                                                 </Typography>
                                                                             </Stack>
                                                                         </Box>
                                                                         {!exam.is_locked && (
                                                                             <IconButton
                                                                                 size="small"
                                                                                 color="error"
                                                                                 onClick={() => handleDeleteClick(exam.id, es.subject_id)}
                                                                             >
                                                                                 <Delete fontSize="small" />
                                                                             </IconButton>
                                                                         )}
                                                                     </Stack>
                                                                     {es.syllabus && (
                                                                         <Box sx={{ mt: 1, pt: 1, borderTop: "1px dashed rgba(0,0,0,0.05)" }}>
                                                                             <Typography variant="caption" color="text.secondary" fontWeight={800}>SYLLABUS:</Typography>
                                                                             <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", mt: 0.1 }}>
                                                                                 {es.syllabus}
                                                                             </Typography>
                                                                         </Box>
                                                                     )}
                                                                 </Box>
                                                             );
                                                         })}
                                                     </Stack>
                                                 )}

                                                 <Button
                                                     fullWidth
                                                     variant="contained"
                                                     color="primary"
                                                     endIcon={<ArrowForward />}
                                                     onClick={() => navigate(`/teacher/exams/${exam.id}/marks?class_id=${selectedClassId}&section_id=${selectedSectionId}`)}
                                                     sx={{
                                                         borderRadius: "12px",
                                                         textTransform: "none",
                                                         fontWeight: "bold",
                                                         py: 1.2,
                                                         boxShadow: "none",
                                                     }}
                                                 >
                                                     Enter Marks
                                                 </Button>
                                             </CardContent>
                                         </Collapse>
                                     </Card>
                                 );
                             })}
                        </Stack>
                    )}
                </Box>
            )}

            {/* Floating Action Button for scheduling test */}
            {selectedClassId && (
                <Fab
                    color="primary"
                    aria-label="schedule-test"
                    onClick={() => {
                        setError("");
                        setDialogOpen(true);
                    }}
                    sx={{
                        position: "fixed",
                        bottom: 90,
                        right: 24,
                        boxShadow: "0px 6px 20px rgba(0,0,0,0.15)",
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
                    sx: { borderRadius: "20px", p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 900, pb: 1, fontFamily: "'Outfit', sans-serif" }}>
                    Schedule a New Test
                </DialogTitle>
                <Box component="form" onSubmit={handleScheduleSubmit}>
                    <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 1 }}>
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
                            <MenuItem value="new" sx={{ fontWeight: "bold", color: "primary.main" }}>
                                + Create New Exam...
                            </MenuItem>
                            {exams.map((exam) => (
                                <MenuItem key={exam.id} value={exam.id} disabled={exam.is_locked}>
                                    {exam.name} {exam.is_locked ? "(Locked) 🔒" : ""}
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
                            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={saveLoading}
                            sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, px: 3 }}
                        >
                            {saveLoading ? "Saving..." : "Save Test"}
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
                <Alert severity="success" onClose={() => setSuccess(false)} sx={{ borderRadius: 2 }}>
                    {successMsg}
                </Alert>
            </Snackbar>
        </Container>
    );
}
