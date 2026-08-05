import React, { useState } from "react";
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Divider,
  Button,
  Paper,
  Card,
  CardContent,
} from "@mui/material";
import {
  Close,
  Info,
  Biotech,
  LocalHospital,
  Quiz,
  Lightbulb,
  Explore,
  CheckCircle,
} from "@mui/icons-material";

export default function OrganDetailsDrawer({
  organ,
  open,
  onClose,
  activeHotspot,
  onSelectHotspot,
  onOpenQuiz,
}) {
  const [tabValue, setTabValue] = useState(0);

  if (!organ) return null;

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: "85vh",
          bgcolor: "#FAFAF8",
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
          alignItems: "center",
          justify: "space-between",
          borderBottom: "1px solid #E4E1D8",
          bgcolor: "#FFFFFF",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontSize: 28 }}>
            {organ.icon}
          </Typography>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#14213D" sx={{ lineHeight: 1.1 }}>
              {organ.name}
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} size="small" sx={{ color: "#14213D" }}>
          <Close />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: "#FFFFFF", borderBottom: "1px solid #E4E1D8", px: 1 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 44,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              minHeight: 44,
              py: 0,
            },
          }}
        >
          <Tab icon={<Info sx={{ fontSize: 18 }} />} iconPosition="start" label="Overview" />
          <Tab icon={<Biotech sx={{ fontSize: 18 }} />} iconPosition="start" label={`Structures (${organ.hotspots?.length || 0})`} />
          <Tab icon={<LocalHospital sx={{ fontSize: 18 }} />} iconPosition="start" label="Medical & Conditions" />
        </Tabs>
      </Box>

      {/* Content Container */}
      <Box sx={{ p: 2, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Tab 0: Overview */}
        {tabValue === 0 && (
          <>
            {/* Poetic & Description */}
            <Card variant="outlined" sx={{ borderColor: "#E4E1D8", borderRadius: "12px", bgcolor: "#FFFFFF" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="caption" sx={{ color: organ.accent || "#2F6F5E", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 }}>
                  "{organ.poetic}"
                </Typography>
                <Typography variant="body2" color="#14213D" sx={{ mt: 0.5, lineHeight: 1.5 }}>
                  {organ.description}
                </Typography>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
              <Paper variant="outlined" sx={{ p: 1.5, borderColor: "#E4E1D8", borderRadius: "12px" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  LOCATION
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#14213D">
                  {organ.location}
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.5, borderColor: "#E4E1D8", borderRadius: "12px" }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>
                  AVERAGE WEIGHT
                </Typography>
                <Typography variant="body2" fontWeight={700} color="#14213D">
                  {organ.weight}
                </Typography>
              </Paper>
            </Box>

            {/* Primary Function & Daily Fact */}
            <Card variant="outlined" sx={{ borderColor: "#E4E1D8", borderRadius: "12px", bgcolor: "#EAF3F0" }}>
              <CardContent sx={{ p: 2, display: "flex", gap: 1.5 }}>
                <Lightbulb sx={{ color: "#2F6F5E", mt: 0.2 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={800} color="#2F6F5E">
                    Did You Know?
                  </Typography>
                  <Typography variant="body2" color="#14213D" sx={{ mt: 0.2 }}>
                    {organ.funFact}
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Blood Supply & Tissue */}
            <Paper variant="outlined" sx={{ p: 2, borderColor: "#E4E1D8", borderRadius: "12px", bgcolor: "#FFFFFF" }}>
              <Typography variant="subtitle2" fontWeight={800} color="#14213D" sx={{ mb: 1 }}>
                Vascular & Tissue Architecture
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Blood Supply:</strong> {organ.bloodSupply}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                <strong>Histological Tissue:</strong> {organ.tissue}
              </Typography>
            </Paper>
          </>
        )}

        {/* Tab 1: Structures & Hotspots */}
        {tabValue === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={800} color="#14213D">
              Tap any hotspot marker in the 3D model or select below:
            </Typography>

            {organ.hotspots?.map((hs) => {
              const isSelected = activeHotspot?.id === hs.id;
              return (
                <Card
                  key={hs.id}
                  variant="outlined"
                  onClick={() => onSelectHotspot(hs)}
                  sx={{
                    borderColor: isSelected ? hs.color || "#2F6F5E" : "#E4E1D8",
                    borderWidth: isSelected ? 2 : 1,
                    borderRadius: "12px",
                    bgcolor: isSelected ? "#EAF3F0" : "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: hs.color || "#2F6F5E",
                          }}
                        />
                        <Typography variant="subtitle2" fontWeight={800} color="#14213D">
                          {hs.label}
                        </Typography>
                      </Box>
                      {isSelected && (
                        <Chip label="Focused" size="small" sx={{ bgcolor: "#2F6F5E", color: "#FFFFFF", fontWeight: 700, height: 22 }} />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8, fontSize: 13 }}>
                      {hs.detail}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        {/* Tab 2: Medical & Conditions */}
        {tabValue === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper variant="outlined" sx={{ p: 2, borderColor: "#E4E1D8", borderRadius: "12px", bgcolor: "#FFFFFF" }}>
              <Typography variant="subtitle2" fontWeight={800} color="#14213D" sx={{ mb: 1 }}>
                Clinical Considerations
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                {organ.medical}
              </Typography>
            </Paper>

            <Box>
              <Typography variant="subtitle2" fontWeight={800} color="#14213D" sx={{ mb: 1 }}>
                Associated Medical Conditions
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {organ.conditions?.map((cond, idx) => (
                  <Chip
                    key={idx}
                    label={cond}
                    variant="outlined"
                    sx={{
                      borderColor: "#E4E1D8",
                      bgcolor: "#FFFFFF",
                      color: "#14213D",
                      fontWeight: 600,
                      fontSize: 12,
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Action Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #E4E1D8",
          bgcolor: "#FFFFFF",
          display: "flex",
          gap: 1.5,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          startIcon={<Quiz />}
          onClick={onOpenQuiz}
          sx={{
            bgcolor: "#2F6F5E",
            color: "#FFFFFF",
            fontWeight: 800,
            py: 1.2,
            borderRadius: "10px",
            textTransform: "none",
            "&:hover": { bgcolor: "#245749" },
          }}
        >
          Take Anatomy Quiz
        </Button>
      </Box>
    </Drawer>
  );
}
