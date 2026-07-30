import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Stack,
  Chip,
  CircularProgress,
  Collapse,
} from "@mui/material";
import {
  EmojiEvents,
  Replay,
  Visibility,
  CheckCircle,
  Cancel,
  ExpandMore,
  ExpandLess,
  HelpOutline,
} from "@mui/icons-material";
import { getQuizLeaderboard } from "../api/quiz.api";
import { useAuth } from "../../../auth/AuthProvider";
import { getAssetUrl } from "../../../utils/asset";
import { useTheme, alpha } from "@mui/material/styles";

const RANK_MEDAL = ["🥇", "🥈", "🥉"];

const RANK_COLORS = [
  { bg: "linear-gradient(135deg,#FFD700,#FFA500)", text: "#7A4F00" },
  { bg: "linear-gradient(135deg,#C0C0C0,#9E9E9E)", text: "#3A3A3A" },
  { bg: "linear-gradient(135deg,#CD7F32,#A0522D)", text: "#fff" },
];

function ScoreRing({ score, total, size = 120 }) {
  const theme = useTheme();
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const colour =
    pct >= 80 ? "#22c55e" : pct >= 50 ? theme.palette.primary.main : "#f59e0b";

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        mb: 1,
      }}
    >
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={4}
        sx={{ color: "rgba(0,0,0,0.07)", position: "absolute" }}
      />
      <CircularProgress
        variant="determinate"
        value={pct}
        size={size}
        thickness={4}
        sx={{
          color: colour,
          position: "absolute",
          "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
        }}
      />
      <Box sx={{ textAlign: "center" }}>
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: size * 0.22,
            lineHeight: 1,
            color: colour,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {score}
          <Typography
            component="span"
            sx={{ fontSize: size * 0.13, fontWeight: 600, color: "text.secondary" }}
          >
            /{total}
          </Typography>
        </Typography>
        <Typography
          sx={{ fontSize: size * 0.115, fontWeight: 700, color: "text.secondary", mt: 0.3 }}
        >
          {pct}%
        </Typography>
      </Box>
    </Box>
  );
}

export default function QuizResultPage() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const stateData = location.state || {};

  const [topic, setTopic] = useState(stateData.topic || sessionStorage.getItem("last_quiz_topic") || "");
  const [totalQuestions, setTotalQuestions] = useState(stateData.totalQuestions || 0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [answersReview, setAnswersReview] = useState([]);
  const [showAnswers, setShowAnswers] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await getQuizLeaderboard(id);
        const data = res.data;
        if (data?.leaderboard) {
          setLeaderboard(data.leaderboard);
          if (data.answersReview) setAnswersReview(data.answersReview);
          if (data.topic && data.topic !== "Quiz") setTopic(data.topic);
          if (data.totalQuestions) setTotalQuestions(data.totalQuestions);
        } else if (Array.isArray(data)) {
          setLeaderboard(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Deduplicate by user id
  const uniqueLeaderboard = [];
  const seenUserIds = new Set();
  for (const entry of leaderboard) {
    const u = entry.user || entry.User;
    const uid = u?.id;
    if (uid) {
      if (!seenUserIds.has(uid)) {
        seenUserIds.add(uid);
        uniqueLeaderboard.push(entry);
      }
    } else {
      uniqueLeaderboard.push(entry);
    }
  }

  const maxScoreFound = Math.max(0, ...uniqueLeaderboard.map((p) => Number(p.score) || 0));
  const effectiveTotal = totalQuestions || (maxScoreFound > 0 ? maxScoreFound : 5);

  const myEntry = uniqueLeaderboard.find((p) => {
    const u = p.user || p.User;
    return u?.id === user?.id;
  }) || null;
  const myScore = myEntry?.score ?? 0;

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, mt: 3, textAlign: "center" }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: "24px",
          border: "1px solid rgba(0,0,0,0.06)",
          background: "#fff",
        }}
      >
        <EmojiEvents sx={{ fontSize: 52, color: "#FFD700", mb: 0.5 }} />
        <Typography
          variant="h4"
          fontWeight={900}
          sx={{ fontFamily: "'Outfit', sans-serif", mb: topic && topic !== "Quiz" ? 1 : 2 }}
        >
          Game Over!
        </Typography>

        {topic && topic !== "Quiz" && (
          <Chip
            label={`Topic: ${topic}`}
            size="small"
            sx={{ fontWeight: 800, mb: 2.5, bgcolor: "#eef2ff", color: "#4f46e5" }}
          />
        )}

        {/* Score Ring */}
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <ScoreRing score={myScore} total={effectiveTotal} size={120} />
        </Box>
        {myEntry && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {myScore} out of {effectiveTotal} correct
          </Typography>
        )}

        {/* Leaderboard */}
        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ mb: 2, textAlign: "left", fontFamily: "'Outfit', sans-serif" }}
        >
          Leaderboard
        </Typography>

        {uniqueLeaderboard.length === 0 ? (
          <Box
            sx={{
              py: 4,
              textAlign: "center",
              bgcolor: "rgba(0,0,0,0.02)",
              borderRadius: "12px",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No results available for this session.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {uniqueLeaderboard.map((player, idx) => {
              const u = player.user || player.User;
              const isMe = String(u?.id || player.user_id) === String(user?.id);
              const isTop3 = idx < 3;
              const displayName = isMe
                ? (user?.name || user?.username || u?.name || u?.username || "Player")
                : (u?.name || u?.username || "Player");
              const avatarSrc = isMe ? (user?.avatar_url || u?.avatar_url) : u?.avatar_url;

              return (
                <Box
                  key={u?.id || idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: "10px 14px",
                    borderRadius: "14px",
                    background: isMe
                      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(
                          theme.palette.secondary?.main || theme.palette.primary.dark,
                          0.06
                        )})`
                      : isTop3
                      ? theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.025)"
                      : "transparent",
                    border: isMe
                      ? `1.5px solid ${alpha(theme.palette.primary.main, 0.25)}`
                      : "1px solid transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <Typography sx={{ fontSize: "18px", width: 24, textAlign: "center", flexShrink: 0 }}>
                    {isTop3 ? RANK_MEDAL[idx] : `${idx + 1}`}
                  </Typography>

                  <Avatar
                    src={getAssetUrl(avatarSrc) || ""}
                    sx={{
                      width: 36,
                      height: 36,
                      fontSize: "14px",
                      fontWeight: 700,
                      border: isTop3
                        ? `2px solid ${["#FFD700", "#C0C0C0", "#CD7F32"][idx]}`
                        : "1.5px solid rgba(0,0,0,0.08)",
                      flexShrink: 0,
                    }}
                  >
                    {displayName?.[0]?.toUpperCase() || "?"}
                  </Avatar>

                  <Typography
                    sx={{
                      flex: 1,
                      fontWeight: isMe ? 800 : isTop3 ? 700 : 500,
                      fontSize: "14px",
                      textAlign: "left",
                      color: isMe ? "primary.main" : "text.primary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {displayName}
                    {isMe && (
                      <Typography
                        component="span"
                        sx={{ ml: 0.8, fontSize: "10px", fontWeight: 700, color: "primary.main", opacity: 0.7 }}
                      >
                        (you)
                      </Typography>
                    )}
                  </Typography>

                  <Chip
                    label={`${player.score} / ${effectiveTotal}`}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      fontSize: "12px",
                      height: "26px",
                      px: 0.5,
                      background: isTop3
                        ? RANK_COLORS[idx].bg
                        : alpha(theme.palette.primary.main, 0.08),
                      color: isTop3 ? RANK_COLORS[idx].text : "primary.main",
                      border: "none",
                      flexShrink: 0,
                    }}
                  />
                </Box>
              );
            })}
          </Stack>
        )}

        {/* Detailed Question Review Accordion */}
        {answersReview && answersReview.length > 0 && (
          <Box sx={{ mt: 3, textAlign: "left" }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Visibility />}
              endIcon={showAnswers ? <ExpandLess /> : <ExpandMore />}
              onClick={() => setShowAnswers(!showAnswers)}
              sx={{
                borderRadius: "14px",
                py: 1.3,
                fontWeight: 800,
                fontSize: "14px",
                textTransform: "none",
                fontFamily: "'Outfit', sans-serif",
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: "primary.main",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              {showAnswers ? "Hide Answers & Review" : "View Answers & Detailed Review"}
            </Button>

            <Collapse in={showAnswers} timeout="auto" unmountOnExit sx={{ mt: 2 }}>
              <Stack spacing={2}>
                {answersReview.map((q, idx) => {
                  const opts = Array.isArray(q.options) ? q.options : [];
                  return (
                    <Paper
                      key={q.id || idx}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: "14px",
                        border: "1px solid rgba(0,0,0,0.08)",
                        bgcolor: "#fafafa",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1, mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "14px", color: "#0f172a" }}>
                          Q{idx + 1}. {q.question_text}
                        </Typography>
                        {q.is_correct ? (
                          <Chip
                            icon={<CheckCircle sx={{ fontSize: "14px !important" }} />}
                            label="Correct"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 800, fontSize: "11px", height: "24px" }}
                          />
                        ) : q.answered ? (
                          <Chip
                            icon={<Cancel sx={{ fontSize: "14px !important" }} />}
                            label="Incorrect"
                            size="small"
                            color="error"
                            sx={{ fontWeight: 800, fontSize: "11px", height: "24px" }}
                          />
                        ) : (
                          <Chip
                            icon={<HelpOutline sx={{ fontSize: "14px !important" }} />}
                            label="Skipped"
                            size="small"
                            sx={{ fontWeight: 800, fontSize: "11px", height: "24px", bgcolor: "#f1f5f9", color: "#64748b" }}
                          />
                        )}
                      </Box>

                      {/* Options */}
                      <Stack spacing={1}>
                        {opts.map((opt, optIdx) => {
                          const isCorrect = optIdx === q.correct_option_index;
                          const isSelected = optIdx === q.selected_option_index;
                          const isWrongSelection = isSelected && !isCorrect;

                          let borderCol = "rgba(0,0,0,0.08)";
                          let bgCol = "#fff";
                          let textCol = "#334155";
                          let icon = null;

                          if (isCorrect) {
                            borderCol = "#22c55e";
                            bgCol = "#f0fdf4";
                            textCol = "#15803d";
                            icon = <CheckCircle sx={{ fontSize: 16, color: "#22c55e" }} />;
                          } else if (isWrongSelection) {
                            borderCol = "#ef4444";
                            bgCol = "#fef2f2";
                            textCol = "#b91c1c";
                            icon = <Cancel sx={{ fontSize: 16, color: "#ef4444" }} />;
                          }

                          return (
                            <Box
                              key={optIdx}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                p: "8px 12px",
                                borderRadius: "10px",
                                border: `1.5px solid ${borderCol}`,
                                bgcolor: bgCol,
                                color: textCol,
                                fontSize: "13px",
                                fontWeight: isCorrect || isSelected ? 700 : 500,
                              }}
                            >
                              <Typography sx={{ fontSize: "13px", fontWeight: "inherit", color: "inherit" }}>
                                {String.fromCharCode(65 + optIdx)}. {opt}
                              </Typography>
                              {icon}
                            </Box>
                          );
                        })}
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
            </Collapse>
          </Box>
        )}

        <Stack spacing={1.5} sx={{ mt: 4 }}>
          {topic && topic !== "Quiz" && (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<Replay />}
              onClick={() =>
                navigate("/student/quiz/single", {
                  state: { prefillTopic: topic },
                })
              }
              sx={{
                borderRadius: "14px",
                py: 1.4,
                fontWeight: 800,
                fontSize: "14px",
                textTransform: "none",
                fontFamily: "'Outfit', sans-serif",
                borderColor: alpha(theme.palette.primary.main, 0.4),
              }}
            >
              Play Again — {topic}
            </Button>
          )}

          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate("/student/quiz")}
            sx={{
              borderRadius: "14px",
              py: 1.5,
              fontWeight: 800,
              fontSize: "15px",
              textTransform: "none",
              fontFamily: "'Outfit', sans-serif",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${
                theme.palette.secondary?.main || theme.palette.primary.dark
              })`,
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
              "&:hover": {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${
                  theme.palette.secondary?.dark || theme.palette.primary.main
                })`,
              },
            }}
          >
            Back to Quiz Menu
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
