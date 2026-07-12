import {
    Dialog,
    DialogTitle,
    DialogContent,
    Tabs,
    Tab,
    Box,
    TextField,
    Button,
    Stack,
    Typography,
    Snackbar,
    Alert,
    IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { joinQuizRoom, createMultiplayerQuiz } from "../api/quiz.api";

export default function CreateJoinGameDialog({ open, onClose }) {
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const [roomCode, setRoomCode] = useState("");
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("EASY");
    const [numQuestions, setNumQuestions] = useState(5);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "error" });

    function showError(message) {
        setSnackbar({ open: true, message, severity: "error" });
    }

    function closeSnackbar() {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }

    async function handleCreate() {
        if (!topic.trim()) return;
        setLoading(true);
        try {
            const res = await createMultiplayerQuiz({
                topic,
                difficulty,
                numQuestions,
            });
            const sessionId = res.data?.sessionId;
            const code = res.data?.roomCode;
            onClose();
            navigate(`/student/quiz/${sessionId}/lobby`, {
                state: { roomCode: code, host: true },
            });
        } catch (err) {
            const msg = err?.response?.data?.message || "Failed to create session. Please try again.";
            showError(msg);
        } finally {
            setLoading(false);
        }
    }

    async function handleJoin() {
        if (!roomCode.trim()) return;
        setLoading(true);
        try {
            const res = await joinQuizRoom({ roomCode: roomCode.trim().toUpperCase() });
            const sessionId = res.data?.sessionId;
            if (!sessionId) {
                showError("Invalid response from server. Please try again.");
                return;
            }
            onClose();
            navigate(`/student/quiz/${sessionId}/lobby`, {
                state: { roomCode: roomCode.trim().toUpperCase() },
            });
        } catch (err) {
            const msg = err?.response?.data?.message || "Failed to join. Check your room code and try again.";
            showError(msg);
        } finally {
            setLoading(false);
        }
    }

    function handleTabChange(_, v) {
        setTab(v);
        setRoomCode("");
        setTopic("");
    }

    return (
        <>
            <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
                <DialogTitle
                    sx={{
                        fontWeight: "bold",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    Multiplayer Quiz
                    <IconButton size="small" onClick={onClose} disabled={loading}>
                        <Close fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Tabs
                        value={tab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{ mb: 2 }}
                    >
                        <Tab label="Create Game" sx={{ fontWeight: "bold" }} />
                        <Tab label="Join Game" sx={{ fontWeight: "bold" }} />
                    </Tabs>

                    {tab === 0 ? (
                        <Stack spacing={2.5} sx={{ mt: 2 }}>
                            <TextField
                                label="Quiz Topic"
                                helperText="Example: Solar System, World War II"
                                fullWidth
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && topic.trim() && !loading) handleCreate();
                                }}
                            />

                            <Stack spacing={2} sx={{ textAlign: "left" }}>
                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontWeight: 700,
                                            color: "text.secondary",
                                            textTransform: "uppercase",
                                            display: "block",
                                            mb: 1,
                                        }}
                                    >
                                        Number of Questions
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
                                                    "&:hover": { borderWidth: "1.5px" },
                                                }}
                                            >
                                                {num}
                                            </Button>
                                        ))}
                                    </Stack>
                                </Box>

                                <Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontWeight: 700,
                                            color: "text.secondary",
                                            textTransform: "uppercase",
                                            display: "block",
                                            mb: 1,
                                        }}
                                    >
                                        Difficulty
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        {[
                                            { value: "EASY", label: "Easy 😊" },
                                            { value: "HARD", label: "Hard 🔥" },
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
                                                    "&:hover": { borderWidth: "1.5px" },
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
                                onClick={handleCreate}
                                disabled={loading || !topic.trim()}
                                sx={{ py: 1.4, fontWeight: "bold", borderRadius: 2, textTransform: "none" }}
                            >
                                {loading ? "Creating Room..." : "🚀 Create Room"}
                            </Button>
                        </Stack>
                    ) : (
                        <Stack spacing={2.5} sx={{ mt: 2 }}>
                            <TextField
                                label="Room Code"
                                fullWidth
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && roomCode.trim() && !loading) handleJoin();
                                }}
                                inputProps={{ maxLength: 4, style: { letterSpacing: 4, fontWeight: 800, fontSize: 20, textAlign: 'center' } }}
                                placeholder="e.g. AB3K"
                            />
                            <Button
                                variant="contained"
                                onClick={handleJoin}
                                disabled={!roomCode.trim() || loading}
                                sx={{ py: 1.4, fontWeight: "bold", borderRadius: 2, textTransform: "none" }}
                            >
                                {loading ? "Joining..." : "🎮 Join Room"}
                            </Button>
                        </Stack>
                    )}
                </DialogContent>
            </Dialog>

            {/* Themed error snackbar — replaces all alert() calls */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={closeSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={closeSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%", borderRadius: "12px", fontWeight: 600 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
