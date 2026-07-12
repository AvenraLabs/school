import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Typography,
    Button,
    Paper,
    Avatar,
    Stack,
    CircularProgress,
    Chip,
    Divider,
    Dialog,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import {
    People,
    PlayArrow,
    StopCircleOutlined,
    ErrorOutline,
} from "@mui/icons-material";
import { useQuizSession } from "../hooks/useQuizSession";

export default function QuizLobbyPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const { status, players, isHost, startQuiz, forceEnd, cancelled, error } = useQuizSession(id);

    // roomCode to display — passed via router state on room creation
    const roomCode = location.state?.roomCode || id;

    // Navigate to play page when game starts
    useEffect(() => {
        if (status === "IN_PROGRESS") {
            navigate(`/student/quiz/${id}/play`, { replace: true });
        }
    }, [status, id, navigate]);

    // Navigate to results if host force-ended or all finished
    useEffect(() => {
        if (status === "FINISHED") {
            navigate(`/student/quiz/${id}/results`, { replace: true });
        }
    }, [status, id, navigate]);

    return (
        <Box sx={{ p: 2, mt: 3 }}>
            {/* ── Session Cancelled Dialog (host left lobby) ─────────────────── */}
            <Dialog
                open={cancelled}
                disableEscapeKeyDown
                PaperProps={{
                    sx: { borderRadius: "20px", p: 1, mx: 2, maxWidth: 340 },
                }}
            >
                <DialogContent sx={{ textAlign: "center", pt: 3, pb: 1 }}>
                    <ErrorOutline
                        sx={{ fontSize: 52, color: "error.main", mb: 1 }}
                    />
                    <Typography
                        variant="h6"
                        fontWeight={800}
                        sx={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                        Room Closed
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        {error || "The host has left. This room is no longer available."}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 3, pt: 1 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate("/student/quiz")}
                        sx={{
                            borderRadius: "12px",
                            px: 4,
                            fontWeight: 700,
                            textTransform: "none",
                        }}
                    >
                        Back to Quiz
                    </Button>
                </DialogActions>
            </Dialog>

            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    borderRadius: "24px",
                    border: "1px solid rgba(0,0,0,0.06)",
                    textAlign: "center",
                }}
            >
                {/* Header */}
                <Typography
                    variant="h5"
                    fontWeight={900}
                    sx={{ fontFamily: "'Outfit', sans-serif", mb: 0.5 }}
                >
                    Game Lobby
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                >
                    Share the code below with your friends!
                </Typography>

                {/* Room Code Display */}
                <Box
                    sx={{
                        display: "inline-block",
                        px: { xs: 3, sm: 4 },
                        py: { xs: 1.5, sm: 2 },
                        borderRadius: "16px",
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)}, ${alpha(theme.palette.secondary?.main || theme.palette.primary.dark, 0.08)})`,
                        border: `2px dashed ${alpha(theme.palette.primary.main, 0.35)}`,
                        mb: 3,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            fontWeight: 700,
                            color: "text.secondary",
                            textTransform: "uppercase",
                            letterSpacing: 2,
                            display: "block",
                            mb: 0.5,
                        }}
                    >
                        Room Code
                    </Typography>
                    <Typography
                        variant="h4"
                        fontWeight={900}
                        color="primary"
                        sx={{
                            letterSpacing: 4,
                            fontFamily: "'Outfit', monospace",
                            lineHeight: 1,
                        }}
                    >
                        {roomCode}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Players Section */}
                <Box sx={{ textAlign: "left", mb: 3 }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: 2 }}
                    >
                        <People fontSize="small" color="primary" />
                        <Typography variant="subtitle1" fontWeight={800}>
                            Players Joined
                        </Typography>
                        <Chip
                            label={players.length}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 800, height: 22 }}
                        />
                    </Stack>

                    {players.length === 0 ? (
                        <Box
                            sx={{
                                textAlign: "center",
                                py: 3,
                                borderRadius: "12px",
                                bgcolor: "action.hover",
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Waiting for players to join…
                            </Typography>
                        </Box>
                    ) : (
                        <Stack spacing={1}>
                            {players.map((p, idx) => (
                                <Box
                                    key={p.userId || idx}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        p: "10px 14px",
                                        borderRadius: "12px",
                                        bgcolor: "action.hover",
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            bgcolor: "primary.main",
                                            fontSize: 14,
                                            fontWeight: 700,
                                        }}
                                    >
                                        {p.name?.[0]?.toUpperCase() || "?"}
                                    </Avatar>
                                    <Typography
                                        fontWeight={700}
                                        sx={{ flex: 1, fontSize: 14 }}
                                    >
                                        {p.name || "Player"}
                                    </Typography>
                                    {p.isHost && (
                                        <Chip
                                            label="Host"
                                            size="small"
                                            color="secondary"
                                            sx={{
                                                fontWeight: 700,
                                                height: 20,
                                                fontSize: 10,
                                            }}
                                        />
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Box>

                {/* Actions */}
                {isHost ? (
                    <Stack spacing={1.5}>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            startIcon={status === "GENERATING" ? <CircularProgress size={20} color="inherit" /> : <PlayArrow />}
                            onClick={startQuiz}
                            disabled={players.length === 0 || status === "GENERATING"}
                            sx={{
                                py: 1.5,
                                borderRadius: "14px",
                                fontWeight: 800,
                                fontSize: "16px",
                                textTransform: "none",
                                fontFamily: "'Outfit', sans-serif",
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.dark})`,
                                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                                "&:hover": {
                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary?.dark || theme.palette.primary.main})`,
                                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}`,
                                },
                            }}
                        >
                            {status === "GENERATING" ? "Generating AI Quiz..." : "Start Game"}
                        </Button>

                        <Button
                            variant="outlined"
                            color="error"
                            size="large"
                            fullWidth
                            startIcon={<StopCircleOutlined />}
                            onClick={forceEnd}
                            disabled={status === "GENERATING"}
                            sx={{
                                py: 1.2,
                                borderRadius: "14px",
                                fontWeight: 700,
                                fontSize: "14px",
                                textTransform: "none",
                                borderWidth: "1.5px",
                                "&:hover": { borderWidth: "1.5px" },
                            }}
                        >
                            Close Room
                        </Button>
                    </Stack>
                ) : (
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="center"
                        spacing={1.5}
                        sx={{ py: 1 }}
                    >
                        <CircularProgress size={20} />
                        <Typography color="text.secondary" fontWeight={600}>
                            {status === "GENERATING" ? "Generating AI Quiz..." : "Waiting for host to start…"}
                        </Typography>
                    </Stack>
                )}
            </Paper>
        </Box>
    );
}
