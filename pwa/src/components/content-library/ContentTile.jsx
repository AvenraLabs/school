import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
} from "@mui/material";
import {
  OndemandVideo,
  PlayCircleOutline,
  MoreVert,
  DeleteOutline,
  ImageOutlined,
} from "@mui/icons-material";
import { tokens } from "../../theme/tokens";
import { formatDate } from "../../utils/date";
import { getAssetUrl } from "../../utils/asset";

export default function ContentTile({
  item,
  onOpen,
  onDelete,
  isTeacher = false,
}) {
  const theme = useTheme();
  const [imgError, setImgError] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const hasVideo = Boolean(item.video_url || (item.content_type === "diagram_and_video" && item.video_path));
  const rawImgUrl = item.image_url || item.imageUrl || item.image_path;
  const diagramUrl = rawImgUrl ? getAssetUrl(rawImgUrl) : null;
  const hasDiagram = Boolean(diagramUrl) && !imgError;
  const isMenuOpen = Boolean(menuAnchorEl);

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e) => {
    if (e) e.stopPropagation();
    setMenuAnchorEl(null);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(null);
    if (onDelete) onDelete(item.id);
  };

  return (
    <Box
      onClick={onOpen}
      sx={{
        borderRadius: `${tokens.radius.lg}px`,
        bgcolor: theme.palette.background.paper,
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.15s ease-in-out",
        "&:active": {
          transform: "scale(0.98)",
        },
      }}
    >
      {/* 16:9 Aspect Ratio Near-Black Media Thumbnail Container */}
      <Box
        sx={{
          width: "100%",
          aspectRatio: "16 / 9",
          borderRadius: `${tokens.radius.md}px`,
          overflow: "hidden",
          position: "relative",
          bgcolor: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {hasDiagram ? (
          <img
            src={diagramUrl}
            alt={item.topic}
            decoding="async"
            loading="eager"
            onError={() => setImgError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : hasVideo ? (
          <video
            src={item.video_url || item.stream_url}
            preload="metadata"
            muted
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              pointerEvents: "none",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.15),
              color: theme.palette.primary.main,
            }}
          >
            <ImageOutlined sx={{ fontSize: 32 }} />
          </Box>
        )}

        {/* Video Play Overlay */}
        {hasVideo && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(15, 23, 42, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "rgba(255, 255, 255, 0.92)",
                color: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              <PlayCircleOutline sx={{ fontSize: 28 }} />
            </Box>
          </Box>
        )}

        {/* Content Type Floating Chip */}
        <Box sx={{ position: "absolute", bottom: 6, left: 6 }}>
          <Chip
            label={item.content_type === "diagram_and_video" ? "Video" : "Diagram"}
            size="small"
            sx={{
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontWeight: 800,
              fontSize: "0.625rem",
              height: 18,
              px: 0.5,
              borderRadius: `${tokens.radius.sm}px`,
            }}
          />
        </Box>

        {/* Touch-First Overflow Delete Icon Button (⋮) for Teachers */}
        {isTeacher && (
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            aria-label="More options"
            aria-controls={isMenuOpen ? `tile-menu-${item.id}` : undefined}
            aria-haspopup="true"
            aria-expanded={isMenuOpen ? "true" : undefined}
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 44,
              height: 44,
              bgcolor: "rgba(15, 23, 42, 0.5)",
              color: "#ffffff",
              "&:hover, &:active": {
                bgcolor: "rgba(15, 23, 42, 0.8)",
              },
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Clean Text Below Thumbnail (No card borders) */}
      <Box sx={{ pt: 1, px: 0.5, pb: 0.5 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            color: theme.palette.text.primary,
            fontSize: "0.825rem",
            lineHeight: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {item.topic}
        </Typography>

        {item.summary && (
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 500,
              fontSize: "0.725rem",
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mt: 0.25,
            }}
          >
            {item.summary}
          </Typography>
        )}

        <Typography
          variant="caption"
          sx={{
            color: theme.palette.text.secondary,
            fontWeight: 500,
            fontSize: "0.675rem",
            opacity: 0.75,
            display: "block",
            mt: 0.25,
          }}
        >
          {formatDate(item.created_at || item.createdAt)}
        </Typography>
      </Box>

      {/* Overflow Options Touch Menu */}
      {isTeacher && (
        <Menu
          id={`tile-menu-${item.id}`}
          anchorEl={menuAnchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            elevation: 4,
            sx: {
              borderRadius: `${tokens.radius.md}px`,
              minWidth: 140,
            },
          }}
        >
          <MenuItem onClick={handleDeleteClick} sx={{ color: theme.palette.error.main, py: 1 }}>
            <ListItemIcon sx={{ color: theme.palette.error.main, minWidth: 32 }}>
              <DeleteOutline fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Delete" primaryTypographyProps={{ fontWeight: 700, fontSize: "0.85rem" }} />
          </MenuItem>
        </Menu>
      )}
    </Box>
  );
}
