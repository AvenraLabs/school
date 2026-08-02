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
  Grid,
} from "@mui/material";
import {
  OndemandVideo,
  PlayArrow,
  GetApp,
  ArrowBack,
  CheckCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getAssetUrl } from "../../utils/asset";
import { formatDate } from "../../utils/date";

export default function StudentVideosPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [playerOpen, setPlayerOpen] = useState(false);

  useEffect(() => {
    loadClassVideos();
  }, []);

  async function loadClassVideos() {
    setLoading(true);
    try {
      const res = await api.get("/ai/videos/student/class-videos");
      setVideos(res.data?.data?.videos || []);
    } catch (err) {
      console.error("Failed to load class videos:", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePlay = (video) => {
    setActiveVideo(video);
    setPlayerOpen(true);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 2, pb: 4, px: 2, minHeight: "80vh" }}>
      {/* Top Header */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/student/dashboard")}
        sx={{ fontWeight: 800, color: "#475569", textTransform: "none", mb: 1.5 }}
      >
        Back
      </Button>

      <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", mb: 2.5 }}>
        Class Videos
      </Typography>

      {loading ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress size={36} />
        </Box>
      ) : videos.length === 0 ? (
        <Card sx={{ borderRadius: "20px", border: "1px solid #e2e8f0", p: 4, textAlign: "center" }}>
          <OndemandVideo sx={{ fontSize: 56, color: "#cbd5e1", mb: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
            No Class Videos Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
            When your teacher generates AI educational animations, they will appear here!
          </Typography>
        </Card>
      ) : (
        <Stack spacing={2}>
          {videos.map((vid) => (
            <Card
              key={vid.id}
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
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "12px",
                        bgcolor: "#f3e8ff",
                        color: "#8b5cf6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <OndemandVideo />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                        {vid.topic}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                        {vid.subject_name || "General"} • {vid.duration || 5}s HD Video
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={vid.language || "English"}
                    size="small"
                    sx={{ fontWeight: 800, bgcolor: "#e0e7ff", color: "#3730a3", fontSize: 11 }}
                  />
                </Box>

                {vid.prompt && (
                  <Typography variant="body2" sx={{ color: "text.secondary", my: 1, fontWeight: 500, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {vid.prompt}
                  </Typography>
                )}

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2, pt: 1.5, borderTop: "1px solid #f1f5f9" }}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600 }}>
                    {formatDate(vid.created_at || vid.createdAt)}
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={() => handlePlay(vid)}
                    startIcon={<PlayArrow />}
                    sx={{
                      borderRadius: "12px",
                      fontWeight: 800,
                      textTransform: "none",
                      px: 2.5,
                      bgcolor: "#8b5cf6",
                      "&:hover": { bgcolor: "#7c3aed" },
                    }}
                  >
                    Watch Video
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Video Player Modal */}
      <Dialog
        open={playerOpen}
        onClose={() => setPlayerOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#0f172a", pb: 1, display: "flex", alignItems: "center", gap: 1 }}>
          <OndemandVideo sx={{ color: "#8b5cf6" }} />
          {activeVideo?.topic || "Class Video"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {activeVideo?.video_url && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0", bgcolor: "#000000" }}>
                <video
                  src={getAssetUrl(activeVideo.stream_url || activeVideo.video_url)}
                  controls
                  autoPlay
                  style={{ width: "100%", maxHeight: "350px", display: "block" }}
                />
              </Box>
              <Button
                variant="contained"
                startIcon={<GetApp />}
                component="a"
                href={getAssetUrl(activeVideo.stream_url || activeVideo.video_url)}
                download
                target="_blank"
                sx={{ borderRadius: "12px", fontWeight: 800, textTransform: "none", bgcolor: "#8b5cf6", "&:hover": { bgcolor: "#7c3aed" } }}
              >
                Download MP4 Video
              </Button>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPlayerOpen(false)} sx={{ fontWeight: 800, textTransform: "none" }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
