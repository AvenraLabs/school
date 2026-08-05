import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  Chip,
} from "@mui/material";
import { Close, CheckCircle, Cancel, EmojiEvents, Replay } from "@mui/icons-material";
import { anatomyQuizzes } from "./anatomyData";

export default function AnatomyQuizModal({ open, onClose, targetOrganId }) {
  const quizzes = targetOrganId
    ? anatomyQuizzes.filter((q) => q.organId === targetOrganId)
    : anatomyQuizzes;

  const activeQuizList = quizzes.length > 0 ? quizzes : anatomyQuizzes;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Reset quiz state every time the modal opens or the active organ changes
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setScore(0);
      setIsCompleted(false);
    }
  }, [open, targetOrganId]);

  const currentQuiz = activeQuizList[currentIndex];

  const handleSelectOption = (idx) => {
    if (isAnswered) return;
    setSelectedOption(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
    if (selectedOption === currentQuiz.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < activeQuizList.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsCompleted(false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: "16px",
          bgcolor: "#FAFAF8",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justify: "space-between",
          borderBottom: "1px solid #E4E1D8",
          bgcolor: "#FFFFFF",
          py: 1.5,
          px: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EmojiEvents sx={{ color: "#2F6F5E" }} />
          <Typography variant="subtitle1" fontWeight={800} color="#14213D">
            Anatomy Quiz Challenge
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        {!isCompleted ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {/* Progress Header */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Chip
                label={`Question ${currentIndex + 1} of ${activeQuizList.length}`}
                size="small"
                sx={{ bgcolor: "#EAF3F0", color: "#2F6F5E", fontWeight: 700 }}
              />
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Score: {score}
              </Typography>
            </Box>

            {/* Question Text */}
            <Typography variant="subtitle1" fontWeight={800} color="#14213D" sx={{ lineHeight: 1.3 }}>
              {currentQuiz.question}
            </Typography>

            {/* Options */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {currentQuiz.options.map((opt, idx) => {
                let borderColor = "#E4E1D8";
                let bgColor = "#FFFFFF";
                let textColor = "#14213D";

                if (isAnswered) {
                  if (idx === currentQuiz.correctIndex) {
                    borderColor = "#10B981";
                    bgColor = "#D1FAE5";
                    textColor = "#065F46";
                  } else if (idx === selectedOption) {
                    borderColor = "#EF4444";
                    bgColor = "#FEE2E2";
                    textColor = "#991B1B";
                  }
                } else if (selectedOption === idx) {
                  borderColor = "#2F6F5E";
                  bgColor = "#EAF3F0";
                }

                return (
                  <Paper
                    key={idx}
                    variant="outlined"
                    onClick={() => handleSelectOption(idx)}
                    sx={{
                      p: 1.5,
                      borderColor: borderColor,
                      borderWidth: selectedOption === idx || isAnswered ? 2 : 1,
                      bgcolor: bgColor,
                      borderRadius: "12px",
                      cursor: isAnswered ? "default" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justify: "space-between",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} color={textColor}>
                      {opt}
                    </Typography>

                    {isAnswered && idx === currentQuiz.correctIndex && (
                      <CheckCircle sx={{ color: "#10B981", fontSize: 20 }} />
                    )}
                    {isAnswered && idx === selectedOption && idx !== currentQuiz.correctIndex && (
                      <Cancel sx={{ color: "#EF4444", fontSize: 20 }} />
                    )}
                  </Paper>
                );
              })}
            </Box>

            {/* Explanation box after answer */}
            {isAnswered && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderColor: "#E4E1D8",
                  bgcolor: "#FFFFFF",
                  borderRadius: "12px",
                }}
              >
                <Typography variant="caption" fontWeight={800} color="#2F6F5E">
                  EXPLANATION:
                </Typography>
                <Typography variant="body2" color="#14213D" sx={{ mt: 0.3, fontSize: 13 }}>
                  {currentQuiz.explanation}
                </Typography>
              </Paper>
            )}
          </Box>
        ) : (
          /* Completed Result Screen */
          <Box sx={{ py: 3, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <EmojiEvents sx={{ fontSize: 64, color: "#2F6F5E" }} />
            <Typography variant="h5" fontWeight={800} color="#14213D">
              Quiz Completed!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              You scored <strong>{score}</strong> out of <strong>{activeQuizList.length}</strong> questions correctly!
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid #E4E1D8", bgcolor: "#FFFFFF" }}>
        {!isCompleted ? (
          !isAnswered ? (
            <Button
              fullWidth
              variant="contained"
              disabled={selectedOption === null}
              onClick={handleSubmitAnswer}
              sx={{ bgcolor: "#2F6F5E", fontWeight: 800, textTransform: "none", py: 1, borderRadius: "10px" }}
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={handleNext}
              sx={{ bgcolor: "#2F6F5E", fontWeight: 800, textTransform: "none", py: 1, borderRadius: "10px" }}
            >
              {currentIndex + 1 < activeQuizList.length ? "Next Question" : "View Final Score"}
            </Button>
          )
        ) : (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Replay />}
            onClick={handleRestart}
            sx={{ borderColor: "#2F6F5E", color: "#2F6F5E", fontWeight: 800, textTransform: "none", py: 1, borderRadius: "10px" }}
          >
            Try Again
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
