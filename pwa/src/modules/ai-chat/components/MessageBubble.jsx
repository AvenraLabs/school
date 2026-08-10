import { Box, Paper, Typography, Avatar, useTheme, Stack, IconButton } from "@mui/material";
import { SmartToy, Person, VolumeUp, VolumeOff } from "@mui/icons-material";
import { useSpeechSynthesis } from "../../../speech/useSpeechSynthesis";

function formatChatMessage(rawText) {
    if (!rawText) return "";
    
    // Clean raw markdown header hashes and dividers if present
    const cleaned = String(rawText)
        .replace(/^#{1,6}\s*(.+)$/gm, "$1")
        .replace(/^[\*\-_]{3,}$/gm, "");

    const parts = cleaned.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <Box
                    component="span"
                    key={idx}
                    sx={{ fontWeight: 700 }}
                >
                    {part.slice(2, -2)}
                </Box>
            );
        }
        return part;
    });
}

export default function MessageBubble({ message, userAvatar }) {
    const theme = useTheme();
    const isAi = message.role === "ai" || message.role === "assistant";
    const { speak, stop, isPlaying } = useSpeechSynthesis();

    const handleSpeakToggle = () => {
        if (isPlaying) {
            stop();
        } else {
            speak(message.text || message.content);
        }
    };

    const textContent = (message.text || message.content || "").trim();
    const hasText = textContent.length > 0;

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: isAi ? "flex-start" : "flex-end",
                mb: 2,
                gap: 1.5,
                alignItems: "flex-end", // Align avatars to bottom
                "@keyframes typingBlink": {
                    "0%": { opacity: 0.2 },
                    "20%": { opacity: 1 },
                    "100%": { opacity: 0.2 },
                },
            }}
        >
            {/* AI Avatar */}
            {isAi && (
                <Avatar
                    sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 32,
                        height: 32,
                    }}
                >
                    <SmartToy sx={{ fontSize: 20, color: "white" }} />
                </Avatar>
            )}

            {/* Message Bubble */}
            <Paper
                elevation={isAi ? 1 : 2}
                sx={{
                    p: 2,
                    maxWidth: "75%",
                    borderRadius: 2,
                    // Bubble Styling based on sender
                    borderBottomLeftRadius: isAi ? 0 : 2,
                    borderBottomRightRadius: isAi ? 2 : 0,
                    bgcolor: isAi
                        ? theme.palette.background.paper
                        : theme.palette.primary.main,
                    color: isAi
                        ? theme.palette.text.primary
                        : theme.palette.primary.contrastText,
                }}
            >
                {!hasText && isAi ? (
                    <Box sx={{ display: "flex", alignItems: "center", py: 0.5, px: 0.5, gap: 0.6 }}>
                        <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: theme.palette.text.secondary, animation: "typingBlink 1.4s infinite both" }} />
                        <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: theme.palette.text.secondary, animation: "typingBlink 1.4s infinite both", animationDelay: "0.2s" }} />
                        <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: theme.palette.text.secondary, animation: "typingBlink 1.4s infinite both", animationDelay: "0.4s" }} />
                    </Box>
                ) : (
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
                        <Typography
                            variant="body1"
                            component="div"
                            sx={{
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                lineHeight: 1.6,
                                flex: 1,
                            }}
                        >
                            {formatChatMessage(message.text || message.content)}
                        </Typography>
                        {isAi && hasText && (
                            <IconButton
                                size="small"
                                onClick={handleSpeakToggle}
                                sx={{
                                    color: isPlaying ? theme.palette.primary.main : theme.palette.text.secondary,
                                    alignSelf: "flex-start",
                                    mt: -0.5,
                                    mr: -1,
                                    "&:hover": {
                                        bgcolor: theme.palette.action.hover,
                                    },
                                }}
                                title={isPlaying ? "Stop listening" : "Listen to answer"}
                            >
                                {isPlaying ? <VolumeOff fontSize="small" /> : <VolumeUp fontSize="small" />}
                            </IconButton>
                        )}
                    </Stack>
                )}

                {isAi && message.sources && message.sources.length > 0 && (
                    <Box
                        sx={{
                            mt: 1.5,
                            pt: 1,
                            borderTop: `1px solid ${theme.palette.divider}`,
                            display: "flex",
                            flexDirection: "column",
                            gap: 0.5,
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                fontWeight: 700,
                                color: theme.palette.text.secondary,
                                fontSize: "10px",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                            }}
                        >
                            Sources:
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {message.sources.map((src, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        fontSize: "10px",
                                        bgcolor: theme.palette.action.hover,
                                        color: theme.palette.text.secondary,
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: 1,
                                        border: `1px solid ${theme.palette.divider}`,
                                        fontWeight: 500,
                                    }}
                                >
                                    {src}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}
            </Paper>

            {/* User Avatar */}
            {!isAi && (
                <Avatar
                    src={userAvatar}
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: theme.palette.secondary.main,
                    }}
                >
                    {!userAvatar && <Person />}
                </Avatar>
            )}
        </Box>
    );
}
