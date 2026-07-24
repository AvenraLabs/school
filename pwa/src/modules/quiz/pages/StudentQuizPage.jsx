import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  CircularProgress,
  Chip,
  LinearProgress,
  Paper,
  Divider,
  Tab,
  Tabs,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Assignment,
  CheckCircle,
  Timer,
  QuizOutlined,
  School,
  ArrowForward,
  ArrowBack,
  AutoAwesome,
} from "@mui/icons-material";
import api from "../../../api/axios";
import { formatDate } from "../../../utils/date";

export default function StudentQuizPage() {
  const theme = useTheme();
  const [tab, setTab] = useState(0); // 0 = pending, 1 = completed
  const [pendingQuizzes, setPendingQuizzes] = useState([]);
  const [completedSubmissions, setCompletedSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    loadQuizzes();
  }, []);

  async function loadQuizzes() {
    setLoading(true);
    try {
      const [pendingRes, completedRes] = await Promise.all([
        api.get("/quizzes/student/pending"),
        api.get("/quizzes/student/completed"),
      ]);
      setPendingQuizzes(pendingRes.data?.quizzes || []);
      setCompletedSubmissions(completedRes.data?.submissions || []);
    } catch (e) {
      console.error("Failed to load student quizzes:", e);
    } finally {
      setLoading(false);
    }
  }

  async function startQuiz(quizId) {
    setLoading(true);
    try {
      const res = await api.get(`/quizzes/${quizId}`);
      setActiveQuiz(res.data?.quiz);
      setCurrentQuestionIdx(0);
      setAnswers({});
      setResultData(null);
    } catch (e) {
      console.error("Failed to fetch quiz details:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleOptionSelect = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  async function handleSubmitQuiz() {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/quizzes/${activeQuiz.id}/submit`, { answers });
      setResultData(res.data);
      await loadQuizzes();
    } catch (e) {
      console.error("Submission failed:", e);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !activeQuiz) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Active Quiz Attempt Screen
  if (activeQuiz) {
    const questions = activeQuiz.Questions || [];
    const currentQ = questions[currentQuestionIdx];
    const isLastQuestion = currentQuestionIdx === questions.length - 1;
    const progressPercent = ((currentQuestionIdx + 1) / questions.length) * 100;

    if (resultData) {
      return (
        <Box sx={{ p: 2.5, maxWidth: 650, mx: "auto" }}>
          <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center", bgcolor: "#FAF6F0" }}>
            <CheckCircle sx={{ fontSize: 60, color: "#10b981", mb: 1 }} />
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Quiz Submitted!
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "text.secondary", mt: 0.5 }}>
              Score: {resultData.score} / {resultData.totalMarks} ({resultData.percentage}%)
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" sx={{ fontWeight: 700, textAlign: "left", mb: 2 }}>
              Question Breakdown
            </Typography>

            {(resultData.breakdown || []).map((b, idx) => (
              <Box
                key={idx}
                sx={{
                  p: 2,
                  mb: 1.5,
                  borderRadius: 2,
                  bgcolor: b.isCorrect ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
                  border: `1px solid ${b.isCorrect ? "#10b98140" : "#ef444440"}`,
                  textAlign: "left",
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Q{idx + 1}: {b.questionText}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Your Answer: <b>{b.studentAnswer || "Not answered"}</b> ({b.isCorrect ? "Correct" : "Incorrect"})
                </Typography>
                {b.correctAnswer && !b.isCorrect && (
                  <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.3 }}>
                    Correct Answer: <b>{b.correctAnswer}</b>
                  </Typography>
                )}
                {b.explanation && (
                  <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mt: 0.5 }}>
                    💡 Explanation: {b.explanation}
                  </Typography>
                )}
              </Box>
            ))}

            <Button
              variant="contained"
              sx={{ mt: 2, px: 4, py: 1, borderRadius: 2, fontWeight: 700 }}
              onClick={() => {
                setActiveQuiz(null);
                setResultData(null);
              }}
            >
              Back to Homework Quizzes
            </Button>
          </Paper>
        </Box>
      );
    }

    return (
      <Box sx={{ p: 2.5, maxWidth: 650, mx: "auto" }}>
        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              Question {currentQuestionIdx + 1} of {questions.length}
            </Typography>
            <Chip
              label={`${activeQuiz.subject} - Ch ${activeQuiz.chapter}`}
              size="small"
              color="primary"
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Question Card */}
        {currentQ && (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              {currentQuestionIdx + 1}. {currentQ.question_text}
            </Typography>

            <FormControl component="fieldset" sx={{ width: "100%" }}>
              <RadioGroup
                value={answers[currentQ.id] || ""}
                onChange={(e) => handleOptionSelect(currentQ.id, e.target.value)}
              >
                {(currentQ.options || []).map((opt, oIdx) => (
                  <Paper
                    key={oIdx}
                    variant="outlined"
                    sx={{
                      p: 1.2,
                      px: 2,
                      mb: 1.2,
                      borderRadius: 2,
                      borderColor:
                        answers[currentQ.id] === opt
                          ? theme.palette.primary.main
                          : "rgba(0,0,0,0.12)",
                      bgcolor:
                        answers[currentQ.id] === opt
                          ? "rgba(15, 76, 129, 0.05)"
                          : "transparent",
                    }}
                  >
                    <FormControlLabel
                      value={opt}
                      control={<Radio />}
                      label={<Typography variant="body1" sx={{ fontWeight: 500 }}>{opt}</Typography>}
                      sx={{ width: "100%", m: 0 }}
                    />
                  </Paper>
                ))}
              </RadioGroup>
            </FormControl>

            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
              <Button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
                startIcon={<ArrowBack />}
              >
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  variant="contained"
                  color="success"
                  disabled={submitting}
                  onClick={handleSubmitQuiz}
                  sx={{ px: 3, fontWeight: 700 }}
                >
                  {submitting ? "Submitting..." : "Submit Homework Quiz"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                  endIcon={<ArrowForward />}
                  sx={{ px: 3, fontWeight: 700 }}
                >
                  Next Question
                </Button>
              )}
            </Box>
          </Paper>
        )}
      </Box>
    );
  }

  // Quiz List Screen
  return (
    <Box sx={{ p: 2.5, maxWidth: 750, mx: "auto" }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <QuizOutlined sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
        Homework Quizzes
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
        Complete teacher-assigned quizzes at your own pace to revise textbook chapters.
      </Typography>

      <Tabs value={tab} onChange={(e, val) => setTab(val)} sx={{ mb: 2 }}>
        <Tab label={`Pending (${pendingQuizzes.length})`} sx={{ fontWeight: 700 }} />
        <Tab label={`Completed (${completedSubmissions.length})`} sx={{ fontWeight: 700 }} />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {pendingQuizzes.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No pending homework quizzes right now. Great job staying up to date!
            </Alert>
          ) : (
            pendingQuizzes.map((q) => (
              <Card key={q.id} sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {q.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Subject: {q.subject} {q.chapter && `• Chapter ${q.chapter}`}
                      </Typography>
                    </Box>
                    <Chip label={q.difficulty || "MEDIUM"} size="small" color="primary" variant="outlined" />
                  </Box>

                  {q.instructions && (
                    <Typography variant="body2" sx={{ color: "text.secondary", my: 1 }}>
                      {q.instructions}
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                      <Chip icon={<Assignment sx={{ fontSize: 16 }} />} label={`${q.total_marks || 10} Marks`} size="small" />
                      <Chip icon={<Timer sx={{ fontSize: 16 }} />} label={`${q.estimated_minutes || 15} Mins`} size="small" />
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() => startQuiz(q.id)}
                      endIcon={<ArrowForward />}
                      sx={{ borderRadius: 2, fontWeight: 700, px: 2.5 }}
                    >
                      Start Homework
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {completedSubmissions.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              No completed homework quizzes yet.
            </Alert>
          ) : (
            completedSubmissions.map((sub) => (
              <Card key={sub.id} sx={{ borderRadius: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {sub.teacher_quiz?.title || "Homework Quiz"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        Submitted on {formatDate(sub.submitted_at)}
                      </Typography>
                    </Box>
                    <Chip
                      label={`Score: ${sub.score} / ${sub.total_marks}`}
                      color="success"
                      sx={{ fontWeight: 800, fontSize: "14px", px: 1 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}
    </Box>
  );
}
