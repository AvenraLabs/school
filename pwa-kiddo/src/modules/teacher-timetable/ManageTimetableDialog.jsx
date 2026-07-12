import { useState, useMemo, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Alert,
    IconButton,
    Typography,
    Box,
    Divider,
    FormControlLabel,
    Checkbox,
    Grid
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { getSectionAssignments, saveTimetable, getTimetable } from "./teacherTimetable.api";

export default function ManageTimetableDialog({ open, onClose, onSuccess, classTeacherSections = [] }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [classSection, setClassSection] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState("monday");
    const [sectionAssignments, setSectionAssignments] = useState([]);

    // Entries state
    const [entries, setEntries] = useState([
        { start_time: "09:00", end_time: "10:00", teacher_assignment_id: "", title: "", is_break: false }
    ]);

    const classOptions = useMemo(() => {
        return classTeacherSections.map((a) => ({
            class_id: a.class_id,
            section_id: a.section_id,
            label: `${a.Class?.class_name || a.class?.class_name || a.class_id} - ${a.Section?.name || a.section?.name || a.section_id}`,
        }));
    }, [classTeacherSections]);

    useEffect(() => {
        if (!open) return;
        if (!classSection && classOptions.length === 1) {
            const only = classOptions[0];
            setClassSection(`${only.class_id},${only.section_id}`);
        }
    }, [open, classOptions, classSection]);

    useEffect(() => {
        async function loadAssignments() {
            if (!classSection) {
                setSectionAssignments([]);
                return;
            }

            const [, sectionId] = classSection.split(",");
            try {
                const res = await getSectionAssignments(sectionId);
                const data = res?.data?.data ?? res?.data ?? [];
                setSectionAssignments(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error(err);
                setSectionAssignments([]);
            }
        }
        loadAssignments();
    }, [classSection, open]);

    useEffect(() => {
        async function loadExistingTimetable() {
            if (!classSection || !open) return;
            const [classId, sectionId] = classSection.split(",");
            try {
                setError(null);
                const res = await getTimetable({ class_id: Number(classId), section_id: Number(sectionId) });
                const fullTimetable = res?.data?.data ?? {};
                const dayPeriods = fullTimetable[dayOfWeek] || [];
                if (dayPeriods.length > 0) {
                    setEntries(dayPeriods.map(p => ({
                        start_time: p.start_time?.slice(0, 5) || "",
                        end_time: p.end_time?.slice(0, 5) || "",
                        teacher_assignment_id: p.teacher_assignment_id || "",
                        title: p.title || "",
                        is_break: !!p.is_break
                    })));
                } else {
                    setEntries([{ start_time: "09:00", end_time: "10:00", teacher_assignment_id: "", title: "", is_break: false }]);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load existing timetable for this day");
                setEntries([{ start_time: "09:00", end_time: "10:00", teacher_assignment_id: "", title: "", is_break: false }]);
            }
        }
        loadExistingTimetable();
    }, [classSection, dayOfWeek, open]);


    const handleEntryChange = (index, field, value) => {
        const newEntries = [...entries];
        newEntries[index] = { ...newEntries[index], [field]: value };
        setEntries(newEntries);
    };

    const addEntry = () => {
        setEntries([...entries, { start_time: "", end_time: "", teacher_assignment_id: "", title: "", is_break: false }]);
    };

    const removeEntry = (index) => {
        setEntries(entries.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!classSection) {
            setError("Please select a class");
            return;
        }

        const invalid = entries.find((e) => !e.is_break && !e.teacher_assignment_id);
        if (invalid) {
            setError("Please select a teacher assignment for all non-break periods");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [classId, sectionId] = classSection.split(",");

            // Clean up entries
            const validEntries = entries.map(e => ({
                start_time: e.start_time,
                end_time: e.end_time,
                teacher_assignment_id: e.is_break ? undefined : parseInt(e.teacher_assignment_id),
                title: e.title,
                is_break: e.is_break
            }));

            await saveTimetable({
                class_id: parseInt(classId),
                section_id: parseInt(sectionId),
                day_of_week: dayOfWeek,
                entries: validEntries
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            setError("Failed to save timetable");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Manage Class Timetable</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {!classOptions.length && (
                        <Alert severity="info">
                            You are not assigned as a class teacher for any section.
                        </Alert>
                    )}

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <FormControl fullWidth disabled={!classOptions.length}>
                            <InputLabel>Class & Section</InputLabel>
                            <Select
                                value={classSection}
                                label="Class & Section"
                                onChange={(e) => setClassSection(e.target.value)}
                            >
                                {classOptions.map((opt) => (
                                    <MenuItem
                                        key={`${opt.class_id},${opt.section_id}`}
                                        value={`${opt.class_id},${opt.section_id}`}
                                    >
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Day</InputLabel>
                            <Select
                                value={dayOfWeek}
                                label="Day"
                                onChange={(e) => setDayOfWeek(e.target.value)}
                            >
                                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map(day => (
                                    <MenuItem key={day} value={day}>
                                        {day.charAt(0).toUpperCase() + day.slice(1)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Stack>

                    <Divider sx={{ my: 1 }}>Periods</Divider>

                    {/* Column Headers for larger screens */}
                    {entries.length > 0 && (
                        <Grid container spacing={2} sx={{ display: { xs: "none", md: "flex" }, px: 1, pb: 1, borderBottom: '2px solid', borderColor: 'divider', fontWeight: "bold" }}>
                            <Grid item md={3}>Time Range</Grid>
                            <Grid item md={1.5}>Is Break?</Grid>
                            <Grid item md={6.5}>Subject & Teacher / Break Label</Grid>
                            <Grid item md={1} sx={{ textAlign: "right" }}>Actions</Grid>
                        </Grid>
                    )}

                    <Stack spacing={2} divider={<Divider sx={{ display: { md: "none" } }} />}>
                        {entries.map((entry, index) => (
                            <Grid container spacing={2} alignItems="center" key={index} sx={{ py: { xs: 1.5, md: 0.5 } }}>
                                {/* Time Fields */}
                                <Grid item xs={12} md={3}>
                                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                        <TextField
                                            type="time"
                                            label="Start"
                                            value={entry.start_time}
                                            onChange={(e) => handleEntryChange(index, "start_time", e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            size="small"
                                            fullWidth
                                        />
                                        <TextField
                                            type="time"
                                            label="End"
                                            value={entry.end_time}
                                            onChange={(e) => handleEntryChange(index, "end_time", e.target.value)}
                                            InputLabelProps={{ shrink: true }}
                                            size="small"
                                            fullWidth
                                        />
                                    </Box>
                                </Grid>

                                {/* Is Break Checkbox */}
                                <Grid item xs={4} md={1.5}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <Checkbox
                                            checked={!!entry.is_break}
                                            onChange={(e) => {
                                                const val = e.target.checked;
                                                const newEntries = [...entries];
                                                newEntries[index] = {
                                                    ...newEntries[index],
                                                    is_break: val,
                                                    teacher_assignment_id: val ? "" : newEntries[index].teacher_assignment_id,
                                                    title: val ? newEntries[index].title : ""
                                                };
                                                setEntries(newEntries);
                                            }}
                                            size="small"
                                        />
                                        <Typography
                                            variant="body2"
                                            sx={{ cursor: "pointer", userSelect: "none" }}
                                            onClick={() => {
                                                const val = !entry.is_break;
                                                const newEntries = [...entries];
                                                newEntries[index] = {
                                                    ...newEntries[index],
                                                    is_break: val,
                                                    teacher_assignment_id: val ? "" : newEntries[index].teacher_assignment_id,
                                                    title: val ? newEntries[index].title : ""
                                                };
                                                setEntries(newEntries);
                                            }}
                                        >
                                            Break
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Assignment or Break title */}
                                <Grid item xs={6.5} md={6.5}>
                                    {entry.is_break ? (
                                        <TextField
                                            label="Break Label (e.g. Lunch)"
                                            value={entry.title}
                                            onChange={(e) => handleEntryChange(index, "title", e.target.value)}
                                            size="small"
                                            fullWidth
                                        />
                                    ) : (
                                        <FormControl fullWidth size="small" style={{ width: "100%", minWidth: "180px" }}>
                                            <InputLabel id={`label-assignment-${index}`}>Subject & Teacher</InputLabel>
                                            <Select
                                                labelId={`label-assignment-${index}`}
                                                value={entry.teacher_assignment_id || ""}
                                                label="Subject & Teacher"
                                                onChange={(e) => handleEntryChange(index, "teacher_assignment_id", e.target.value)}
                                                fullWidth
                                            >
                                                <MenuItem value=""><em>Select assignment</em></MenuItem>
                                                {sectionAssignments.map((a) => {
                                                    const subjectName = a.Subject?.name || a.subject?.name || "Subject";
                                                    const teacherName =
                                                        a.Teacher?.User?.name ||
                                                        a.teacher?.user?.name ||
                                                        a.teacher?.User?.name ||
                                                        "Teacher";
                                                    return (
                                                        <MenuItem key={a.id} value={a.id}>
                                                            {subjectName} - {teacherName}
                                                        </MenuItem>
                                                    );
                                                })}
                                            </Select>
                                        </FormControl>
                                    )}
                                </Grid>

                                {/* Delete */}
                                <Grid item xs={1.5} md={1} sx={{ textAlign: "right" }}>
                                    <IconButton onClick={() => removeEntry(index)} color="error" size="small">
                                        <Delete />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        ))}
                    </Stack>

                    <Button startIcon={<Add />} onClick={addEntry} sx={{ mt: 1, alignSelf: "flex-start" }}>
                        Add Period
                    </Button>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    Save Day
                </Button>
            </DialogActions>
        </Dialog>
    );
}
