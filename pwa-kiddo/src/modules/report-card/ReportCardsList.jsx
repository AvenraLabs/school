import { useEffect, useState } from "react";
import { 
  Container, 
  Paper, 
  Typography, 
  CircularProgress, 
  Alert, 
  Stack, 
  Chip, 
  Box, 
  Card, 
  CardContent, 
  LinearProgress, 
  Avatar, 
  Divider,
  IconButton
} from "@mui/material";
import { 
  EmojiEvents, 
  CalendarToday, 
  Lock, 
  Message, 
  Book,
  School,
  ArrowForwardIos
} from "@mui/icons-material";
import { listMyReportCards } from "./reportCard.api";
import api from "../../api/axios";

export default function ReportCardsList() {
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
            
            setReportCards(fetchedReports);
            setExams(fetchedExams);
            
            if (fetchedExams.length > 0) {
                setSelectedExamId(fetchedExams[0].id);
            }
        } catch (err) {
            setError("Failed to load report cards.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const getGrade = (pct) => {
        if (pct >= 90) return { label: 'A+', color: '#10b981', bg: '#ecfdf5', text: '#065f46' };
        if (pct >= 80) return { label: 'A', color: '#10b981', bg: '#ecfdf5', text: '#065f46' };
        if (pct >= 70) return { label: 'B', color: '#3b82f6', bg: '#eff6ff', text: '#1e40af' };
        if (pct >= 60) return { label: 'C', color: '#f59e0b', bg: '#fffbeb', text: '#92400e' };
        if (pct >= 50) return { label: 'D', color: '#f59e0b', bg: '#fffbeb', text: '#92400e' };
        return { label: 'F', color: '#ef4444', bg: '#fef2f2', text: '#991b1b' };
    };

    if (loading) {
        return (
            <Container sx={{ mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress size={50} thickness={4} />
            </Container>
        );
    }

    // Find details of selected exam and its report card
    const selectedExam = exams.find(e => e.id === selectedExamId);
    const selectedRc = reportCards.find(r => Number(r.exam_id) === Number(selectedExamId));
    
    // Marks computations for selected report card
    const marksList = selectedRc?.report_card_marks || selectedRc?.marks || [];
    const totalObtained = marksList.reduce((sum, m) => sum + (m.marks_obtained || 0), 0);
    const totalMax = marksList.reduce((sum, m) => sum + (m.max_marks || 100), 0);
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    const gradeInfo = getGrade(percentage);

    return (
        <Container maxWidth="sm" sx={{ mt: 3, mb: 6, px: 2 }}>
            {/* Header Greeting */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 850, color: 'text.primary', mb: 0.5, letterSpacing: '-0.5px', fontSize: '1.65rem' }}>
                    Report Cards & Exams
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    Tap an exam card to view your marks and grades.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>
            )}

            {/* Carousel Section */}
            <Box
                sx={{
                    display: 'flex',
                    gap: 1.5,
                    overflowX: 'auto',
                    pb: 2,
                    pt: 0.5,
                    px: 0.5,
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                }}
            >
                {exams.map((exam) => {
                    const rc = reportCards.find(r => Number(r.exam_id) === Number(exam.id));
                    const isSelected = selectedExamId === exam.id;
                    const rcMarks = rc?.report_card_marks || rc?.marks || [];
                    const rcObtained = rcMarks.reduce((sum, m) => sum + (m.marks_obtained || 0), 0);
                    const rcMax = rcMarks.reduce((sum, m) => sum + (m.max_marks || 100), 0);
                    const rcPercentage = rcMax > 0 ? ((rcObtained / rcMax) * 100).toFixed(0) : null;
                    const isPublished = rc?.published_at != null;

                    return (
                        <Card
                            key={exam.id}
                            onClick={() => setSelectedExamId(exam.id)}
                            sx={{
                                minWidth: 165,
                                width: 165,
                                flexShrink: 0,
                                cursor: 'pointer',
                                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: '1px solid',
                                borderColor: isSelected ? 'transparent' : 'rgba(0,0,0,0.06)',
                                transform: isSelected ? 'scale(1.02)' : 'none',
                                boxShadow: isSelected 
                                    ? '0 10px 20px -6px rgba(79, 70, 229, 0.35)' 
                                    : '0 2px 8px rgba(0,0,0,0.02)',
                                borderRadius: '16px',
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                background: isSelected 
                                    ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' 
                                    : '#ffffff',
                                color: isSelected ? '#ffffff' : 'text.primary',
                            }}
                        >
                            <Box>
                                {/* Card Header with Icon and Status */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                    <Avatar 
                                        sx={{ 
                                            width: 32, 
                                            height: 32, 
                                            bgcolor: isSelected ? 'rgba(255,255,255,0.18)' : '#f1f5f9',
                                            color: isSelected ? '#ffffff' : '#6366f1',
                                        }}
                                    >
                                        <School sx={{ fontSize: 18 }} />
                                    </Avatar>

                                    {isPublished ? (
                                        <Chip 
                                            size="small" 
                                            label="Published" 
                                            sx={{ 
                                                height: 18, 
                                                fontSize: '0.62rem', 
                                                fontWeight: 800, 
                                                bgcolor: isSelected ? 'rgba(255,255,255,0.25)' : '#e6f4ea',
                                                color: isSelected ? '#ffffff' : '#137333',
                                            }} 
                                        />
                                    ) : exam.is_locked ? (
                                        <Chip 
                                            size="small" 
                                            icon={<Lock style={{ fontSize: 9, color: 'inherit' }} />} 
                                            label="Locked" 
                                            sx={{ 
                                                height: 18, 
                                                fontSize: '0.62rem', 
                                                fontWeight: 800, 
                                                bgcolor: isSelected ? 'rgba(255,255,255,0.25)' : '#fef7e0',
                                                color: isSelected ? '#ffffff' : '#b06000',
                                            }} 
                                        />
                                    ) : (
                                        <Chip 
                                            size="small" 
                                            label="Pending" 
                                            sx={{ 
                                                height: 18, 
                                                fontSize: '0.62rem', 
                                                fontWeight: 800, 
                                                bgcolor: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f3f4',
                                                color: isSelected ? '#ffffff' : '#5f6368',
                                            }} 
                                        />
                                    )}
                                </Box>

                                {/* Exam Name */}
                                <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                        fontWeight: 800, 
                                        fontSize: '0.92rem', 
                                        mt: 1,
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis', 
                                        whiteSpace: 'nowrap',
                                        color: isSelected ? '#ffffff' : 'text.primary',
                                    }}
                                >
                                    {exam.name}
                                </Typography>

                                {/* Exam Date Info */}
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        fontSize: '0.72rem',
                                        color: isSelected ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        mt: 0.3
                                    }}
                                >
                                    {new Date(exam.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </Typography>
                            </Box>

                            {/* Score Display at Bottom */}
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'baseline' }}>
                                {isPublished && rcPercentage ? (
                                    <>
                                        <Typography variant="h5" sx={{ fontWeight: 900, fontSize: '1.4rem', color: isSelected ? '#ffffff' : '#4f46e5' }}>
                                            {rcPercentage}%
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                ml: 0.5, 
                                                fontSize: '0.7rem',
                                                color: isSelected ? 'rgba(255,255,255,0.7)' : 'text.secondary' 
                                            }}
                                        >
                                            Score
                                        </Typography>
                                    </>
                                ) : (
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            fontWeight: 600, 
                                            color: isSelected ? 'rgba(255,255,255,0.6)' : 'text.disabled',
                                            fontStyle: 'italic', 
                                            fontSize: '0.78rem' 
                                        }}
                                    >
                                        No Marks
                                    </Typography>
                                )}
                            </Box>
                        </Card>
                    );
                })}
            </Box>

            {/* Details Section */}
            {selectedExam && (
                <Box sx={{ mt: 2 }}>
                    {selectedRc && selectedRc.published_at ? (
                        <Stack spacing={2.5}>
                            {/* Summary Performance Banner Card */}
                            <Card 
                                sx={{ 
                                    borderRadius: '20px', 
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', 
                                    color: '#ffffff',
                                    boxShadow: '0 8px 25px -8px rgba(79, 70, 229, 0.4)',
                                    p: 2.5
                                }}
                            >
                                <CardContent sx={{ p: '0 !important' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="overline" sx={{ opacity: 0.85, letterSpacing: '1px', fontWeight: 700, fontSize: '0.68rem' }}>
                                                Exam Report Card
                                            </Typography>
                                            <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.3 }}>
                                                {selectedExam.name}
                                            </Typography>
                                        </Box>
                                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.18)', width: 44, height: 44 }}>
                                            <EmojiEvents sx={{ fontSize: 24, color: '#ffffff' }} />
                                        </Avatar>
                                    </Box>

                                    {/* Score, Percentage, Grade row */}
                                    <Box sx={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(3, 1fr)', 
                                        gap: 1.5, 
                                        mt: 2.5, 
                                        pt: 2, 
                                        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                                        textAlign: 'center' 
                                    }}>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 900, fontSize: '1.4rem' }}>
                                                {percentage.toFixed(1)}%
                                            </Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.68rem', display: 'block' }}>
                                                Percentage
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 900, fontSize: '1.4rem' }}>
                                                {gradeInfo.label}
                                            </Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.68rem', display: 'block' }}>
                                                Overall Grade
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="h5" sx={{ fontWeight: 900, fontSize: '1.4rem' }}>
                                                {totalObtained}/{totalMax}
                                            </Typography>
                                            <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.68rem', display: 'block' }}>
                                                Total Marks
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            {/* Subjects Grades Cards */}
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                    <Book sx={{ fontSize: 16, color: 'primary.main' }} /> Subject Grades
                                </Typography>
                                <Stack spacing={1.5}>
                                    {marksList.map((m) => {
                                        const subName = m.subject?.name || `Subject #${m.subject_id}`;
                                        const subPercentage = m.max_marks > 0 ? (m.marks_obtained / m.max_marks) * 100 : 0;
                                        const subGrade = getGrade(subPercentage);

                                        return (
                                            <Paper 
                                                key={m.id}
                                                sx={{ 
                                                    borderRadius: '16px', 
                                                    p: 2, 
                                                    boxShadow: '0 2px 10px rgba(0,0,0,0.01)',
                                                    border: '1px solid rgba(0,0,0,0.04)',
                                                    bgcolor: '#ffffff'
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.9rem' }}>
                                                        {subName}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.88rem' }}>
                                                            {m.marks_obtained} <span style={{ color: '#94a3b8', fontWeight: 500 }}>/ {m.max_marks}</span>
                                                        </Typography>
                                                        <Chip 
                                                            size="small" 
                                                            label={subGrade.label} 
                                                            sx={{ 
                                                                fontWeight: 800, 
                                                                height: 20, 
                                                                borderRadius: '6px',
                                                                bgcolor: subGrade.bg,
                                                                color: subGrade.text,
                                                                fontSize: '0.72rem'
                                                            }} 
                                                        />
                                                    </Box>
                                                </Box>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={subPercentage} 
                                                    sx={{ 
                                                        height: 6, 
                                                        borderRadius: 3, 
                                                        bgcolor: '#f1f5f9',
                                                        '& .MuiLinearProgress-bar': { 
                                                            borderRadius: 3,
                                                            bgcolor: subGrade.color 
                                                        } 
                                                    }} 
                                                />
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            </Box>

                            {/* Remarks speech bubble card */}
                            {selectedRc.remarks && (
                                <Paper 
                                    sx={{ 
                                        borderRadius: '16px', 
                                        p: 2, 
                                        bgcolor: '#f8fafc', 
                                        border: '1px solid rgba(0,0,0,0.03)', 
                                        boxShadow: 'none' 
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                        <Message sx={{ fontSize: 16, color: 'primary.main' }} /> Teacher Remarks
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.5, fontSize: '0.85rem' }}>
                                        "{selectedRc.remarks}"
                                    </Typography>
                                </Paper>
                            )}
                        </Stack>
                    ) : (
                        // No Report Card State
                        <Paper sx={{ p: 4, py: 5, textAlign: 'center', borderRadius: '20px', border: '2px dashed rgba(0,0,0,0.06)', bgcolor: 'transparent', boxShadow: 'none' }}>
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                                <Avatar sx={{ bgcolor: '#f1f5f9', width: 52, height: 52, color: 'text.disabled' }}>
                                    <Lock sx={{ fontSize: 24 }} />
                                </Avatar>
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 850, mb: 0.5, color: 'text.primary', fontSize: '1rem' }}>
                                Report Card Pending
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280, mx: 'auto', lineHeight: 1.5, fontSize: '0.8rem' }}>
                                The report card for this exam has not been released. Please check back later.
                            </Typography>
                        </Paper>
                    )}
                </Box>
            )}
        </Container>
    );
}
