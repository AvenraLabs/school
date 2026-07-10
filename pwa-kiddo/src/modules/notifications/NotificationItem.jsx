import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Drawer,
  Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { getAssetUrl } from "../../utils/asset";

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
    item?.sender?.avatar_url
      ? getAssetUrl(item.sender.avatar_url)
      : item?.sender_role === "school_admin"
        ? (item?.school?.logo_url ? getAssetUrl(item.school.logo_url) : "")
        : "";

  const senderInitial = senderName?.[0]?.toUpperCase() || "A";

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

      {/* Detail Slide-Up Bottom Drawer */}
      <Drawer
        anchor="bottom"
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            maxHeight: "80vh",
            p: 3,
            pb: 4,
            boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
          }
        }}
      >
        {/* Top drag handle indicator */}
        <Box
          sx={{
            width: 44,
            height: 5,
            bgcolor: "grey.200",
            borderRadius: "3px",
            mx: "auto",
            mb: 2.5,
            cursor: "pointer"
          }}
          onClick={() => setModalOpen(false)}
        />

        <Box sx={{ overflowY: "auto" }}>
          <Stack spacing={2.5}>
            {/* Header info */}
            <Stack direction="row" spacing={1.8} alignItems="center">
              <Avatar src={senderAvatar} sx={{ width: 44, height: 44, bgcolor: "primary.light" }}>
                {senderInitial}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={850} sx={{ fontSize: "0.95rem" }}>
                  {senderName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.created_at ? new Date(item.created_at).toLocaleString() : ""}
                </Typography>
              </Box>
            </Stack>

            <Typography variant="h6" fontWeight={900} color="text.primary" sx={{ lineHeight: 1.3, fontSize: "1.15rem" }}>
              {item.title}
            </Typography>

            <Typography variant="body2" sx={{ color: "text.secondary", whiteSpace: "pre-line", lineHeight: 1.6, fontSize: "0.9rem" }}>
              {item.message}
            </Typography>

            {item.image_url && (
              <Box
                component="img"
                src={getAssetUrl(item.image_url)}
                alt="Announcement Image"
                sx={{
                  width: "100%",
                  maxHeight: 280,
                  objectFit: "cover",
                  borderRadius: "16px",
                  border: "1px solid rgba(0,0,0,0.05)",
                  mt: 1,
                  cursor: "pointer"
                }}
                onClick={() => window.open(getAssetUrl(item.image_url), "_blank")}
              />
            )}

            <Button
              onClick={() => setModalOpen(false)}
              variant="contained"
              fullWidth
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: "bold",
                py: 1.2,
                mt: 1.5,
                boxShadow: "none",
                "&:hover": { boxShadow: "none" }
              }}
            >
              Close
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
