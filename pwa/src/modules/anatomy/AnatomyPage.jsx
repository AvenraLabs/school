import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  InputBase,
  Chip,
  IconButton,
  Button,
  Paper,
  Card,
  CardActionArea,
  CardContent,
} from "@mui/material";
import {
  Search,
  Clear,
  InfoOutlined,
  Quiz,
  Autorenew,
  CompassCalibration,
  Biotech,
  Tune,
} from "@mui/icons-material";
import { organs, bodySystems } from "./anatomyData";
import AnatomyViewer from "./AnatomyViewer";
import OrganDetailsDrawer from "./OrganDetailsDrawer";
import AnatomyQuizModal from "./AnatomyQuizModal";

export default function AnatomyPage() {
  const [selectedOrganId, setSelectedOrganId] = useState("heart");
  const [selectedSystem, setSelectedSystem] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  // Filter organs list based on selected system and search query
  const filteredOrgans = useMemo(() => {
    return organs.filter((org) => {
      const matchesSystem = selectedSystem === "all" || org.system === selectedSystem;
      const matchesQuery =
        searchQuery.trim() === "" ||
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.system.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSystem && matchesQuery;
    });
  }, [selectedSystem, searchQuery]);

  const activeOrgan = useMemo(() => {
    return organs.find((o) => o.id === selectedOrganId) || organs[0];
  }, [selectedOrganId]);

  const handleSelectOrgan = (id) => {
    setSelectedOrganId(id);
    setActiveHotspot(null);
  };

  const handleSelectHotspot = (hs) => {
    setActiveHotspot(hs);
    setDetailsOpen(true);
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 120px)",
        maxHeight: "calc(100vh - 120px)",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#FAFAF8",
        overflow: "hidden",
      }}
    >
      {/* 1. Compact Action Header Toolbar */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: "#FFFFFF",
          borderBottom: "1px solid #E4E1D8",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          zIndex: 5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                bgcolor: "#EAF3F0",
                color: "#2F6F5E",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Biotech />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#14213D" sx={{ lineHeight: 1.1 }}>
                Anatomy
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<InfoOutlined />}
              onClick={() => setDetailsOpen(true)}
              sx={{
                borderColor: "#E4E1D8",
                color: "#14213D",
                fontWeight: 700,
                fontSize: 12,
                borderRadius: "8px",
                textTransform: "none",
              }}
            >
              Details
            </Button>

            <Button
              size="small"
              variant="contained"
              startIcon={<Quiz />}
              onClick={() => setQuizOpen(true)}
              sx={{
                bgcolor: "#2F6F5E",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: 12,
                borderRadius: "8px",
                textTransform: "none",
                "&:hover": { bgcolor: "#245749" },
              }}
            >
              Quiz
            </Button>
          </Box>
        </Box>

        {/* Search & System Filter Bar */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Paper
            variant="outlined"
            sx={{
              p: "2px 8px",
              display: "flex",
              alignItems: "center",
              flex: 1,
              borderColor: "#E4E1D8",
              borderRadius: "10px",
              bgcolor: "#FAFAF8",
            }}
          >
            <Search sx={{ color: "text.secondary", fontSize: 20, mr: 0.5 }} />
            <InputBase
              placeholder="Search organ or system (e.g. Heart, Brain)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1, fontSize: 13, color: "#14213D" }}
            />
            {searchQuery && (
              <IconButton size="small" onClick={() => setSearchQuery("")}>
                <Clear fontSize="small" />
              </IconButton>
            )}
          </Paper>
        </Box>

        {/* System Category Filter Pills */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            pb: 0.5,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {bodySystems.map((sys) => {
            const isSelected = selectedSystem === sys.id;
            return (
              <Chip
                key={sys.id}
                label={sys.name}
                size="small"
                onClick={() => setSelectedSystem(sys.id)}
                sx={{
                  bgcolor: isSelected ? "#2F6F5E" : "#FFFFFF",
                  color: isSelected ? "#FFFFFF" : "#14213D",
                  border: "1px solid",
                  borderColor: isSelected ? "#2F6F5E" : "#E4E1D8",
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: 12,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: isSelected ? "#2F6F5E" : "#EAF3F0",
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* 2. Main 3D Canvas Viewport */}
      <Box sx={{ flex: 1, position: "relative", minHeight: 0 }}>
        <AnatomyViewer
          organ={activeOrgan}
          activeHotspot={activeHotspot}
          onSelectHotspot={handleSelectHotspot}
          autoRotate={autoRotate}
          onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
        />
      </Box>

      {/* 3. Bottom Organ Selector Carousel */}
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          borderTop: "1px solid #E4E1D8",
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 0.5 }}>
            SELECT ANATOMICAL MODEL ({filteredOrgans.length})
          </Typography>

          {activeHotspot && (
            <Chip
              label={`Hotspot: ${activeHotspot.label}`}
              size="small"
              onDelete={() => setActiveHotspot(null)}
              sx={{ bgcolor: "#EAF3F0", color: "#2F6F5E", fontWeight: 700, height: 22, fontSize: 11 }}
            />
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            overflowX: "auto",
            pb: 0.5,
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {filteredOrgans.map((org) => {
            const isSelected = org.id === selectedOrganId;
            return (
              <Paper
                key={org.id}
                variant="outlined"
                onClick={() => handleSelectOrgan(org.id)}
                sx={{
                  minWidth: 100,
                  p: 1,
                  borderColor: isSelected ? "#2F6F5E" : "#E4E1D8",
                  borderWidth: isSelected ? 2 : 1,
                  bgcolor: isSelected ? "#EAF3F0" : "#FFFFFF",
                  borderRadius: "12px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justify: "center",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    borderColor: "#2F6F5E",
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontSize: 24, mb: 0.2 }}>
                  {org.icon}
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color={isSelected ? "#2F6F5E" : "#14213D"}
                  textAlign="center"
                  noWrap
                  sx={{ width: "100%", fontSize: 12 }}
                >
                  {org.name}
                </Typography>
              </Paper>
            );
          })}
        </Box>
      </Box>

      {/* Slide-up Organ Details Drawer */}
      <OrganDetailsDrawer
        organ={activeOrgan}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        activeHotspot={activeHotspot}
        onSelectHotspot={handleSelectHotspot}
        onOpenQuiz={() => {
          setDetailsOpen(false);
          setQuizOpen(true);
        }}
      />

      {/* Interactive Quiz Challenge Modal */}
      <AnatomyQuizModal
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
        targetOrganId={activeOrgan?.id}
      />
    </Box>
  );
}
