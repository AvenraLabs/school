import { Box, Typography, useTheme, Zoom, Avatar, IconButton } from "@mui/material";
import { SmartToy, DeleteOutline } from "@mui/icons-material";
import { useAiChat } from "../hooks/useAiChat";
import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";
import { useAuth } from "../../../auth/AuthProvider";
import { getAssetUrl } from "../../../utils/asset";

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
        bgcolor: "#F5EDE3", // Brand cream background
        overflow: "hidden",
      }}
    >
      {/* Premium Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          bgcolor: "background.paper",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 40,
              height: 40,
              boxShadow: `0 4px 10px ${theme.palette.primary.main}25`,
            }}
          >
            <SmartToy sx={{ fontSize: 24, color: "white" }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
              SchoolIQ Assistant
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 0.2 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#10b981", // green online dot
                  animation: "pulse 1.8s infinite",
                }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500, fontSize: "11px" }}>
                Always online
              </Typography>
            </Box>
          </Box>
        </Box>

        {messages.length > 0 && (
          <IconButton
            onClick={clearChat}
            size="medium"
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: theme.palette.error.main,
                bgcolor: "rgba(239, 68, 68, 0.08)",
              },
            }}
            title="Clear conversation"
          >
            <DeleteOutline />
          </IconButton>
        )}
      </Box>

      {/* Messages Scroll Container */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          scrollBehavior: "smooth",
          display: "flex",
          flexDirection: "column",
          px: 1,
        }}
      >
        <ChatList messages={messages} userAvatar={getAssetUrl(user?.avatar_url)} />

        {loading && (
          <Box sx={{ p: 2, display: "flex", gap: 1.5, alignItems: "center" }}>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 32,
                height: 32,
              }}
            >
              <SmartToy sx={{ fontSize: 20, color: "white" }} />
            </Avatar>
            <Zoom in={true}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: theme.palette.background.paper,
                  borderRadius: 2,
                  borderBottomLeftRadius: 0,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  border: "1px solid rgba(0,0,0,0.04)",
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

      {/* Input container */}
      <Box
        sx={{
          p: 2,
          bgcolor: "#F5EDE3", // matches the screen container
          borderTop: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <ChatInput onSend={sendMessage} disabled={loading} />
      </Box>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.9; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.9; }
        }
        .typing-indicator span {
          animation: blink 1.4s infinite both;
          font-size: 12px;
          margin: 0 1.5px;
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

