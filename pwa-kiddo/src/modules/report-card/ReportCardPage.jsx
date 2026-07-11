import {
  Container,
  CircularProgress,
  Alert,
  Typography,
  Stack,
  Box,
  Card,
  CardContent,
  Avatar,
  Paper,
  LinearProgress,
  Chip,
  Button
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useReportCard } from "./useReportCard";
import { 
  EmojiEvents, 
  ArrowBack, 
  Book, 
  Message
} from "@mui/icons-material";

const getExamName = (exam) => exam?.name || exam?.master?.name || exam?.exam_master?.name || "Exam Report";
const getExamSlots = (exam) => [...(exam?.exam_subjects || exam?.examSubjects || [])]
  .sort((a, b) => String(a.exam_date || '').localeCompare(String(b.exam_date || '')));
const getSlotForMark = (exam, mark) => getExamSlots(exam).find((slot) => Number(slot.subject_id) === Number(mark.subject_id));

export default function ReportCardPage() {
  const { id } = useParams();
  const { data: rc, gradingScales, loading, error } = useReportCard(id);
  const navigate = useNavigate();

  if (loading) {
    return (
      <Container sx={{ mt: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={50} thickness={4} />
      </Container>
    );
  }

  if (error || !rc) {
    return (
      <Container sx={{ mt: 4, px: 2 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>{error || "Report card not found"}</Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/student/report-cards')} 
          sx={{ mt: 2, fontWeight: 700 }}
        >
          Back to list
        </Button>
      </Container>
    );
  }

  const marksList = rc.report_card_marks || rc.marks || [];
  const totalObtained = marksList.reduce((sum, m) => sum + (m.marks_obtained || 0), 0);
  const totalMax = marksList.reduce((sum, m) => sum + (m.max_marks || 100), 0);
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  
  const getGrade = (pct) => {
    const scale = gradingScales?.find(s => pct >= s.min_percentage);
    if (scale) {
      return {
        label: scale.grade_name,
        color: scale.color_code || '#10b981',
        bg: scale.color_code ? `${scale.color_code}1A` : '#ecfdf5',
        text: scale.color_code || '#065f46'
      };
    }
    if (pct >= 90) return { label: 'A+', color: '#10b981', bg: '#ecfdf5', text: '#065f46' };
    if (pct >= 80) return { label: 'A', color: '#10b981', bg: '#ecfdf5', text: '#065f46' };
    if (pct >= 70) return { label: 'B', color: '#3b82f6', bg: '#eff6ff', text: '#1e40af' };
    if (pct >= 60) return { label: 'C', color: '#f59e0b', bg: '#fffbeb', text: '#92400e' };
    if (pct >= 50) return { label: 'D', color: '#f59e0b', bg: '#fffbeb', text: '#92400e' };
    return { label: 'F', color: '#ef4444', bg: '#fef2f2', text: '#991b1b' };
  };
  const gradeInfo = getGrade(percentage);

  const studentName = rc.student?.user?.name || rc.Student?.User?.name || "Student";
  const exam = rc.exam || rc.Exam;
  const examName = getExamName(exam);

  return (
    <Container maxWidth="sm" sx={{ mt: 3, mb: 6, px: 2 }}>
      {/* Back link */}
      <Button 
        startIcon={<ArrowBack />} 
        onClick={() => navigate('/student/report-cards')} 
        sx={{ mb: 3, fontWeight: 750, fontSize: '0.85rem' }}
      >
        All Report Cards
      </Button>

      <Stack spacing={2.5}>
        {/* Performance summary card */}
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
                  Report Card for {studentName}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, mt: 0.3 }}>
                  {examName}
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.18)', width: 44, height: 44 }}>
                <EmojiEvents sx={{ fontSize: 24, color: '#ffffff' }} />
              </Avatar>
            </Box>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: 1.5, 
              mt: 2.5, 
              pt: 2, 
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              textAlign: 'center' 
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, fontSize: '1.4rem' }}>
                  {percentage.toFixed(1)}%
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.68rem', display: 'block' }}>
                  Percentage
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 900, fontSize: '1.4rem' }}>
                  {gradeInfo.label}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.68rem', display: 'block' }}>
                  Grade
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

        {/* Subjects breakdown */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.8rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            <Book sx={{ fontSize: 16, color: 'primary.main' }} /> Subject Grades
          </Typography>
          <Stack spacing={1.5}>
            {marksList.map((m) => {
              const slot = getSlotForMark(exam, m);
              const subName = m.subject?.name || slot?.subject?.name || `Subject #${m.subject_id}`;
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
                  {slot && (
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary', fontSize: '0.72rem' }}>
                      Date: {new Date(slot.exam_date).toLocaleDateString()}
                      {slot.syllabus ? ` • Syllabus: ${slot.syllabus}` : ''}
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Stack>
        </Box>


      </Stack>
    </Container>
  );
}
