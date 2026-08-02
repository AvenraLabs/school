import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import {
  OndemandVideo,
  PlayArrow,
  GetApp,
  ArrowBack,
  ImageOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { formatDate } from "../../utils/date";

export default function StudentVideosPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);      // [{ subject_name, items: [...] }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [activeItem, setActiveItem] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    loadClassContent();
  }, []);

  async function loadClassContent() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/ai/videos/student/class-videos");
      // New grouped shape: { subjects: [{ subject_name, items }] }
      const grouped = res.data?.data?.subjects;
      if (Array.isArray(grouped)) {
        setSubjects(grouped);
      } else {
        // Graceful fallback for old flat shape (transition period)
        const flat = res.data?.data?.videos || [];
        if (flat.length > 0) {
          setSubjects([{ subject_name: "All", items: flat }]);
        } else {
          setSubjects([]);
        }
      }
    } catch (err) {
      console.error("Failed to load class content:", err);
      setError("Failed to load class content. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const currentItems = subjects[activeTab]?.items || [];
  const hasMultipleSubjects = subjects.length > 1;

  return (
    <Container maxWidth="sm" sx={{ mt: 2, pb: 6, px: 2, minHeight: "80vh" }}>
      {/* Back button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/student/dashboard")}
        sx={{ fontWeight: 800, color: "#475569", textTransform: "none", mb: 1.5 }}
      >
        Back
      </Button>

      <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", mb: 2.5 }}>
        Class Learning Content
      </Typography>

      {loading ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress size={36} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: "16px", fontWeight: 700 }}>{error}</Alert>
      ) : subjects.length === 0 ? (
        <Card sx={{ borderRadius: "20px", border: "1px solid #e2e8f0", p: 4, textAlign: "center" }}>
          <OndemandVideo sx={{ fontSize: 56, color: "#cbd5e1", mb: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
            No Content Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
            When your teacher generates AI educational diagrams or animations, they'll appear here!
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {/* Subject Tabs — only rendered when there are multiple subjects */}
          {hasMultipleSubjects && (
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                bgcolor: "#ffffff",
                borderRadius: "14px",
                border: "1px solid #f1f5f9",
                px: 1,
                "& .MuiTab-root": {
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  textTransform: "none",
                  minHeight: 44,
                  color: "#64748b",
                },
                "& .Mui-selected": { color: "#8b5cf6" },
                "& .MuiTabs-indicator": { backgroundColor: "#8b5cf6", height: 3, borderRadius: 2 },
              }}
            >
              {subjects.map((s, i) => (
                <Tab key={s.subject_name} label={s.subject_name} id={`subject-tab-${i}`} />
              ))}
            </Tabs>
          )}

          {/* Content cards for active tab */}
          {currentItems.length === 0 ? (
            <Card sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", p: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                No content in this subject yet.
              </Typography>
            </Card>
          ) : (
            <Stack spacing={2}>
              {currentItems.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  onOpen={() => { setActiveItem(item); setDetailOpen(true); }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      )}

      {/* Detail Dialog */}
      <DetailDialog
        open={detailOpen}
        item={activeItem}
        onClose={() => setDetailOpen(false)}
      />
    </Container>
  );
}

/* ─── Content Card ─────────────────────────────────────────────────────────── */
function ContentCard({ item, onOpen }) {
  const hasDiagram = Boolean(item.image_url);
  const hasVideo = Boolean(item.video_url || item.stream_url);

  return (
    <Card
      sx={{
        borderRadius: "20px",
        border: "1px solid #f1f5f9",
        boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
        bgcolor: "#ffffff",
        transition: "transform 0.2s ease",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          {/* Thumbnail */}
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "14px",
              overflow: "hidden",
              flexShrink: 0,
              border: "1px solid #e2e8f0",
              bgcolor: "#f3e8ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {hasDiagram ? (
              <img
                src={item.image_url}
                alt={item.topic}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <OndemandVideo sx={{ fontSize: 28, color: "#8b5cf6" }} />
            )}
          </Box>

          {/* Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>
              {item.topic}
            </Typography>
            {/* Summary — student-facing caption */}
            {item.summary ? (
              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500, mt: 0.5, lineHeight: 1.4 }}>
                {item.summary}
              </Typography>
            ) : (
              <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 600 }}>
                {item.subject_name || "General"} • {item.language || "English"}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Footer row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, pt: 1.5, borderTop: "1px solid #f1f5f9" }}>
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {hasDiagram && (
              <Chip
                icon={<ImageOutlined sx={{ fontSize: 12 }} />}
                label="Diagram"
                size="small"
                sx={{ fontWeight: 700, bgcolor: "#f3e8ff", color: "#7c3aed", fontSize: 11, height: 22 }}
              />
            )}
            {hasVideo && (
              <Chip
                icon={<OndemandVideo sx={{ fontSize: 12 }} />}
                label={`${item.duration || 6}s Video`}
                size="small"
                sx={{ fontWeight: 700, bgcolor: "#e0e7ff", color: "#3730a3", fontSize: 11, height: 22 }}
              />
            )}
            <Chip
              label={item.language || "English"}
              size="small"
              sx={{ fontWeight: 700, bgcolor: "#f1f5f9", color: "#475569", fontSize: 11, height: 22 }}
            />
          </Box>

          <Button
            variant="contained"
            size="small"
            onClick={onOpen}
            startIcon={hasVideo ? <PlayArrow /> : <ImageOutlined />}
            sx={{
              borderRadius: "10px",
              fontWeight: 800,
              textTransform: "none",
              px: 2,
              fontSize: "0.8rem",
              bgcolor: "#8b5cf6",
              "&:hover": { bgcolor: "#7c3aed" },
            }}
          >
            {hasVideo ? "Watch" : "View Diagram"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

/* ─── Detail Dialog ────────────────────────────────────────────────────────── */
function DetailDialog({ open, item, onClose }) {
  if (!item) return null;

  const hasVideo = Boolean(item.video_url || item.stream_url);
  const hasDiagram = Boolean(item.image_url);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "20px", p: 0.5 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: "#0f172a", pb: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
        <OndemandVideo sx={{ color: "#8b5cf6" }} />
        {item.topic}
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        <Stack spacing={2}>
          {/* Summary */}
          {item.summary && (
            <Typography variant="body2" sx={{ color: "#475569", fontWeight: 600, fontStyle: "italic", textAlign: "center" }}>
              {item.summary}
            </Typography>
          )}

          {/* Video player — shown only when a video exists */}
          {hasVideo && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
                Video
              </Typography>
              <Box sx={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", bgcolor: "#000000" }}>
                <video
                  src={item.video_url || item.stream_url}
                  controls
                  autoPlay
                  style={{ width: "100%", maxHeight: "300px", display: "block" }}
                />
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<GetApp />}
                component="a"
                href={item.video_url || item.stream_url}
                download
                target="_blank"
                sx={{
                  mt: 1,
                  borderRadius: "10px",
                  fontWeight: 800,
                  textTransform: "none",
                  fontSize: "0.8rem",
                  bgcolor: "#8b5cf6",
                  "&:hover": { bgcolor: "#7c3aed" },
                }}
              >
                Download MP4
              </Button>
            </Box>
          )}

          {/* Diagram image */}
          {hasDiagram && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "#475569", display: "block", mb: 0.5 }}>
                Labeled Diagram
              </Typography>
              <Box sx={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                <img src={item.image_url} alt={item.topic} style={{ width: "100%", display: "block" }} />
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<GetApp />}
                component="a"
                href={item.image_url}
                download
                target="_blank"
                sx={{
                  mt: 1,
                  borderRadius: "10px",
                  fontWeight: 800,
                  textTransform: "none",
                  fontSize: "0.8rem",
                  borderColor: "#8b5cf6",
                  color: "#8b5cf6",
                }}
              >
                Download Diagram PNG
              </Button>
            </Box>
          )}

          {!hasDiagram && !hasVideo && (
            <Alert severity="info" sx={{ borderRadius: "12px", fontWeight: 700 }}>
              Content is still being generated. Please check back soon.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Typography variant="caption" color="text.disabled" sx={{ flex: 1 }}>
          {formatDate(item.created_at || item.createdAt)}
        </Typography>
        <Button onClick={onClose} sx={{ fontWeight: 800, textTransform: "none", color: "#475569" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
