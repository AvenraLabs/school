import { Box, Paper, Typography, Avatar, useTheme, Stack, IconButton } from "@mui/material";
import { SmartToy, Person, VolumeUp, VolumeOff } from "@mui/icons-material";
import { useSpeechSynthesis } from "../../../speech/useSpeechSynthesis";

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

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: isAi ? "flex-start" : "flex-end",
                mb: 2,
                gap: 1.5,
                alignItems: "flex-end", // Align avatars to bottom
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
                <Stack direction="row" spacing={1.5} alignItems="flex-start" justifyContent="space-between">
                    <Typography
                        variant="body1"
                        sx={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            lineHeight: 1.6,
                            flex: 1,
                        }}
                    >
                        {message.text || message.content}
                    </Typography>
                    {isAi && (
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
