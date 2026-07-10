import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Button, Paper, Avatar, List, ListItem, ListItemAvatar, ListItemText, Stack } from "@mui/material";
import { EmojiEvents } from "@mui/icons-material";
import { getQuizLeaderboard } from "../api/quiz.api";
import { useAuth } from "../../../auth/AuthProvider";
import { getAssetUrl } from "../../../utils/asset";

export default function QuizResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await getQuizLeaderboard(id);
        console.log("LEADERBOARD API RES:", res.data);
        setLeaderboard(res.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

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

  const myEntry =
    uniqueLeaderboard.find((p) => {
      const u = p.user || p.User;
      return u?.id === user?.id;
    }) || null;
  const myScore = myEntry?.score ?? 0;

  const isTeacher = location.pathname.startsWith("/teacher");
  const backPath = isTeacher ? "/teacher/quiz" : "/student/quiz";

  return (
    <Box sx={{ p: 3, mt: 4, textAlign: 'center' }}>
      <Paper sx={{ p: 4, borderRadius: 4 }}>
        <EmojiEvents sx={{ fontSize: 60, color: '#FFD700', mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Game Over!
        </Typography>

        <Box sx={{ mt: 4, mb: 4, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>Leaderboard</Typography>
          <List>
            {uniqueLeaderboard.map((player, idx) => {
              const u = player.user || player.User;
              return (
                <ListItem key={u?.id || idx} secondaryAction={
                  <Typography variant="h6" fontWeight="bold">{player.score} pts</Typography>
                }>
                  <ListItemAvatar>
                    <Avatar 
                      src={getAssetUrl(u?.avatar_url) || ""}
                      sx={{ 
                        border: idx === 0 ? '2px solid #FFD700' : idx === 1 ? '2px solid #C0C0C0' : idx === 2 ? '2px solid #CD7F32' : '1px solid rgba(0,0,0,0.06)',
                        width: 40,
                        height: 40
                      }}
                    >
                      {u?.name?.[0]?.toUpperCase() || "P"}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={`${idx + 1}. ${u?.name || "Player"}`}
                    primaryTypographyProps={{ fontWeight: u?.id === user?.id ? "bold" : "regular" }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Button variant="contained" fullWidth onClick={() => navigate(backPath)}>
          Back to Quiz Menu
        </Button>
      </Paper>
    </Box>
  );
}
