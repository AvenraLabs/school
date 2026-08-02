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
  Alert,
} from "@mui/material";
import {
  OndemandVideo,
  PlayCircleOutline,
  GetApp,
  ArrowBack,
  ImageOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { formatDate } from "../../utils/date";

export default function StudentVideosPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);          // [{ subject_name, items: [...] }]
  const [subjectCounts, setSubjectCounts] = useState([]);// [{ subject_name, count }]
  const [videos, setVideos] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, hasMore: false });
  const [activeItem, setActiveItem] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    loadClassContent(null, 1);
  }, []);

  async function loadClassContent(subj = selectedSubject, pageNum = 1, append = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/ai/videos/student/class-videos", {
        params: {
          page: pageNum,
          limit: 12,
          subjectName: subj || undefined,
        },
      });

      const data = res.data?.data || {};
      const newItems = data.videos || [];
      setVideos((prev) => (append ? [...prev, ...newItems] : newItems));

      if (Array.isArray(data.subjects)) {
        setSubjects(data.subjects);
      }
      if (Array.isArray(data.subjectCounts)) {
        setSubjectCounts(data.subjectCounts);
      }
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Failed to load class content:", err);
      setError("Failed to load class content. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Calculate subject folders count map
  const folderMap = new Map();
  subjectCounts.forEach((s) => folderMap.set(s.subject_name, s.count));
  subjects.forEach((s) => {
    if (!folderMap.has(s.subject_name)) {
      folderMap.set(s.subject_name, (s.items || []).length);
    }
  });

  const subjectList = Array.from(folderMap.entries());

  return (
    <Container maxWidth="md" sx={{ mt: 2, pb: 6, px: 2, minHeight: "80vh" }}>
      {/* Back button & Subject Title */}
      <Box sx={{ display: "flex", alignItems: "center", justifyBetween: "space-between", mb: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => {
            if (selectedSubject !== null) {
              setSelectedSubject(null);
              loadClassContent(null, 1);
            } else {
              navigate("/student/dashboard");
            }
          }}
          sx={{ fontWeight: 800, color: "#475569", textTransform: "none" }}
        >
          {selectedSubject ? "All Subjects" : "Back"}
        </Button>
        {selectedSubject && (
          <Chip
            icon={<OndemandVideo sx={{ fontSize: 16 }} />}
            label={selectedSubject}
            sx={{ fontWeight: 800, bgcolor: "#f3e8ff", color: "#6b21a8", ml: "auto" }}
          />
        )}
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a", mb: 2.5 }}>
        {selectedSubject ? `${selectedSubject} Learning Content` : "Class Learning Library"}
      </Typography>

      {loading && videos.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress size={36} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: "16px", fontWeight: 700 }}>{error}</Alert>
      ) : selectedSubject === null ? (
        /* Subject Folders View */
        subjectList.length === 0 ? (
          <Card sx={{ borderRadius: "20px", border: "1px solid #e2e8f0", p: 4, textAlign: "center" }}>
            <OndemandVideo sx={{ fontSize: 56, color: "#cbd5e1", mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
              No Content Yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
              When your teacher generates AI educational diagrams or animations, they will appear here!
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            {subjectList.map(([subj, count]) => (
              <Grid item xs={6} sm={4} md={3} key={subj}>
                <Card
                  onClick={() => {
                    setSelectedSubject(subj);
                    loadClassContent(subj, 1);
                  }}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 8px 24px rgba(139, 92, 246, 0.12)",
                      borderColor: "#ddd6fe",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, textAlign: "center" }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "14px",
                        bgcolor: "#f3e8ff",
                        color: "#8b5cf6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mx: "auto",
                        mb: 1.5,
                      }}
                    >
                      <OndemandVideo sx={{ fontSize: 26 }} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }} noWrap>
                      {subj}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                      {count} {count === 1 ? "item" : "items"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        /* 16:9 YouTube / Netflix Streaming Style Cards */
        videos.length === 0 ? (
          <Card sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              No content in {selectedSubject} yet.
            </Typography>
          </Card>
        ) : (
          <Stack spacing={3}>
            <Grid container spacing={2.5}>
              {videos.map((item) => {
                const hasVideo = Boolean(item.video_url || item.stream_url);
                return (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Box
                      onClick={() => {
                        setActiveItem(item);
                        setDetailOpen(true);
                      }}
                      sx={{
                        borderRadius: "16px",
                        overflow: "hidden",
                        bgcolor: "#ffffff",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                        "&:hover .thumbnail-img": { transform: "scale(1.04)" },
                        "&:hover .play-overlay": { opacity: 1 },
                      }}
                    >
                      {/* 16:9 Thumbnail Image — Borderless YouTube style */}
                      <Box
                        sx={{
                          width: "100%",
                          aspectRatio: "16/9",
                          borderRadius: "14px",
                          overflow: "hidden",
                          position: "relative",
                          bgcolor: "#0f172a",
                        }}
                      >
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.topic}
                            className="thumbnail-img"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              transition: "transform 0.3s ease",
                            }}
                          />
                        ) : (
                          <Box sx={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#1e1b4b" }}>
                            <OndemandVideo sx={{ fontSize: 40, color: "#8b5cf6" }} />
                          </Box>
                        )}

                        {/* Video Play Overlay */}
                        {hasVideo && (
                          <Box
                            className="play-overlay"
                            sx={{
                              position: "absolute",
                              inset: 0,
                              bgcolor: "rgba(15, 23, 42, 0.4)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              opacity: 0.9,
                              transition: "opacity 0.2s ease",
                            }}
                          >
                            <Box
                              sx={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                bgcolor: "rgba(255, 255, 255, 0.9)",
                                color: "#8b5cf6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                              }}
                            >
                              <PlayCircleOutline sx={{ fontSize: 32 }} />
                            </Box>
                          </Box>
                        )}

                        {/* Content Type Badge */}
                        <Box sx={{ position: "absolute", bottom: 8, left: 8 }}>
                          <Chip
                            label={item.content_type === "diagram_and_video" ? "Video" : "Diagram"}
                            size="small"
                            sx={{
                              bgcolor: "rgba(15, 23, 42, 0.75)",
                              color: "#ffffff",
                              fontWeight: 800,
                              fontSize: "0.65rem",
                              backdropFilter: "blur(4px)",
                              height: 20,
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Text below thumbnail (no white border box) */}
                      <Box sx={{ pt: 1, pb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.9rem", lineHeight: 1.3 }} noWrap>
                          {item.topic}
                        </Typography>
                        {item.summary && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#64748b",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              mt: 0.25,
                              lineHeight: 1.3,
                            }}
                          >
                            {item.summary}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            {/* Load More Pagination */}
            {pagination.hasMore && (
              <Box sx={{ textAlign: "center", pt: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => loadClassContent(selectedSubject, pagination.page + 1, true)}
                  loading={loading}
                  sx={{ borderRadius: "12px", fontWeight: 800, textTransform: "none", color: "#8b5cf6", borderColor: "#ddd6fe" }}
                >
                  Load More Content
                </Button>
              </Box>
            )}
          </Stack>
        )
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

/* ─── Detail Dialog ────────────────────────────────────────────────────────── */
function DetailDialog({ open, item, onClose }) {
  if (!item) return null;

  const hasVideo = Boolean(item.video_url || item.stream_url);
  const hasDiagram = Boolean(item.image_url);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
                Video Lesson
              </Typography>
              <Box sx={{ borderRadius: "14px", overflow: "hidden", border: "1px solid #e2e8f0", bgcolor: "#000000" }}>
                <video
                  src={item.video_url || item.stream_url}
                  controls
                  autoPlay
                  style={{ width: "100%", maxHeight: "360px", display: "block" }}
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
                Educational Diagram
              </Typography>
              <Box sx={{ borderRadius: "14px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
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
