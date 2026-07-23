import { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Avatar,
  Stack,
  CircularProgress
} from "@mui/material";
import { Send, Close, PhotoCamera, CameraAlt, AttachFile, PictureAsPdf } from "@mui/icons-material";
import { useAuth } from "../../auth/AuthProvider";
import api from "../../api/axios";
import { getAssetUrl } from "../../utils/asset";

export default function GroupChatRoom({ messages, onSend, onSendFile, meta, onClose }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    const isPdf = file.type === "application/pdf";
    const type = isPdf ? "pdf" : "image";

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("chat", file);

      const response = await api.post("/upload/chat", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success && response.data.url) {
        onSendFile?.(response.data.url, type);
      }
    } catch (err) {
      console.error("Chat file upload failed:", err);
      alert(err.response?.data?.message || "File upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function handleSend() {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  }

  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#f5f7fa',
        overflow: 'hidden',
        borderRadius: 0,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'white',
        }}
      >
        <Box>
          <Typography fontWeight={700}>
            {meta?.subject?.name || "Group Chat"}
          </Typography>
          {user?.role !== "student" && (
            <Typography variant="body2" color="text.secondary">
              Class {meta?.class?.class_name || "–"} ({meta?.section?.name || "–"})
            </Typography>
          )}
        </Box>
        {onClose && (
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        )}
      </Box>

      {/* Messages Area */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Stack spacing={2}>
          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === user.id;
            const initial = msg.sender_name
              ? msg.sender_name[0]?.toUpperCase()
              : isMe
              ? "T"
              : "S";
            return (
              <Box
                key={idx}
                sx={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  display: 'flex',
                  gap: 1,
                  flexDirection: isMe ? 'row-reverse' : 'row'
                }}
              >
                {!isMe && (
                  <Avatar
                    src={getAssetUrl(msg.sender_avatar)}
                    sx={{ width: 32, height: 32, fontSize: 12, bgcolor: 'primary.light' }}
                  >
                    {initial || "?"}
                  </Avatar>
                )}

                <Box>
                  {!isMe && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {msg.sender_name}
                    </Typography>
                  )}
                  <Paper
                    sx={{
                      p: 1.5,
                      borderRadius: 3,
                      bgcolor: isMe ? 'primary.main' : 'white',
                      color: isMe ? 'white' : 'text.primary',
                      borderTopRightRadius: isMe ? 4 : 20,
                      borderTopLeftRadius: isMe ? 20 : 4,
                      overflow: "hidden"
                    }}
                  >
                    {msg.type === "image" ? (
                      <Box
                        component="img"
                        src={getAssetUrl(msg.content)}
                        alt="Image attachment"
                        sx={{
                          maxWidth: "100%",
                          maxHeight: 200,
                          borderRadius: 2,
                          display: "block",
                          cursor: "pointer"
                        }}
                        onClick={() => window.open(getAssetUrl(msg.content), "_blank")}
                      />
                    ) : msg.type === "pdf" ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          cursor: "pointer",
                          p: 0.5,
                        }}
                        onClick={() => window.open(getAssetUrl(msg.content), "_blank")}
                      >
                        <PictureAsPdf sx={{ color: isMe ? "#ffebee" : "#ef5350", fontSize: 32 }} />
                        <Box sx={{ overflow: "hidden", minWidth: 120 }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 600, color: isMe ? "white" : "text.primary", textDecoration: "underline" }}>
                            {msg.content.split('/').pop() || "Document.pdf"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: isMe ? "rgba(255,255,255,0.7)" : "text.secondary", display: "block" }}>
                            PDF Document
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2">{msg.content}</Typography>
                    )}
                  </Paper>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: isMe ? 'right' : 'left', mt: 0.5, px: 1 }}>
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ""}
                  </Typography>
                </Box>
              </Box>
            );
          })}
          <div ref={endRef} />
        </Stack>
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            component="label"
            disabled={uploading}
            sx={{ color: "text.secondary" }}
          >
            {uploading ? <CircularProgress size={24} /> : <AttachFile />}
            <input
              type="file"
              accept="image/*,application/pdf"
              style={{ display: "none" }}
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </IconButton>

          <TextField
            fullWidth
            placeholder="Type a message..."
            size="small"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={uploading}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 4 }
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!text.trim() || uploading}
            sx={{ bgcolor: 'primary.light', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}
          >
            <Send />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
}
