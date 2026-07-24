import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  Add,
  ChatBubbleOutline,
  DeleteOutline,
  Close,
  History,
} from "@mui/icons-material";
import { formatDate } from "../../../utils/date";

export default function ChatHistoryDrawer({
  open,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  loading,
}) {
  const theme = useTheme();

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 300,
          bgcolor: "#FAF6F0",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <History sx={{ color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "16px" }}>
            Chat History
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* New Chat Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            onNewChat();
            onClose();
          }}
          sx={{
            py: 1.2,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: "none",
            boxShadow: `0 4px 12px ${theme.palette.primary.main}30`,
          }}
        >
          New Chat
        </Button>
      </Box>

      <Divider />

      {/* Sessions List */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1, py: 1 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : sessions.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", textAlign: "center", p: 3 }}
          >
            No previous chats found. Start a new conversation!
          </Typography>
        ) : (
          <List disablePadding>
            {sessions.map((s) => {
              const isSelected = activeSessionId === s.id;
              return (
                <ListItem
                  key={s.id}
                  disablePadding
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(s.id);
                      }}
                      sx={{
                        color: "text.secondary",
                        "&:hover": { color: theme.palette.error.main },
                      }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  }
                  sx={{ mb: 0.5, borderRadius: 1.5, overflow: "hidden" }}
                >
                  <ListItemButton
                    selected={isSelected}
                    onClick={() => {
                      onSelectSession(s.id);
                      onClose();
                    }}
                    sx={{
                      borderRadius: 1.5,
                      pr: 5,
                      bgcolor: isSelected ? "rgba(0,0,0,0.06)" : "transparent",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ChatBubbleOutline
                        fontSize="small"
                        sx={{
                          color: isSelected
                            ? theme.palette.primary.main
                            : "text.secondary",
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={s.title || "Conversation"}
                      secondary={formatDate(s.createdAt)}
                      primaryTypographyProps={{
                        noWrap: true,
                        fontSize: "13px",
                        fontWeight: isSelected ? 700 : 500,
                      }}
                      secondaryTypographyProps={{
                        fontSize: "11px",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Drawer>
  );
}
