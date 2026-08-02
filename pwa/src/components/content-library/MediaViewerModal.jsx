import React from "react";
import {
  Box,
  Dialog,
  IconButton,
  Typography,
  Chip,
  useTheme,
} from "@mui/material";
import { Close, GetApp, OndemandVideo, ImageOutlined } from "@mui/icons-material";
import { tokens } from "../../theme/tokens";

export default function MediaViewerModal({ open, item, onClose }) {
  const theme = useTheme();
  if (!item) return null;

  const hasVideo = Boolean(item.video_url || (item.content_type === "diagram_and_video" && item.video_path));
  const hasDiagram = Boolean(item.image_url);
  const mediaUrl = item.video_url || item.image_url || (hasVideo ? item.stream_url : null);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 1350, // Above BottomNav (zIndex: 1200) and AppHeader
        "& .MuiDialog-paper": {
          bgcolor: "#000000",
          color: "#ffffff",
          borderRadius: 0,
          border: "none",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
        },
      }}
    >
      {/* Top Gradient Scrim Overlay Header */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
          pt: "calc(env(safe-area-inset-top, 0px) + 8px)",
          pb: 3,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        {/* Top-Left Close Icon Button (44x44px target) */}
        <IconButton
          onClick={onClose}
          aria-label="Close"
          sx={{
            width: 44,
            height: 44,
            color: "#ffffff",
            bgcolor: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(8px)",
            "&:hover, &:active": {
              bgcolor: "rgba(255, 255, 255, 0.3)",
            },
          }}
        >
          <Close />
        </IconButton>

        {/* Center Title & Subject Chip */}
        <Box sx={{ flex: 1, minWidth: 0, textAlign: "center" }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: "#ffffff",
              fontSize: "0.95rem",
              lineHeight: 1.2,
            }}
            noWrap
          >
            {item.topic}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mt: 0.5 }}>
            <Chip
              label={item.subject_name || "General"}
              size="small"
              sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontWeight: 800,
                fontSize: "0.65rem",
                height: 20,
                borderRadius: `${tokens.radius.sm}px`,
              }}
            />
            <Chip
              label={hasVideo ? "Video" : "Diagram"}
              size="small"
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.65rem",
                height: 20,
                borderRadius: `${tokens.radius.sm}px`,
              }}
            />
          </Box>
        </Box>

        {/* Top-Right Download Icon Button (44x44px target) */}
        {mediaUrl ? (
          <IconButton
            component="a"
            href={mediaUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download media"
            sx={{
              width: 44,
              height: 44,
              color: "#ffffff",
              bgcolor: theme.palette.primary.main,
              "&:hover, &:active": {
                bgcolor: theme.palette.primary.dark,
              },
            }}
          >
            <GetApp />
          </IconButton>
        ) : (
          <Box sx={{ width: 44 }} />
        )}
      </Box>

      {/* Main Edge-to-Edge Media Surface */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          bgcolor: "#000000",
        }}
      >
        {hasVideo ? (
          <video
            src={item.video_url || item.stream_url}
            controls
            autoPlay
            playsInline
            style={{
              width: "100%",
              maxHeight: "100vh",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : hasDiagram ? (
          <img
            src={item.image_url}
            alt={item.topic}
            style={{
              maxWidth: "100%",
              maxHeight: "100vh",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : (
          <Box sx={{ textAlign: "center", color: "#94a3b8", p: 3 }}>
            <OndemandVideo sx={{ fontSize: 48, mb: 1, color: "#64748b" }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Content generation is processing...
            </Typography>
          </Box>
        )}

        {/* Bottom Scrim Summary Overlay */}
        {item.summary && (
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
              background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
              pb: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
              pt: 4,
              px: 3,
              textAlign: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.95)",
                fontWeight: 600,
                fontSize: "0.875rem",
                lineHeight: 1.4,
              }}
            >
              {item.summary}
            </Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}
