import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { Check, Palette } from "@mui/icons-material";
import { useState } from "react";
import { useThemeMode } from "../../theme/useThemeMode";
import { themes as themeMap } from "../../theme/themes";

const titleCase = (value) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

export default function ThemePage() {
  const { mode, setMode, themes, customColor, setCustomColor } = useThemeMode();
  const [customOpen, setCustomOpen] = useState(false);

  const presets = themes.map((key) => {
    const preset = themeMap[key];
    const primary = preset?.palette?.primary?.main || "#4f46e5";
    const secondary = preset?.palette?.secondary?.main || preset?.palette?.primary?.dark || "#14b8a6";
    return {
      key,
      label: titleCase(key),
      gradient: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
    };
  });

  const handleCustomPick = (color) => {
    setCustomColor(color);
    setMode("custom");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 3, pb: 10 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        App Theme
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the look & feel that works best for you. Stored locally per device.
      </Typography>

      <Grid container spacing={3} justifyContent="center" sx={{ mt: 1 }}>
        {presets.map((preset) => {
          const isActive = mode === preset.key;
          const primaryColor = themeMap[preset.key]?.palette?.primary?.main || "#4f46e5";
          
          return (
            <Grid item xs={4} key={preset.key} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box
                onClick={() => setMode(preset.key)}
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  border: "2px solid",
                  borderColor: isActive ? primaryColor : "transparent",
                  transition: "all 0.25s ease",
                  p: 0.5,
                  "&:hover": {
                    transform: "scale(1.05)",
                  }
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: preset.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  {isActive && <Check sx={{ color: "#ffffff", fontSize: "1.4rem" }} />}
                </Box>
              </Box>
              <Typography variant="caption" fontWeight="bold" sx={{ mt: 1, color: isActive ? "text.primary" : "text.secondary" }}>
                {preset.label}
              </Typography>
            </Grid>
          );
        })}

        {/* Custom Pick Color Circle */}
        <Grid item xs={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            onClick={() => setCustomOpen(true)}
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              border: "2px solid",
              borderColor: mode === "custom" ? customColor : "transparent",
              transition: "all 0.25s ease",
              p: 0.5,
              "&:hover": {
                transform: "scale(1.05)",
              }
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: customColor || "#e0e0e0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: !customColor ? "2px dashed rgba(0,0,0,0.15)" : "none",
              }}
            >
              {mode === "custom" ? (
                <Check sx={{ color: "#ffffff", fontSize: "1.4rem" }} />
              ) : (
                <Palette sx={{ color: customColor ? "#ffffff" : "text.secondary", fontSize: "1.2rem" }} />
              )}
            </Box>
          </Box>
          <Typography variant="caption" fontWeight="bold" sx={{ mt: 1, color: mode === "custom" ? "text.primary" : "text.secondary" }}>
            Custom
          </Typography>
        </Grid>
      </Grid>

      <Dialog open={customOpen} onClose={() => setCustomOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Choose a custom color</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Theme color"
              type="color"
              value={customColor}
              onChange={(e) => handleCustomPick(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hex value"
              value={customColor}
              onChange={(e) => handleCustomPick(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCustomOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => setCustomOpen(false)}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
