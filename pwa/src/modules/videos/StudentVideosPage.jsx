import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  CircularProgress,
  Stack,
  Chip,
  Alert,
  useTheme,
  alpha,
} from "@mui/material";
import { OndemandVideo, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import SubjectFolderGrid from "../../components/content-library/SubjectFolderGrid";
import ContentTile from "../../components/content-library/ContentTile";
import MediaViewerModal from "../../components/content-library/MediaViewerModal";
import { tokens } from "../../theme/tokens";

export default function StudentVideosPage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [subjects, setSubjects] = useState([]);
  const [subjectCounts, setSubjectCounts] = useState([]);
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

  return (
    <Container maxWidth="md" sx={{ mt: 2, pb: 6, px: 2, minHeight: "80vh" }}>
      {/* Back button & Subject Title Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
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
          sx={{ fontWeight: 800, color: theme.palette.text.secondary, textTransform: "none" }}
        >
          {selectedSubject ? "All Subjects" : "Back"}
        </Button>
        {selectedSubject && (
          <Chip
            icon={<OndemandVideo sx={{ fontSize: 16 }} />}
            label={selectedSubject}
            sx={{
              fontWeight: 800,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              ml: "auto",
            }}
          />
        )}
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette.text.primary, mb: 2.5 }}>
        {selectedSubject ? `${selectedSubject} Learning Content` : "Class Learning Library"}
      </Typography>

      {loading && videos.length === 0 ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress size={36} sx={{ color: theme.palette.primary.main }} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: `${tokens.radius.md}px`, fontWeight: 700 }}>
          {error}
        </Alert>
      ) : selectedSubject === null ? (
        /* Subject Folders View (Shared SubjectFolderGrid) */
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: theme.palette.text.primary, mb: 2 }}>
            Subjects Library
          </Typography>
          <SubjectFolderGrid
            subjectFolders={subjectCounts}
            teacherVideos={videos}
            onSelectSubject={(subj) => {
              setSelectedSubject(subj);
              loadClassContent(subj, 1);
            }}
            isTeacher={false}
          />
        </Box>
      ) : (
        /* Mobile 2-Column Content Grid (Shared ContentTile) */
        videos.length === 0 ? (
          <Card
            sx={{
              borderRadius: `${tokens.radius.lg}px`,
              border: `1px solid ${theme.palette.divider}`,
              p: 4,
              textAlign: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              No content in {selectedSubject} yet.
            </Typography>
          </Card>
        ) : (
          <Stack spacing={3}>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
              {videos.map((item) => (
                <ContentTile
                  key={item.id}
                  item={item}
                  isTeacher={false}
                  onOpen={() => {
                    setActiveItem(item);
                    setDetailOpen(true);
                  }}
                />
              ))}
            </Box>

            {/* Load More Pagination */}
            {pagination.hasMore && (
              <Box sx={{ textAlign: "center", pt: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => loadClassContent(selectedSubject, pagination.page + 1, true)}
                  loading={loading}
                  sx={{
                    borderRadius: `${tokens.radius.md}px`,
                    fontWeight: 800,
                    textTransform: "none",
                    color: theme.palette.primary.main,
                    borderColor: theme.palette.primary.main,
                  }}
                >
                  Load More Content
                </Button>
              </Box>
            )}
          </Stack>
        )
      )}

      {/* Full-Screen Media Viewer Modal */}
      <MediaViewerModal
        open={detailOpen}
        item={activeItem}
        onClose={() => setDetailOpen(false)}
      />
    </Container>
  );
}
