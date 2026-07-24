import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Button,
  Typography,
  Box,
  TextField,
  CircularProgress,
  Paper,
  LinearProgress,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import { EmojiEvents, School, ArrowBack } from "@mui/icons-material";
import { generateQuiz, startSingleQuiz, submitSingleQuiz } from "../api/quiz.api";
import QuestionCard from "../components/QuestionCard";
import { useAuth } from "../../../auth/AuthProvider";

export default function SinglePlayerQuizPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [gameState, setGameState] = useState("setup");
  const [topic, setTopic] = useState(location.state?.prefillTopic || "");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [difficulty, setDifficulty] = useState("EASY");
  const [numQuestions, setNumQuestions] = useState(5);
  const [answers, setAnswers] = useState([]);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Setup Phase: Start Quiz
  async function handleStart() {
    if (!topic.trim()) return;
    sessionStorage.setItem("last_quiz_topic", topic.trim());
    setGameState("loading");
    try {
      const res = await generateQuiz({
        topic,
        classLevel: user?.class_level || 5,
        difficulty,
        numQuestions,
      });

      const quizData = res.data?.questions || [];

      if (quizData.length > 0) {
        const startRes = await startSingleQuiz({
          quizId: res.data?.quizId,
          topic: topic.trim(),
          numQuestions,
          timeLimitMinutes: 5,
        });
        setSessionId(startRes.data?.sessionId || null);
        setPlayerId(startRes.data?.playerId || null);
        setQuestions(quizData);
        setAnswers([]);
        setScore(0);
        setCurrentIndex(0);
        setGameState("playing");
        setSelectedIndex(null);
      } else {
        alert("Could not generate questions. AI response was invalid.");
        setGameState("setup");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to start quiz.");
      setGameState("setup");
    }
  }

  // Playing Phase: Submit Answer
  async function handleAnswer(selectedIndex) {
    if (selectedIndex === null || selectedIndex === undefined) return;
    if (isAdvancing || isSubmitting) return;

    setIsAdvancing(true);
    setSelectedIndex(selectedIndex);
    const currentQ = questions[currentIndex];
    const isCorrect = selectedIndex === currentQ.correct_option_index;
    const nextAnswers = [
      ...answers,
      { questionId: currentQ.id, selectedIndex },
    ];
    setAnswers(nextAnswers);

    if (isCorrect) setScore(s => s + 1);

    // Wait a moment then move to next
    setTimeout(async () => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(p => p + 1);
        setSelectedIndex(null);
        setIsAdvancing(false);
      } else {
        try {
          if (playerId) {
            setIsSubmitting(true);
            const submitRes = await submitSingleQuiz({
              playerId,
              answers: nextAnswers,
            });
            if (submitRes?.data?.score !== undefined) {
              setScore(submitRes.data.score);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setIsSubmitting(false);
          setIsAdvancing(false);
          setGameState("result");
        }
      }
    }, 1000);
  }

  if (user?.role === "teacher") {
    return (
      <Container maxWidth="xs" sx={{ mt: 8, textAlign: "center" }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Single Player is not available for teachers
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create a multiplayer quiz instead.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/teacher/quiz")}>
            Go to Multiplayer
          </Button>
        </Paper>
      </Container>
    );
  }

  // Render Setup
  if (gameState === "setup") {
    return (
      <Container maxWidth="xs" sx={{ mt: 3, pb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/student/quiz")}
          sx={{ fontWeight: 800, color: "#475569", textTransform: "none", mb: 2 }}
        >
          Back
        </Button>
        <Paper sx={{ p: 4, borderRadius: "20px", textAlign: 'center', border: "1px solid #f1f5f9", boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
          <School sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            AI Quiz Master
          </Typography>

          <TextField
            label="Quiz Topic (e.g. Solar System)"
            fullWidth
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Stack spacing={2} sx={{ mb: 3, textAlign: "left" }}>
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", display: "block", mb: 1 }}>
                Number of questions
              </Typography>
              <Stack direction="row" spacing={1}>
                {[5, 10, 20].map((num) => (
                  <Button
                    key={num}
                    variant={numQuestions === num ? "contained" : "outlined"}
                    onClick={() => setNumQuestions(num)}
                    sx={{
                      borderRadius: "12px",
                      flex: 1,
                      py: 1,
                      fontWeight: 800,
                      textTransform: "none",
                      borderWidth: "1.5px",
                      "&:hover": { borderWidth: "1.5px" }
                    }}
                  >
                    {num}
                  </Button>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", display: "block", mb: 1 }}>
                Difficulty
              </Typography>
              <Stack direction="row" spacing={1}>
                {[
                  { value: "EASY", label: "Easy" },
                  { value: "HARD", label: "Hard" },
                ].map((diff) => (
                  <Button
                    key={diff.value}
                    variant={difficulty === diff.value ? "contained" : "outlined"}
                    onClick={() => setDifficulty(diff.value)}
                    sx={{
                      borderRadius: "12px",
                      flex: 1,
                      py: 1,
                      fontWeight: 800,
                      textTransform: "none",
                      borderWidth: "1.5px",
                      "&:hover": { borderWidth: "1.5px" }
                    }}
                  >
                    {diff.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          </Stack>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handleStart}
            disabled={!topic.trim()}
            sx={{ borderRadius: 2 }}
          >
            Start Quiz
          </Button>
        </Paper>
      </Container>
    );
  }

  // Render Loading
  if (gameState === "loading") {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
        <CircularProgress size={60} thickness={4} />
        <Typography sx={{ mt: 3, fontWeight: 500 }}>Generating Questions...</Typography>
      </Box>
    );
  }

  // Render Result
  if (gameState === "result") {
    const totalQ = questions.length || 5;
    const percentage = Math.round((score / totalQ) * 100);
    return (
      <Container maxWidth="xs" sx={{ mt: 6, textAlign: 'center' }}>
        <Paper sx={{ p: 4, borderRadius: "24px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <EmojiEvents sx={{ fontSize: 72, color: '#FFD700', mb: 1 }} />
          <Typography variant="h5" fontWeight={900} sx={{ color: "#0f172a", mb: 0.5 }}>
            Quiz Completed!
          </Typography>

          <Chip
            label={`Topic: ${topic || "General Knowledge"}`}
            size="small"
            sx={{ fontWeight: 800, mb: 2, bgcolor: "#eef2ff", color: "#4f46e5" }}
          />

          <Typography variant="h3" fontWeight={900} color="primary.main" gutterBottom>
            {score} / {totalQ}
          </Typography>

          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3, fontWeight: 700 }}>
            You scored {percentage}% ({score} out of {totalQ} correct)
          </Typography>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => {
              setGameState("setup");
              setCurrentIndex(0);
              setScore(0);
              setTopic("");
              setAnswers([]);
              setSessionId(null);
              setPlayerId(null);
              setSelectedIndex(null);
              setIsAdvancing(false);
              setIsSubmitting(false);
            }}
            sx={{ borderRadius: "14px", py: 1.5, fontWeight: 800, textTransform: "none" }}
          >
            Play Again
          </Button>
        </Paper>
      </Container>
    );
  }

  // Render Playing
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <LinearProgress variant="determinate" value={((currentIndex + 1) / questions.length) * 100} sx={{ height: 10, borderRadius: 5 }} />
        <Typography align="right" variant="caption">
          Question {currentIndex + 1} of {questions.length}
        </Typography>
      </Stack>

      <QuestionCard
        question={questions[currentIndex]}
        onAnswer={handleAnswer}
        selectedIndex={selectedIndex}
        disabled={isAdvancing || isSubmitting}
      />
    </Container>
  );
}
