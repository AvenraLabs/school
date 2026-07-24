import { Container, Grid, Card, CardContent, Typography, Box, Avatar, Stack, CircularProgress, Divider, Button, Chip } from "@mui/material";
import { Person, People, School } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { getAssetUrl } from "../../../utils/asset";
import { useEffect, useState } from "react";
import CreateJoinGameDialog from "../components/CreateJoinGameDialog";
import { getQuizHistory } from "../api/quiz.api";
import api from "../../../api/axios";

export default function QuizLandingPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const { user } = useAuth();
    const [multiplayerOpen, setMultiplayerOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        api.get("/quizzes/student/pending")
            .then((res) => {
                setPendingCount(res.data?.quizzes?.length || 0);
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        let mounted = true;
        setHistoryLoading(true);
        getQuizHistory({ limit: 10, offset: 0 })
            .then((res) => {
                if (!mounted) return;
                const items = res.data?.items || [];
                setHistory(items);
                if (items.length < 10) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            })
            .catch(() => {
                if (!mounted) return;
                setHistory([]);
                setHasMore(false);
            })
            .finally(() => {
                if (!mounted) return;
                setHistoryLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, []);

    async function handleLoadMore() {
        if (loadingMore) return;
        setLoadingMore(true);
        try {
            const res = await getQuizHistory({ limit: 10, offset: history.length });
            const newItems = res.data?.items || [];
            setHistory((prev) => [...prev, ...newItems]);
            if (newItems.length < 10) {
                setHasMore(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingMore(false);
        }
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 2, pb: 4, px: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", textAlign: 'center', mb: 3 }}>
                Quiz Zone
            </Typography>

            <Stack spacing={2}>
                {/* Card 1: Tasks */}
                <Card
                    onClick={() => navigate('/student/homework-quizzes')}
                    sx={{
                        borderRadius: "20px",
                        border: "1px solid #e2e8f0",
                        bgcolor: "#ffffff",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': { transform: 'translateY(-2px)', borderColor: '#4f46e5' }
                    }}
                >
                    <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: "12px",
                                    bgcolor: '#e0e7ff',
                                    color: '#4f46e5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <School />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                Tasks
                            </Typography>
                        </Box>
                        <Chip 
                            label={`Tasks (${pendingCount})`} 
                            size="small"
                            sx={{ 
                                bgcolor: pendingCount > 0 ? '#ef4444' : '#e0e7ff', 
                                color: pendingCount > 0 ? '#ffffff' : '#3730a3', 
                                fontWeight: 800,
                                fontSize: '12px',
                                px: 0.5
                            }} 
                        />
                    </CardContent>
                </Card>

                {/* Card 2: Single Player */}
                <Card
                    onClick={() => navigate('single')}
                    sx={{
                        borderRadius: "20px",
                        border: "1px solid #e2e8f0",
                        bgcolor: "#ffffff",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': { transform: 'translateY(-2px)', borderColor: '#10b981' }
                    }}
                >
                    <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: "12px",
                                    bgcolor: '#d1fae5',
                                    color: '#10b981',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Person />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                Single Player
                            </Typography>
                        </Box>
                        <Chip 
                            label="Practice" 
                            size="small"
                            sx={{ 
                                bgcolor: '#d1fae5', 
                                color: '#065f46', 
                                fontWeight: 800,
                                fontSize: '12px',
                                px: 0.5
                            }} 
                        />
                    </CardContent>
                </Card>

                {/* Card 3: Multiplayer */}
                <Card
                    onClick={() => setMultiplayerOpen(true)}
                    sx={{
                        borderRadius: "20px",
                        border: "1px solid #e2e8f0",
                        bgcolor: "#ffffff",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': { transform: 'translateY(-2px)', borderColor: '#ec4899' }
                    }}
                >
                    <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: "12px",
                                    bgcolor: '#fce7f3',
                                    color: '#ec4899',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <People />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                Multiplayer
                            </Typography>
                        </Box>
                        <Chip 
                            label="Class Games" 
                            size="small"
                            sx={{ 
                                bgcolor: '#fce7f3', 
                                color: '#9d174d', 
                                fontWeight: 800,
                                fontSize: '12px',
                                px: 0.5
                            }} 
                        />
                    </CardContent>
                </Card>
            </Stack>

            <CreateJoinGameDialog
                open={multiplayerOpen}
                onClose={() => setMultiplayerOpen(false)}
            />

            <Box sx={{ mt: 5 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    Recent Quizzes
                </Typography>

                {historyLoading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress size={24} />
                    </Box>
                )}

                {!historyLoading && history.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        No quiz history yet. Start a quiz to see it here.
                    </Typography>
                )}

                {!historyLoading && history.length > 0 && (
                    <Stack spacing={2}>
                        {history.map((item) => {
                            // settings.topic is always clean user input — use as-is
                            // AI-generated quiz model titles may have "Quiz" suffix — strip it
                            const settingsTopic = item.quiz?.topic; // already clean
                            const aiTitle = item.quiz?.title;
                            const rawTitle = settingsTopic || aiTitle || "Quiz";
                            const cleanedTitle = settingsTopic
                              ? rawTitle
                              : rawTitle.replace(/\s*quiz$/i, "").trim();
                            const title = cleanedTitle || rawTitle;
                            const isMulti = item.mode === "MULTI";
                            
                            return (
                                <Card 
                                    key={item.session_id} 
                                    sx={{ 
                                        borderRadius: '16px', 
                                        border: "1px solid rgba(0,0,0,0.05)",
                                        boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                                        overflow: "hidden"
                                    }}
                                >
                                    <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                {/* Mode Chip */}
                                                <Box 
                                                    component="span" 
                                                    sx={{ 
                                                        display: "inline-block", 
                                                        px: 1, 
                                                        py: 0.3, 
                                                        borderRadius: "6px", 
                                                        fontSize: "10px", 
                                                        fontWeight: 800, 
                                                        textTransform: "uppercase", 
                                                        letterSpacing: "0.5px",
                                                        bgcolor: isMulti ? 'rgba(156, 39, 176, 0.08)' : 'rgba(25, 118, 210, 0.08)',
                                                        color: isMulti ? '#9c27b0' : '#1976d2',
                                                        mb: 1.2
                                                    }}
                                                >
                                                    {isMulti ? "Multiplayer" : "Single Player"}
                                                </Box>
                                                
                                                <Typography fontWeight="bold" variant="body1" noWrap sx={{ fontSize: "1.05rem", color: "text.primary" }}>
                                                    {title}
                                                </Typography>
                                                
                                                {item.started_at && (
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                                                        {new Date(item.started_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                    </Typography>
                                                )}
                                            </Box>
                                            
                                            {/* Score Badge */}
                                            <Box 
                                                sx={{ 
                                                    textAlign: "center", 
                                                    px: 1.8, 
                                                    py: 1, 
                                                    borderRadius: "12px", 
                                                    bgcolor: "grey.50", 
                                                    border: "1px solid rgba(0,0,0,0.04)" 
                                                }}
                                            >
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: "9px", textTransform: "uppercase", display: "block" }}>
                                                    Score
                                                </Typography>
                                                <Typography fontWeight="black" variant="h6" sx={{ color: "primary.main", lineHeight: 1.1, mt: 0.2 }}>
                                                    {item.my_score ?? 0}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        {item.players?.length > 0 && (
                                            <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                    Players:
                                                </Typography>
                                                <Stack direction="row" spacing={-0.8}>
                                                    {item.players.slice(0, 5).map((p, idx) => (
                                                        <Avatar
                                                            key={`${item.session_id}-${p.user_id}`}
                                                            src={getAssetUrl(p.avatar_url) || undefined}
                                                            sx={{ 
                                                                width: 28, 
                                                                height: 28, 
                                                                fontSize: 11,
                                                                border: "2px solid #fff",
                                                                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                                                zIndex: 5 - idx
                                                            }}
                                                            title={p.name}
                                                        >
                                                            {p.name?.[0]?.toUpperCase() || "P"}
                                                        </Avatar>
                                                    ))}
                                                    {item.players.length > 5 && (
                                                        <Avatar 
                                                            sx={{ 
                                                                width: 28, 
                                                                height: 28, 
                                                                fontSize: 10, 
                                                                bgcolor: "grey.200", 
                                                                color: "text.secondary",
                                                                border: "2px solid #fff",
                                                                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                                                                fontWeight: "bold",
                                                                zIndex: 0
                                                            }}
                                                        >
                                                            +{item.players.length - 5}
                                                        </Avatar>
                                                    )}
                                                </Stack>
                                            </Box>
                                        )}

                                        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => navigate(`/student/quiz/${item.session_id}/results`)}
                                                sx={{ 
                                                    borderRadius: "8px", 
                                                    textTransform: "none", 
                                                    fontWeight: 700, 
                                                    fontSize: "0.8rem",
                                                    px: 2
                                                }}
                                            >
                                                View Results
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Stack>
                )}

                {hasMore && history.length > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                        <Button
                            variant="text"
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            sx={{ fontWeight: 800, textTransform: "none", py: 1, px: 3, borderRadius: "8px" }}
                        >
                            {loadingMore ? <CircularProgress size={20} /> : "Load More"}
                        </Button>
                    </Box>
                )}
            </Box>
        </Container>
    );
}
