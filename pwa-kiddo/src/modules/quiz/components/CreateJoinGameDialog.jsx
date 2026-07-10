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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography
} from "@mui/material";
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
            navigate(`${sessionId}/lobby`, {
                state: { roomCode: code, host: true },
            });
        } catch (err) {
            alert("Failed to create session");
        } finally {
            setLoading(false);
        }
    }

    async function handleJoin() {
        if (!roomCode) return;
        setLoading(true);
        try {
            const res = await joinQuizRoom({ roomCode });
            const sessionId = res.data?.sessionId || roomCode;
            navigate(`${sessionId}/lobby`);
        } catch (err) {
            alert("Failed to join session. Check code.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: "bold" }}>Multiplayer Quiz</DialogTitle>
            <DialogContent>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ mb: 2 }}>
                    <Tab label="Create Game" sx={{ fontWeight: "bold" }} />
                    <Tab label="Join Game" sx={{ fontWeight: "bold" }} />
                </Tabs>

                {tab === 0 ? (
                    <Stack spacing={2.5} sx={{ mt: 2 }}>
                        <TextField
                            label="Quiz Topic"
                            helperText="Example: Solar System"
                            fullWidth
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />

                        <Stack spacing={2} sx={{ textAlign: "left" }}>
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
                            onClick={handleCreate} 
                            disabled={loading || !topic.trim()}
                            sx={{ py: 1.2, fontWeight: "bold", borderRadius: 2 }}
                        >
                            {loading ? "Creating..." : "Create Room"}
                        </Button>
                    </Stack>
                ) : (
                    <Stack spacing={2.5} sx={{ mt: 2 }}>
                        <TextField
                            label="Game Code"
                            fullWidth
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        />
                        <Button 
                            variant="contained" 
                            onClick={handleJoin} 
                            disabled={!roomCode || loading}
                            sx={{ py: 1.2, fontWeight: "bold", borderRadius: 2 }}
                        >
                            {loading ? "Joining..." : "Join Room"}
                        </Button>
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}
