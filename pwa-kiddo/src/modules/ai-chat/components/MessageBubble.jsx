import { Box, Paper, Typography, Avatar, useTheme } from "@mui/material";
import { SmartToy, Person } from "@mui/icons-material";

export default function MessageBubble({ message, userAvatar }) {
    const theme = useTheme();
    const isAi = message.role === "ai" || message.role === "assistant";

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
                <Typography
                    variant="body1"
                    sx={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: 1.6,
                    }}
                >
                    {message.text || message.content}
                </Typography>
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
