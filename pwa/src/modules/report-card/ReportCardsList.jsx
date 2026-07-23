import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Avatar,
    Box,
    Button,
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
    const navigate = useNavigate();
    const [reportCards, setReportCards] = useState([]);
    const [exams, setExams] = useState([]);
    const [gradingScales, setGradingScales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedExamId, setSelectedExamId] = useState(null);

    useEffect(() => {
        fetchReportCards();
    }, []);

    async function fetchReportCards() {
        try {
            setLoading(true);
            const [reportRes, examRes, scaleRes] = await Promise.all([
                listMyReportCards(),
                api.get("/exams"),
                api.get("/report-cards/grading-scales")
            ]);
            const fetchedReports = reportRes.data.data || [];
            const fetchedExams = examRes.data.items || [];
            const fetchedScales = scaleRes.data?.data || [];
            const reportOnlyExams = fetchedReports.map((report) => report.exam).filter(Boolean);
            const mergedExams = [...fetchedExams, ...reportOnlyExams]
                .filter((exam, index, list) => exam?.id && list.findIndex((item) => Number(item.id) === Number(exam.id)) === index);

            setReportCards(fetchedReports);
            setExams(mergedExams);
            setGradingScales(fetchedScales.sort((a, b) => b.min_percentage - a.min_percentage));

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

    const getGrade = useCallback((pct) => {
        const scale = gradingScales.find(s => pct >= s.min_percentage);
        if (scale) {
            return {
                label: scale.grade_name,
                color: scale.is_pass ? theme.palette.success.main : theme.palette.error.main,
                bg: alpha(scale.is_pass ? theme.palette.success.main : theme.palette.error.main, 0.12),
                text: scale.is_pass ? theme.palette.success.dark : theme.palette.error.dark
            };
        }
        if (pct >= 90) return { label: "A+", color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.12), text: theme.palette.success.dark };
        if (pct >= 80) return { label: "A", color: theme.palette.success.main, bg: alpha(theme.palette.success.main, 0.12), text: theme.palette.success.dark };
        if (pct >= 70) return { label: "B", color: theme.palette.primary.main, bg: alpha(theme.palette.primary.main, 0.12), text: theme.palette.primary.dark };
        if (pct >= 60) return { label: "C", color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.14), text: theme.palette.warning.dark };
        if (pct >= 50) return { label: "D", color: theme.palette.warning.main, bg: alpha(theme.palette.warning.main, 0.14), text: theme.palette.warning.dark };
        return { label: "F", color: theme.palette.error.main, bg: alpha(theme.palette.error.main, 0.12), text: theme.palette.error.dark };
    }, [gradingScales, theme]);

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
            published: Boolean(reportCard && (reportCard.report_card_marks || reportCard.marks || []).length > 0),
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
        <Container maxWidth="sm" sx={{ mt: 2.5, mb: 10, px: 2 }}>
            <Stack spacing={2.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: "-0.04em", color: "text.primary" }}>
                            Exams & Progress
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate("/student/report-cards/performance")}
                        sx={{ textTransform: "none", borderRadius: "10px", fontWeight: "bold" }}
                    >
                        Performance
                    </Button>
                </Stack>

                {error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}

                {/* Performance Snapshot */}
                <Card sx={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
                    <Box sx={{
                        px: 2.5, pt: 2.5, pb: 1.5,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || theme.palette.primary.dark} 100%)`,
                        color: 'white',
                    }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                            <Insights sx={{ fontSize: 18, opacity: 0.85 }} />
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>Performance Snapshot</Typography>
                        </Stack>
                        <Typography variant="h4" fontWeight={950} sx={{ lineHeight: 1.1 }}>
                            {latest ? `${latest.percentage}%` : "—"}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            {latest ? `Latest: ${getExamName(latest.exam)}` : "No graded marks yet"}
                        </Typography>
                    </Box>
                    <Box sx={{ px: 2.5, py: 2 }}>
                        <Stack direction="row" spacing={1.5}>
                            <Box sx={{ flex: 1, p: 1.5, borderRadius: '12px', bgcolor: alpha(theme.palette.success.main, 0.07), border: `1px solid ${alpha(theme.palette.success.main, 0.15)}` }}>
                                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.3 }}>
                                    <TrendingUp sx={{ fontSize: 14, color: 'success.main' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.65rem', textTransform: 'uppercase' }}>Best Subject</Typography>
                                </Stack>
                                <Typography variant="body2" fontWeight={900} noWrap color="success.dark">
                                    {strongSubject ? strongSubject.subject : "—"}
                                </Typography>
                                {strongSubject && <Typography variant="caption" color="text.secondary">{strongSubject.percentage}% avg</Typography>}
                            </Box>
                            <Box sx={{ flex: 1, p: 1.5, borderRadius: '12px', bgcolor: alpha(theme.palette.warning.main, 0.07), border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}` }}>
                                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.3 }}>
                                    <AutoGraph sx={{ fontSize: 14, color: 'warning.main' }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.65rem', textTransform: 'uppercase' }}>Needs Focus</Typography>
                                </Stack>
                                <Typography variant="body2" fontWeight={900} noWrap color="warning.dark">
                                    {focusSubject && focusSubject !== strongSubject ? focusSubject.subject : "—"}
                                </Typography>
                                {focusSubject && focusSubject !== strongSubject && <Typography variant="caption" color="text.secondary">{focusSubject.percentage}% avg</Typography>}
                            </Box>
                        </Stack>
                    </Box>
                </Card>

                {/* Exam List */}
                <Stack spacing={1.5}>
                    {summaries.map(({ exam, percentage, published }) => {
                        const isSelected = Number(selectedExamId) === Number(exam.id);
                        return (
                            <Card
                                key={exam.id}
                                onClick={() => setSelectedExamId(exam.id)}
                                sx={{
                                    borderRadius: '16px',
                                    cursor: "pointer",
                                    border: "1px solid",
                                    borderColor: isSelected ? theme.palette.primary.main : 'rgba(0,0,0,0.06)',
                                    bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.04) : "background.paper",
                                    boxShadow: isSelected ? `0 4px 20px ${alpha(theme.palette.primary.main, 0.14)}` : '0 1px 4px rgba(0,0,0,0.03)',
                                    transition: 'all 0.2s ease',
                                    overflow: 'hidden',
                                }}
                            >
                                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <Box sx={{ width: 4, borderRadius: 2, alignSelf: 'stretch', minHeight: 44, bgcolor: isSelected ? theme.palette.primary.main : 'rgba(0,0,0,0.1)' }} />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Typography variant="body2" fontWeight={900} noWrap>{getExamName(exam)}</Typography>
                                                <Chip
                                                    size="small"
                                                    label={published ? "Graded" : "Pending"}
                                                    color={published ? "success" : "default"}
                                                    variant={published ? "filled" : "outlined"}
                                                    sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800, ml: 1 }}
                                                />
                                            </Stack>
                                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 0.4 }}>
                                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: 'text.disabled' }}>
                                                    <CalendarToday sx={{ fontSize: 12 }} />
                                                    <Typography variant="caption" color="text.secondary">{getExamDateSummary(exam)}</Typography>
                                                </Stack>
                                                {published && percentage !== null && (
                                                    <Typography variant="caption" fontWeight={900} color="primary.main">{percentage}%</Typography>
                                                )}
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stack>

                {/* Selected Exam Detail */}
                {selectedExam && selectedSummary && (
                    <Card sx={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                        {/* Exam Header */}
                        <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.65rem' }}>
                                        Selected Exam
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 950, letterSpacing: "-0.03em", mt: 0.3 }} noWrap>
                                        {getExamName(selectedExam)}
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.3 }}>
                                        <CalendarToday sx={{ fontSize: 12, color: 'text.disabled' }} />
                                        <Typography variant="caption" color="text.secondary">{getExamDateSummary(selectedExam)}</Typography>
                                    </Stack>
                                </Box>
                                {selectedSummary.published ? (
                                    <Box sx={{ textAlign: 'center', ml: 2, flexShrink: 0 }}>
                                        <Box sx={{
                                            width: 60, height: 60, borderRadius: '50%',
                                            bgcolor: selectedGrade.bg,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            border: `2px solid ${selectedGrade.color}`,
                                        }}>
                                            <Typography variant="h6" fontWeight={950} sx={{ color: selectedGrade.text, lineHeight: 1 }}>{selectedGrade.label}</Typography>
                                        </Box>
                                        <Typography variant="caption" fontWeight={900} sx={{ color: selectedGrade.text, display: 'block', mt: 0.5 }}>
                                            {selectedSummary.percentage}%
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Chip icon={<Lock />} label="Pending" variant="outlined" size="small" sx={{ ml: 2 }} />
                                )}
                            </Stack>

                            {/* Overall score bar */}
                            {selectedSummary.published && (
                                <Box sx={{ mt: 2 }}>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                                        <Typography variant="caption" fontWeight={800} color="text.secondary">Overall Score</Typography>
                                        <Typography variant="caption" fontWeight={900}>{selectedSummary.obtained} / {selectedSummary.maxMarks}</Typography>
                                    </Stack>
                                    <Box sx={{ height: 8, borderRadius: 8, bgcolor: alpha(selectedGrade.color, 0.12), overflow: 'hidden' }}>
                                        <Box sx={{ height: '100%', width: `${clamp(selectedSummary.percentage || 0)}%`, bgcolor: selectedGrade.color, borderRadius: 8, transition: 'width 0.6s ease' }} />
                                    </Box>
                                </Box>
                            )}
                        </Box>

                        {/* Subject Marks */}
                        {selectedSummary.published ? (
                            <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
                                <Stack direction="row" alignItems="center" spacing={0.8} sx={{ mb: 1.5 }}>
                                    <Book sx={{ fontSize: 16, color: 'primary.main' }} />
                                    <Typography variant="subtitle2" fontWeight={900}>Subject Marks</Typography>
                                </Stack>
                                <Stack spacing={1.2}>
                                    {selectedMarks.map((mark) => {
                                        const slot = getSlotForMark(selectedExam, mark);
                                        const subject = mark.subject?.name || slot?.subject?.name || `Subject #${mark.subject_id}`;
                                        const pct = mark.max_marks > 0 ? Math.round((mark.marks_obtained / mark.max_marks) * 100) : 0;
                                        const grade = getGrade(pct);
                                        return (
                                            <Box key={mark.id} sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.04)' }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="body2" fontWeight={900} noWrap>{subject}</Typography>
                                                        {slot?.exam_date && (
                                                            <Typography variant="caption" color="text.disabled">
                                                                {new Date(slot.exam_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <Stack direction="row" spacing={0.8} alignItems="center" sx={{ ml: 1, flexShrink: 0 }}>
                                                        <Typography variant="body2" fontWeight={900}>{mark.marks_obtained}<Typography component="span" variant="caption" color="text.secondary">/{mark.max_marks}</Typography></Typography>
                                                        <Box sx={{ px: 1, py: 0.3, borderRadius: '6px', bgcolor: grade.bg }}>
                                                            <Typography variant="caption" fontWeight={900} sx={{ color: grade.text }}>{grade.label}</Typography>
                                                        </Box>
                                                    </Stack>
                                                </Stack>
                                                {/* Inline progress bar */}
                                                <Box sx={{ height: 5, borderRadius: 5, bgcolor: alpha(grade.color, 0.1), overflow: 'hidden' }}>
                                                    <Box sx={{ height: '100%', width: `${clamp(pct)}%`, bgcolor: grade.color, borderRadius: 5, transition: 'width 0.5s ease' }} />
                                                </Box>
                                                {slot?.syllabus && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.8, fontStyle: 'italic' }}>
                                                        {slot.syllabus}
                                                    </Typography>
                                                )}
                                            </Box>
                                        );
                                    })}
                                </Stack>

                                {/* Teacher Remarks */}
                                {selectedSummary.reportCard?.remarks && (
                                    <Box sx={{ mt: 2, p: 1.5, borderRadius: '12px', bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.15)}` }}>
                                        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mb: 0.6 }}>
                                            <Message sx={{ fontSize: 15, color: 'info.main' }} />
                                            <Typography variant="caption" fontWeight={800} color="info.dark" sx={{ textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: '0.65rem' }}>Teacher Remarks</Typography>
                                        </Stack>
                                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                            {selectedSummary.reportCard.remarks}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <Box sx={{ py: 5, textAlign: "center", px: 3 }}>
                                <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                                    <Lock sx={{ color: 'text.disabled', fontSize: 24 }} />
                                </Box>
                                <Typography variant="subtitle1" fontWeight={900}>Marks not graded yet</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    Once the teacher grades this report card, your marks will appear here.
                                </Typography>
                            </Box>
                        )}
                    </Card>
                )}
            </Stack>
        </Container>
    );
}

