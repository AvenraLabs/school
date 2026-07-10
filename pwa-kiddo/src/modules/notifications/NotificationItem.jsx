import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

export default function NotificationItem({ item, onAcknowledge }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  const isTeacher = user?.role === "teacher";
  const isUnread = !item.is_acknowledged;

  // Format time
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const senderName =
    item?.sender?.name ||
    (item?.sender_role === "school_admin" ? "School Admin" : "Teacher");

  const senderAvatar =
    item?.sender_role === "school_admin"
      ? item?.school?.logo_url || ""
      : item?.sender?.avatar_url || "";

  const senderInitial =
    item?.sender_role === "school_admin"
      ? "A"
      : senderName?.[0]?.toUpperCase() || "T";

  const handleItemClick = async () => {
    // Automatically mark as read if unread
    if (isUnread) {
      await onAcknowledge(item.id);
    }

    const titleLower = (item.title || "").toLowerCase();
    const messageLower = (item.message || "").toLowerCase();

    // Academic deep-linking keywords
    if (titleLower.includes("homework") || messageLower.includes("homework") || titleLower.includes("diary")) {
      navigate(`/${isTeacher ? "teacher" : "student"}/diary`);
    } else if (titleLower.includes("report") || messageLower.includes("report")) {
      navigate(`/${isTeacher ? "teacher" : "student"}/report-cards${isTeacher ? "/entry" : ""}`);
    } else if (titleLower.includes("quiz") || messageLower.includes("quiz")) {
      navigate(`/${isTeacher ? "teacher" : "student"}/quiz`);
    } else {
      // General announcement -> Open dialog
      setModalOpen(true);
    }
  };

  return (
    <>
      <Box
        onClick={handleItemClick}
        sx={{
          py: 1.8,
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          cursor: "pointer",
          bgcolor: isUnread ? "rgba(25, 118, 210, 0.03)" : "transparent",
          transition: "background-color 0.2s, transform 0.1s",
          "&:hover": {
            bgcolor: isUnread ? "rgba(25, 118, 210, 0.05)" : "grey.50",
          },
          borderBottom: "1px solid",
          borderColor: "grey.100"
        }}
      >
        {/* Avatar */}
        <Avatar
          src={senderAvatar}
          sx={{
            width: 44,
            height: 44,
            bgcolor: "primary.light",
            color: "primary.contrastText",
            fontWeight: "bold",
            fontSize: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}
        >
          {senderInitial}
        </Avatar>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="baseline" spacing={0.8}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary" }}>
              {senderName}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              • {formatTime(item.created_at)}
            </Typography>
          </Stack>

          <Typography
            variant="body2"
            sx={{
              fontWeight: isUnread ? 700 : 600,
              color: isUnread ? "text.primary" : "text.secondary",
              mt: 0.2
            }}
          >
            {item.title}
          </Typography>

          <Typography
            variant="body2"
            noWrap
            sx={{
              color: "text.secondary",
              fontSize: "0.85rem",
              mt: 0.1
            }}
          >
            {item.message}
          </Typography>
        </Box>

        {/* Unread dot */}
        {isUnread && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "primary.main",
              boxShadow: "0 0 8px rgba(25, 118, 210, 0.4)",
              flexShrink: 0
            }}
          />
        )}
      </Box>

      {/* Detail Modal Dialog */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px", p: 1 }
        }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: "bold" }}>
          Announcement
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar src={senderAvatar} sx={{ width: 40, height: 40, bgcolor: "primary.light" }}>
                {senderInitial}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={800}>
                  {senderName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                </Typography>
              </Box>
            </Stack>

            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
              {item.title}
            </Typography>

            <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "pre-line", lineHeight: 1.6 }}>
              {item.message}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setModalOpen(false)}
            variant="contained"
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: "bold" }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
