import { Container, Grid, Card, CardContent, Typography, Box, Avatar, Stack, CircularProgress, Divider, Button } from "@mui/material";
import { Person, People } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/AuthProvider";
import { getAssetUrl } from "../../../utils/asset";
import { useEffect, useState } from "react";
import CreateJoinGameDialog from "../components/CreateJoinGameDialog";
import { getQuizHistory } from "../api/quiz.api";

export default function QuizLandingPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [multiplayerOpen, setMultiplayerOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

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
        <Container maxWidth="sm" sx={{ mt: 4, pb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                Quiz Zone
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Card
                        sx={{
                            borderRadius: 4,
                            cursor: 'pointer',
                            bgcolor: '#e3f2fd',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.02)' }
                        }}
                        onClick={() => navigate('single')}
                    >
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 60, height: 60, mr: 3 }}>
                                <Person fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">Single Player</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>


                {/* Multiplayer */}
                <Grid item xs={12}>
                    <Card
                        sx={{
                            borderRadius: 4,
                            cursor: 'pointer',
                            bgcolor: '#f3e5f5',
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'scale(1.02)' }
                        }}
                        onClick={() => setMultiplayerOpen(true)}
                    >
                        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: 'secondary.main', width: 60, height: 60, mr: 3 }}>
                                <People fontSize="large" />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">Multiplayer</Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

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
                            const rawTitle =
                                item.quiz?.title ||
                                item.quiz?.topic ||
                                "Quiz";
                            const cleanedTitle = rawTitle.replace(/\s*quiz$/i, "").trim();
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
