import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { WarningRounded, InfoRounded, CheckCircleRounded } from "@mui/icons-material";

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  severity = "primary", // 'primary', 'error', 'success', 'warning'
  loading = false,
}) {
  const getSeverityColor = () => {
    switch (severity) {
      case "error":
        return "error";
      case "success":
        return "success";
      case "warning":
        return "warning";
      default:
        return "primary";
    }
  };

  const getIcon = () => {
    const color = getSeverityColor();
    const style = { fontSize: 48, color: `${color}.main` };
    switch (severity) {
      case "error":
      case "warning":
        return <WarningRounded sx={style} />;
      case "success":
        return <CheckCircleRounded sx={style} />;
      default:
        return <InfoRounded sx={style} />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "20px",
          p: 1.5,
          mx: 2,
        },
      }}
    >
      <DialogContent sx={{ pb: 1, pt: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" gap={1.5}>
          {getIcon()}
          <Typography variant="h6" fontWeight="800" sx={{ fontFamily: "'Outfit', sans-serif" }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", gap: 1.5, px: 3, pb: 3, pt: 1.5 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={loading}
          sx={{
            flex: 1,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
            borderColor: "divider",
            color: "text.secondary",
            py: 1,
            "&:hover": {
              borderColor: "text.primary",
              bgcolor: "action.hover",
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color={getSeverityColor()}
          onClick={onConfirm}
          disabled={loading}
          sx={{
            flex: 1,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
            py: 1,
            "&:hover": {
              boxShadow: "none",
            },
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
