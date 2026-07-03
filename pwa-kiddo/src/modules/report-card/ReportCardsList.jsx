import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Avatar,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    LinearProgress,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import {
    AutoGraph,
    Book,
    CalendarToday,
    EmojiEvents,
    Insights,
    Lock,
    Message,
    School,
    TrendingUp,
} from "@mui/icons-material";
import { listMyReportCards } from "./reportCard.api";
import api from "../../api/axios";

const getExamName = (exam) => exam?.name || exam?.master?.name || exam?.exam_master?.name || `Exam #${exam?.id}`;
const getExamSlots = (exam) => [...(exam?.exam_subjects || exam?.examSubjects || [])]
    .sort((a, b) => String(a.exam_date || "").localeCompare(String(b.exam_date || "")));
const getExamDateSummary = (exam) => {
    const slots = getExamSlots(exam);
    if (slots.length === 0) return "Schedule pending";
    const firstDate = new Date(slots[0].exam_date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    if (slots.length === 1) return firstDate;
    const lastDate = new Date(slots[slots.length - 1].exam_date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${firstDate} - ${lastDate}`;
};
const getSlotForMark = (exam, mark) => getExamSlots(exam).find((slot) => Number(slot.subject_id) === Number(mark.subject_id));
const clamp = (value) => Math.max(0, Math.min(100, value));

export default function ReportCardsList() {
    const theme = useTheme();
    const [reportCards, setReportCards] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedExamId, setSelectedExamId] = useState(null);

    useEffect(() => {
        fetchReportCards();
    }, []);

    async function fetchReportCards() {
        try {
            setLoading(true);
            const [reportRes, examRes] = await Promise.all([
                listMyReportCards(),
                api.get("/exams"),
            ]);
            const fetchedReports = reportRes.data.data || [];
            const fetchedExams = examRes.data.items || [];
            const reportOnlyExams = fetchedReports.map((report) => report.exam).filter(Boolean);
            const mergedExams = [...fetchedExams, ...reportOnlyExams]
                .filter((exam, index, list) => exam?.id && list.findIndex((item) => Number(item.id) === Number(exam.id)) === index);

            setReportCards(fetchedReports);
            setExams(mergedExams);

            if (mergedExams.length > 0) {
                setSelectedExamId(mergedExams[0].id);
            }
        } catch (err) {
            setError("Failed to load report cards.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const getGrade = (pct) => {
        if (pct >= 90) return { label: "A+", color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.12), text: theme.palette.success.dark };
        if (pct >= 80) return { label: "A", color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.12), text: theme.palette.success.dark };
        if (pct >= 70) return { label: "B", color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.12), text: theme.palette.primary.dark };
        if (pct >= 60) return { label: "C", color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.14), text: theme.palette.warning.dark };
        if (pct >= 50) return { label: "D", color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.14), text: theme.palette.warning.dark };
        return { label: "F", color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.12), text: theme.palette.error.dark };
    };

    const summaries = useMemo(() => exams.map((exam) => {
        const reportCard = reportCards.find((report) => Number(report.exam_id) === Number(exam.id));
        const marks = reportCard?.report_card_marks || reportCard?.marks || [];
        const obtained = marks.reduce((sum, mark) => sum + Number(mark.marks_obtained || 0), 0);
        const maxMarks = marks.reduce((sum, mark) => sum + Number(mark.max_marks || 0), 0);
        const percentage = maxMarks > 0 ? Math.round((obtained / maxMarks) * 100) : null;
        return {
            exam,
            reportCard,
            marks,
            obtained,
            maxMarks,
            percentage,
            published: Boolean(reportCard?.published_at),
        };
    }), [exams, reportCards]);

    const publishedSummaries = summaries.filter((item) => item.published && item.percentage !== null);
    const latest = publishedSummaries[0] || null;
    const subjectAverages = useMemo(() => {
        const buckets = new Map();
        publishedSummaries.forEach(({ exam, marks }) => {
            marks.forEach((mark) => {
                if (!mark.max_marks) return;
                const slot = getSlotForMark(exam, mark);
                const subject = mark.subject?.name || slot?.subject?.name || `Subject #${mark.subject_id}`;
                const values = buckets.get(subject) || [];
                values.push((Number(mark.marks_obtained || 0) / Number(mark.max_marks || 100)) * 100);
                buckets.set(subject, values);
            });
        });
        return [...buckets.entries()].map(([subject, values]) => ({
            subject,
            percentage: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length),
            tests: values.length,
        })).sort((a, b) => b.percentage - a.percentage);
    }, [publishedSummaries]);

    const strongSubject = subjectAverages[0];
    const focusSubject = subjectAverages[subjectAverages.length - 1];
    const selectedExam = summaries.find((item) => Number(item.exam.id) === Number(selectedExamId))?.exam;
    const selectedSummary = summaries.find((item) => Number(item.exam.id) === Number(selectedExamId));
    const selectedMarks = selectedSummary?.marks || [];
    const selectedGrade = getGrade(selectedSummary?.percentage || 0);

    if (loading) {
        return (
            <Container sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={42} thickness={4} />
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 2.5, mb: 8, px: 2 }}>
            <Stack spacing={2.5}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.04em", color: "text.primary" }}>
                        Exams & Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Your marks, syllabus notes, and subject-wise progress in one place.
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}

                <Paper
                    sx={{
                        p: 2,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.secondary?.main || theme.palette.primary.dark, 0.08)})`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                        boxShadow: "none",
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>
                            <Insights />
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={900}>Performance snapshot</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {latest ? `${getExamName(latest.exam)} • ${latest.percentage}%` : "No published marks yet"}
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
                        <Chip icon={<EmojiEvents />} label={latest ? `Latest ${latest.percentage}%` : "Latest pending"} />
                        <Chip icon={<TrendingUp />} color="success" variant="outlined" label={strongSubject ? `Strong: ${strongSubject.subject}` : "Strong subject pending"} />
                        <Chip icon={<AutoGraph />} color="warning" variant="outlined" label={focusSubject ? `Focus: ${focusSubject.subject}` : "Focus pending"} />
                    </Stack>
                </Paper>

                <Stack direction="row" spacing={1.2} sx={{ overflowX: "auto", pb: 0.5 }}>
                    {summaries.map(({ exam, percentage, published }) => {
                        const isSelected = Number(selectedExamId) === Number(exam.id);
                        return (
                            <Card
                                key={exam.id}
                                onClick={() => setSelectedExamId(exam.id)}
                                sx={{
                                    minWidth: 172,
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    border: "1px solid",
                                    borderColor: isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.8),
                                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                                    boxShadow: isSelected ? `0 12px 26px ${alpha(theme.palette.primary.main, 0.16)}` : "none",
                                }}
                            >
                                <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.12), color: "primary.main" }}>
                                            <School sx={{ fontSize: 18 }} />
                                        </Avatar>
                                        <Chip
                                            size="small"
                                            label={published ? "Published" : "Pending"}
                                            color={published ? "success" : "default"}
                                            variant={published ? "filled" : "outlined"}
                                            sx={{ height: 22, fontSize: "0.68rem", fontWeight: 800 }}
                                        />
                                    </Stack>
                                    <Typography variant="subtitle2" fontWeight={900} noWrap>{getExamName(exam)}</Typography>
                                    <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mt: 0.4, color: "text.secondary" }}>
                                        <CalendarToday sx={{ fontSize: 13 }} />
                                        <Typography variant="caption">{getExamDateSummary(exam)}</Typography>
                                    </Stack>
                                    <Typography variant="h6" fontWeight={950} color={published ? "primary.main" : "text.disabled"} sx={{ mt: 1 }}>
                                        {published && percentage !== null ? `${percentage}%` : "—"}
                                    </Typography>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>

                {selectedExam && selectedSummary && (
                    <Paper sx={{ p: 2, borderRadius: 4, boxShadow: "0 10px 30px rgba(15,23,42,0.06)" }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                            <Box>
                                <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 900 }}>
                                    Selected Exam
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 950, letterSpacing: "-0.03em" }}>
                                    {getExamName(selectedExam)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {getExamDateSummary(selectedExam)}
                                </Typography>
                            </Box>
                            {selectedSummary.published ? (
                                <Chip
                                    label={`${selectedSummary.percentage}% • ${selectedGrade.label}`}
                                    sx={{ bgcolor: selectedGrade.bg, color: selectedGrade.text, fontWeight: 900 }}
                                />
                            ) : (
                                <Chip icon={<Lock />} label="Report pending" variant="outlined" />
                            )}
                        </Stack>

                        {selectedSummary.published ? (
                            <Stack spacing={1.4}>
                                <Box>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" fontWeight={900}>Overall Score</Typography>
                                        <Typography variant="body2" fontWeight={900}>
                                            {selectedSummary.obtained}/{selectedSummary.maxMarks}
                                        </Typography>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={clamp(selectedSummary.percentage || 0)}
                                        sx={{
                                            mt: 0.8,
                                            height: 8,
                                            borderRadius: 8,
                                            bgcolor: alpha(selectedGrade.color, 0.12),
                                            "& .MuiLinearProgress-bar": { bgcolor: selectedGrade.color },
                                        }}
                                    />
                                </Box>

                                <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 0.7, fontWeight: 900 }}>
                                    <Book sx={{ fontSize: 18, color: "primary.main" }} />
                                    Subject marks
                                </Typography>
                                {selectedMarks.map((mark) => {
                                    const slot = getSlotForMark(selectedExam, mark);
                                    const subject = mark.subject?.name || slot?.subject?.name || `Subject #${mark.subject_id}`;
                                    const percentage = mark.max_marks > 0 ? Math.round((mark.marks_obtained / mark.max_marks) * 100) : 0;
                                    const grade = getGrade(percentage);
                                    return (
                                        <Paper key={mark.id} variant="outlined" sx={{ p: 1.5, borderRadius: 3 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2" fontWeight={900}>{subject}</Typography>
                                                <Chip size="small" label={`${mark.marks_obtained}/${mark.max_marks}`} sx={{ bgcolor: grade.bg, color: grade.text, fontWeight: 900 }} />
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={clamp(percentage)}
                                                sx={{
                                                    my: 1,
                                                    height: 6,
                                                    borderRadius: 6,
                                                    bgcolor: alpha(grade.color, 0.12),
                                                    "& .MuiLinearProgress-bar": { bgcolor: grade.color },
                                                }}
                                            />
                                            <Stack spacing={0.4}>
                                                {slot?.exam_date && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Date: {new Date(slot.exam_date).toLocaleDateString()}
                                                    </Typography>
                                                )}
                                                {slot?.syllabus && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        Syllabus: {slot.syllabus}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </Paper>
                                    );
                                })}

                                {selectedSummary.reportCard?.remarks && (
                                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.06) }}>
                                        <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 0.7, fontWeight: 900 }}>
                                            <Message sx={{ fontSize: 17, color: "info.main" }} />
                                            Teacher Remarks
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            {selectedSummary.reportCard.remarks}
                                        </Typography>
                                    </Paper>
                                )}
                            </Stack>
                        ) : (
                            <Box sx={{ py: 4, textAlign: "center" }}>
                                <Avatar sx={{ mx: "auto", mb: 1.2, bgcolor: alpha(theme.palette.text.disabled, 0.12), color: "text.disabled" }}>
                                    <Lock />
                                </Avatar>
                                <Typography variant="subtitle1" fontWeight={900}>Marks not published yet</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Once the teacher publishes this report card, your marks will appear here.
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                )}
            </Stack>
        </Container>
    );
}
