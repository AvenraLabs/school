import { Box, Typography, Button, Paper, Container, Grid, Card, CardContent, Chip, CircularProgress, Stack, ToggleButtonGroup, ToggleButton, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Divider } from "@mui/material";
import { PlayArrow, Stop, Timer, Class, AccessTime, History } from "@mui/icons-material";
import { useState, useEffect, useMemo } from "react";
import { startClassSession, endClassSession, listClassSessions, markSessionAttendance, listStudentsBySection, getSessionAttendance } from "../teacherSession.api";
import { useAuth } from "../../../auth/AuthProvider";
import { useTeacherTimetable } from "../../teacher-timetable/useTeacherTimetable";
import DatePickerField from "../../../components/DatePickerField";

export default function ClassSessionPage() {
    const { user } = useAuth();
    const { timetable, loading: timetableLoading } = useTeacherTimetable();

    const [activeSession, setActiveSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [sessions, setSessions] = useState([]);
    const [sessionLoading, setSessionLoading] = useState(false);
    const [dateFilter, setDateFilter] = useState("today"); // today | yesterday | custom | all
    const [customDate, setCustomDate] = useState("");
    const [attendanceOpen, setAttendanceOpen] = useState(false);
    const [attendanceStudents, setAttendanceStudents] = useState([]);
    const [attendanceSubmitting, setAttendanceSubmitting] = useState(false);
    const [attendanceSessionId, setAttendanceSessionId] = useState(null);

    // Timer effect
    useEffect(() => {
        let interval;
        if (activeSession) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeSession]);

    useEffect(() => {
        fetchSessions();
    }, [dateFilter, customDate]);

    const filterDateValue = useMemo(() => {
        if (dateFilter === "today") return new Date();
        if (dateFilter === "yesterday") {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            return d;
        }
        if (dateFilter === "custom" && customDate) return new Date(customDate);
        return null;
    }, [dateFilter, customDate]);

    const fetchSessions = async () => {
        try {
            setSessionLoading(true);
            const iso = filterDateValue
                ? filterDateValue.toISOString().slice(0, 10)
                : undefined;
            const res = await listClassSessions(iso);
            const items = res.data?.items || res.data || [];
            setSessions(items);

            if (!activeSession) {
                const ongoing = items.find((s) => !s.ended_at);
                if (ongoing) {
                    const startedAt = new Date(ongoing.started_at);
                    setActiveSession({
                        ...ongoing,
                        startTime: startedAt,
                    });
                    const elapsed = Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000));
                    setElapsedTime(elapsed);
                }
            }
        } catch (err) {
            console.error("Failed to load sessions", err);
            setSessions([]);
        } finally {
            setSessionLoading(false);
        }
    };

    const handleStartClass = async (timetableEntry) => {
        try {
            setLoading(true);
            const res = await startClassSession({
                timetable_id: timetableEntry.id,
                class_id: timetableEntry.class_id,
                section_id: timetableEntry.section_id,
                subject_id: timetableEntry.subject_id
            });
            const started = res.data?.data || res.data;
            setActiveSession({
                ...timetableEntry,
                ...started,
                startTime: new Date(started?.started_at || Date.now()),
            });
            setElapsedTime(0);
            fetchSessions();
            openAttendance(started.id || started?.data?.id || started?.id, timetableEntry);
        } catch (err) {
            console.error("Failed to start class", err);
            // In a real app, show toast error
        } finally {
            setLoading(false);
        }
    };

    const handleEndClass = async () => {
        if (!activeSession) return;
        try {
            setLoading(true);
            await endClassSession(activeSession.id);
            setActiveSession(null);
            setElapsedTime(0);
            fetchSessions();
        } catch (err) {
            console.error("Failed to end class", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEndById = async (sessionId) => {
        if (!sessionId) return;
        try {
            setLoading(true);
            await endClassSession(sessionId);
            if (activeSession?.id === sessionId) {
                setActiveSession(null);
                setElapsedTime(0);
            }
            fetchSessions();
        } catch (err) {
            console.error("Failed to end class", err);
        } finally {
            setLoading(false);
        }
    };

    const openAttendance = async (sessionId, timetableEntry) => {
        if (!sessionId || !timetableEntry) return;
        try {
            setAttendanceOpen(true);
            setAttendanceSessionId(sessionId);
            const classId = timetableEntry.class?.id || timetableEntry.class_id;
            const sectionId = timetableEntry.section?.id || timetableEntry.section_id;

            // Fetch students for this class/section
            const res = await listStudentsBySection(classId, sectionId);
            const students = res.data?.items || res.data || [];

            // Fetch existing marked attendance if any
            let markedMap = new Map();
            try {
                const attendanceRes = await getSessionAttendance(sessionId);
                const records = attendanceRes.data?.records || [];
                markedMap = new Map(records.map((r) => [String(r.student_id), r.status]));
            } catch (err) {
                console.error("Failed to load existing attendance records", err);
            }

            setAttendanceStudents(
                students.map((s) => ({
                    id: s.id,
                    name: (s.user?.name || s.name || "").trim(),
                    status: markedMap.get(String(s.id)) || "present",
                }))
            );
        } catch (err) {
            console.error("Failed to load students", err);
            setAttendanceStudents([]);
        }
    };

    const submitAttendance = async () => {
        try {
            setAttendanceSubmitting(true);
            const records = attendanceStudents.map((s) => ({
                student_id: s.id,
                status: s.status,
            }));
            await markSessionAttendance(attendanceSessionId, records);
            setAttendanceOpen(false);
            setAttendanceSessionId(null);
            fetchSessions();
        } catch (err) {
            console.error("Failed to submit attendance", err);
        } finally {
            setAttendanceSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatClock = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

    if (timetableLoading) return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
        
            {/* Active Session Card */}
            {activeSession ? (
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: 4,
                        mb: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.1 }}>
                        <Timer sx={{ fontSize: 200 }} />
                    </Box>

                    <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.8 }}>
                        LIVE CLASS IN PROGRESS
                    </Typography>

                    <Typography variant="h2" sx={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {formatTime(elapsedTime)}
                    </Typography>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            {activeSession.subject?.name || "Subject"}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                            Class {activeSession.class?.class_name || activeSession.class?.name} - {activeSession.section?.name}
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        color="error"
                        size="large"
                        startIcon={<Stop />}
                        onClick={handleEndClass}
                        disabled={loading}
                        sx={{ mt: 2, px: 4, py: 1.5, borderRadius: 2, bgcolor: 'error.main' }}
                    >
                        End Session
                    </Button>
                </Paper>
            ) : (
                <Box sx={{ mb: 4, p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="h6" color="text.secondary">
                      Select a scheduled class.
                    </Typography>
                </Box>
            )}

            {/* Timetable / Upcoming Classes */}
            <Typography variant="h6" sx={{ mb: 2 }}>
                Today's Schedule
            </Typography>

            {(() => {
                const todayKey = new Date().toLocaleString("en-US", { weekday: "long" }).toLowerCase();
                const todaySlots = Array.isArray(timetable)
                    ? timetable
                    : (timetable?.[todayKey] || []);

                const todaySessions = sessions.filter((s) => {
                    const d = new Date(s.started_at);
                    return d.toDateString() === new Date().toDateString();
                });

                return (
            <Grid container spacing={2}>
                {todaySlots?.map((entry) => {
                    const matchingSession = todaySessions.find(
                        (s) => s.timetable_id == entry.id && !s.ended_at
                    );
                    const isFinished = todaySessions.some(
                        (s) =>
                            s.timetable_id == entry.id ||
                            (s.class_id == entry.class_id &&
                                s.section_id == entry.section_id &&
                                s.subject_id == entry.subject_id &&
                                s.ended_at)
                    );

                    return (
                        <Grid item xs={12} sm={6} md={4} key={entry.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderLeft: '4px solid #4f46e5' }}>
                                <CardContent sx={{ flex: 1 }}>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Chip
                                            icon={<AccessTime sx={{ fontSize: 16 }} />}
                                            label={`${entry.start_time} - ${entry.end_time}`}
                                            size="small"
                                            variant="outlined"
                                        />
                                        {entry.status === 'completed' && <Chip label="Done" color="success" size="small" />}
                                    </Box>

                                    <Typography variant="h6" gutterBottom>
                                        {entry.subject?.name}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', mb: 2 }}>
                                        <Class fontSize="small" />
                                        <Typography variant="body2">
                                            Class {entry.class?.class_name || entry.class?.name} ({entry.section?.name})
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        startIcon={<PlayArrow />}
                                        onClick={() => handleStartClass(entry)}
                                        disabled={
                                            activeSession ||
                                            entry.status === 'completed' ||
                                            loading ||
                                            isFinished
                                        }
                                    >
                                        {isFinished ? "Finished" : "Start"}
                                    </Button>
                                    {matchingSession && !matchingSession.ended_at && (
                                        <Button
                                            variant="contained"
                                            color="error"
                                            fullWidth
                                            startIcon={<Stop />}
                                            sx={{ mt: 1 }}
                                            onClick={() => handleEndById(matchingSession.id)}
                                            disabled={loading}
                                        >
                                            End
                                        </Button>
                                    )}
                                    {!activeSession && (
                                        <Button
                                            variant="text"
                                            fullWidth
                                            sx={{ mt: 1 }}
                                            onClick={() => matchingSession && openAttendance(matchingSession.id, entry)}
                                            disabled={!matchingSession}
                                        >
                                            {matchingSession ? "Mark Attendance" : "Attendance (start first)"}
                                        </Button>
                                    )}
                                    {isFinished && (
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            sx={{ mt: 1 }}
                                            onClick={() => {
                                                const finishedSession = todaySessions.find(
                                                    (s) => s.timetable_id == entry.id
                                                );
                                                if (finishedSession) {
                                                    openAttendance(finishedSession.id, entry);
                                                }
                                            }}
                                        >
                                            Edit Attendance
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
                );
            })()}

            {/* Past Sessions */}
            <Box sx={{ mt: 5 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <History fontSize="small" /> Session History
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <ToggleButtonGroup
                            value={dateFilter}
                            exclusive
                            size="small"
                            onChange={(_, val) => val && setDateFilter(val)}
                        >
                            <ToggleButton value="today">Today</ToggleButton>
                            <ToggleButton value="yesterday">Yesterday</ToggleButton>
                            <ToggleButton value="all">All</ToggleButton>
                            <ToggleButton value="custom">Pick date</ToggleButton>
                        </ToggleButtonGroup>
                        {dateFilter === "custom" && (
                            <Box sx={{ minWidth: 200 }}>
                                <DatePickerField
                                    label="Pick date"
                                    value={customDate}
                                    onChange={setCustomDate}
                                    size="small"
                                />
                            </Box>
                        )}
                    </Stack>
                </Stack>

            {sessionLoading ? (
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : sessions.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                        <Typography color="text.secondary">No sessions found.</Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={2}>
                        {sessions.map((s) => (
                            <Grid item xs={12} sm={6} md={4} key={s.id}>
                                <Card sx={{ borderLeft: '4px solid #0ea5e9' }}>
                                    <CardContent>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            {new Date(s.started_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </Typography>
                                        <Typography variant="h6" sx={{ mb: 1 }}>
                                            {s.subject?.name || "Subject"}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            Class {s.class?.name || s.class?.class_name || "-"} ({s.section?.name || "-"})
                                        </Typography>
                                        <Stack direction="row" spacing={1}>
                                            <Chip size="small" icon={<AccessTime sx={{ fontSize: 16 }} />} label={`${formatClock(s.started_at)} - ${formatClock(s.ended_at) || "ongoing"}`} />
                                        </Stack>
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            size="small"
                                            sx={{ mt: 2 }}
                                            onClick={() => openAttendance(s.id, s)}
                                        >
                                            {s.attendance_marked > 0 ? "Edit Attendance" : "Mark Attendance"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            <Dialog open={attendanceOpen} onClose={() => setAttendanceOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Mark Attendance</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Toggle to set status per student. Defaults to Present.
                    </Typography>
                    <Stack spacing={1.5}>
                        {attendanceStudents.map((s, idx) => (
                            <Paper key={s.id} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography>{s.name ? s.name : `ID ${s.id}`}</Typography>
                                <Stack direction="row" spacing={1}>
                                    {statusOptions.map((opt) => (
                                        <FormControlLabel
                                            key={opt.value}
                                            control={
                                                <Checkbox
                                                    checked={s.status === opt.value}
                                                    onChange={() => {
                                                        const next = [...attendanceStudents];
                                                        next[idx] = { ...s, status: opt.value };
                                                        setAttendanceStudents(next);
                                                    }}
                                                />
                                            }
                                            label={opt.label}
                                        />
                                    ))}
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAttendanceOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={submitAttendance}
                        disabled={attendanceSubmitting}
                    >
                        {attendanceSubmitting ? "Saving..." : "Save Attendance"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

const statusOptions = [
    { value: "present", label: "P" },
    { value: "absent", label: "A" },
];
