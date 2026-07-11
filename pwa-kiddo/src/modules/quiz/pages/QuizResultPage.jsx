import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Stack,
  Chip,
} from "@mui/material";
import { EmojiEvents } from "@mui/icons-material";
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

export default function QuizResultPage() {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await getQuizLeaderboard(id);
        setLeaderboard(res.data || []);
      } catch (err) {
        console.error(err);
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

  const myEntry = uniqueLeaderboard.find((p) => {
    const u = p.user || p.User;
    return u?.id === user?.id;
  }) || null;
  const myScore = myEntry?.score ?? 0;

  const backPath = "/student/quiz";

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
        {/* Trophy */}
        <EmojiEvents sx={{ fontSize: 64, color: "#FFD700", mb: 1 }} />
        <Typography
          variant="h4"
          fontWeight={900}
          sx={{ fontFamily: "'Outfit', sans-serif", mb: 0.5 }}
        >
          Game Over!
        </Typography>
        {myEntry && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You scored{" "}
            <strong style={{ color: theme.palette.primary.main }}>{myScore}</strong> points
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

        <Stack spacing={1.5}>
          {uniqueLeaderboard.map((player, idx) => {
            const u = player.user || player.User;
            const isMe = u?.id === user?.id;
            const isTop3 = idx < 3;

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
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary?.main || theme.palette.primary.dark, 0.06)})`
                    : isTop3
                    ? (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : "rgba(0,0,0,0.025)")
                    : "transparent",
                  border: isMe
                    ? `1.5px solid ${alpha(theme.palette.primary.main, 0.25)}`
                    : "1px solid transparent",
                  transition: "all 0.2s",
                }}
              >


                {/* Avatar */}
                <Avatar
                  src={getAssetUrl(u?.avatar_url) || ""}
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
                  {u?.name?.[0]?.toUpperCase() || "?"}
                </Avatar>

                {/* Name */}
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
                  {u?.name || "Player"}
                  {isMe && (
                    <Typography
                      component="span"
                      sx={{
                        ml: 0.8,
                        fontSize: "10px",
                        fontWeight: 700,
                        color: "primary.main",
                        opacity: 0.7,
                      }}
                    >
                      (you)
                    </Typography>
                  )}
                </Typography>

                {/* Score */}
                <Chip
                  label={player.score}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: "13px",
                    height: "26px",
                    minWidth: "44px",
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

        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(backPath)}
          sx={{
            mt: 4,
            borderRadius: "14px",
            py: 1.5,
            fontWeight: 800,
            fontSize: "15px",
            textTransform: "none",
            fontFamily: "'Outfit', sans-serif",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.dark})`,
            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
            "&:hover": {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary?.dark || theme.palette.primary.main})`,
            },
          }}
        >
          Back to Quiz Menu
        </Button>
      </Paper>
    </Box>
  );
}
