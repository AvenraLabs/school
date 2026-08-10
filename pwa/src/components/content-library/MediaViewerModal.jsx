import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  IconButton,
  Typography,
  Chip,
  Button,
  ButtonGroup,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { Close, GetApp, OndemandVideo, ImageOutlined } from "@mui/icons-material";
import { tokens } from "../../theme/tokens";
import { getAssetUrl } from "../../utils/asset";

export default function MediaViewerModal({ open, item, onClose }) {
  const theme = useTheme();
  if (!item) return null;

  const hasVideo = Boolean(item.video_url || (item.content_type === "diagram_and_video" && item.video_path));
  const rawImgUrl = item.image_url || item.imageUrl || item.image_path;
  const diagramUrl = rawImgUrl ? getAssetUrl(rawImgUrl) : null;
  const hasDiagram = Boolean(diagramUrl);

  const [activeMedia, setActiveMedia] = useState(hasVideo ? "video" : "diagram");

  useEffect(() => {
    if (hasVideo) {
      setActiveMedia("video");
    } else if (hasDiagram) {
      setActiveMedia("diagram");
    }
  }, [hasVideo, hasDiagram, item?.id]);

  const activeMediaUrl = activeMedia === "video"
    ? (item.video_url || item.stream_url)
    : (diagramUrl || item.video_url || item.stream_url);

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

        {/* Center Title, Subject Chip, and Dual-Media Toggle Buttons */}
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

            {hasVideo && hasDiagram ? (
              /* Toggle Buttons when both Video and Picture/Diagram are generated */
              <Box sx={{ display: "inline-flex", bgcolor: "rgba(255, 255, 255, 0.15)", borderRadius: "12px", p: "2px" }}>
                <Button
                  size="small"
                  onClick={() => setActiveMedia("video")}
                  startIcon={<OndemandVideo sx={{ fontSize: 14 }} />}
                  sx={{
                    px: 1.2,
                    py: 0.2,
                    minHeight: 22,
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: "10px",
                    bgcolor: activeMedia === "video" ? theme.palette.primary.main : "transparent",
                    color: activeMedia === "video" ? "#ffffff" : "rgba(255,255,255,0.7)",
                    "&:hover": { bgcolor: activeMedia === "video" ? theme.palette.primary.main : "rgba(255,255,255,0.2)" },
                  }}
                >
                  AI Video
                </Button>
                <Button
                  size="small"
                  onClick={() => setActiveMedia("diagram")}
                  startIcon={<ImageOutlined sx={{ fontSize: 14 }} />}
                  sx={{
                    px: 1.2,
                    py: 0.2,
                    minHeight: 22,
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    textTransform: "none",
                    borderRadius: "10px",
                    bgcolor: activeMedia === "diagram" ? theme.palette.primary.main : "transparent",
                    color: activeMedia === "diagram" ? "#ffffff" : "rgba(255,255,255,0.7)",
                    "&:hover": { bgcolor: activeMedia === "diagram" ? theme.palette.primary.main : "rgba(255,255,255,0.2)" },
                  }}
                >
                  Labeled Picture
                </Button>
              </Box>
            ) : (
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
            )}
          </Box>
        </Box>

        {/* Top-Right Download Icon Button */}
        {activeMediaUrl ? (
          <IconButton
            component="a"
            href={activeMediaUrl}
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
        {item.status === "processing" ? (
          <Box sx={{ textAlign: "center", color: "#94a3b8", p: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <CircularProgress size={48} sx={{ color: theme.palette.primary.main }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#ffffff" }}>
              {item.contentType === "diagram_and_video" || item.content_type === "diagram_and_video"
                ? "Generating AI Video & Labeled Diagram..."
                : "Generating Labeled Educational Diagram..."}
            </Typography>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
              This may take a few moments. You can close this view and check back anytime.
            </Typography>
          </Box>
        ) : activeMedia === "video" && hasVideo ? (
          <video
            src={item.video_url || item.stream_url}
            controls
            autoPlay
            playsInline
            preload="metadata"
            style={{
              width: "100%",
              maxHeight: "100vh",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : hasDiagram ? (
          <img
            src={diagramUrl}
            alt={item.topic}
            style={{
              maxWidth: "100%",
              maxHeight: "100vh",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : (
          <Box sx={{ textAlign: "center", color: "#94a3b8", p: 4, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <CircularProgress size={48} sx={{ color: theme.palette.primary.main }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#ffffff" }}>
              Loading media content...
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
