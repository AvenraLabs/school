import { Box, Typography, useTheme, Zoom } from "@mui/material";
import { SmartToy } from "@mui/icons-material";
import { useAiChat } from "../hooks/useAiChat";
import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";
import { useAuth } from "../../../auth/AuthProvider";

export default function AiChatPage() {
  const { user } = useAuth();
  const theme = useTheme();

  const { messages, loading, sendMessage, clearChat } = useAiChat({
    classLevel: user.class_level,
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        bgcolor: theme.palette.background.default,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.text.secondary }}>
          Tutor Bot
        </Typography>
        {messages.length > 0 && (
          <Typography
            variant="caption"
            onClick={clearChat}
            sx={{
              cursor: "pointer",
              color: theme.palette.primary.main,
              "&:hover": { textDecoration: "underline" },
              fontWeight: 500,
            }}
          >
            Clear Chat
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          scrollBehavior: "smooth",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ChatList messages={messages} userAvatar={user?.avatar_url} />

        {loading && (
          <Box sx={{ p: 2, display: "flex", gap: 1.5, alignItems: "center" }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SmartToy sx={{ fontSize: 20, color: "white" }} />
            </Box>
            <Zoom in={true}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 2,
                  borderBottomLeftRadius: 0,
                  boxShadow: 1,
                }}
              >
                <div className="typing-indicator">
                  <span>●</span><span>●</span><span>●</span>
                </div>
              </Box>
            </Zoom>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          p: 2,
          bgcolor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <ChatInput onSend={sendMessage} disabled={loading} />
      </Box>

      <style>{`
        .typing-indicator span {
          animation: blink 1.4s infinite both;
          font-size: 12px;
          margin: 0 1px;
          color: ${theme.palette.text.secondary};
        }
        .typing-indicator span:nth-of-type(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-of-type(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </Box>
  );
}
