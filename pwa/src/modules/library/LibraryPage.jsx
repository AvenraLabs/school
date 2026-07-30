import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Alert,
  Tabs,
  Tab,
  Avatar,
  Button,
} from "@mui/material";
import {
  MenuBook,
  AccessTime,
  History,
  ErrorOutline,
  Book,
  ExpandMore,
} from "@mui/icons-material";
import { getMyLibraryApi } from "./library.api";
import { getAssetUrl } from "../../utils/asset";
import { formatDate } from "../../utils/date";

export default function LibraryPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ active: [], history: [] });
  const [error, setError] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  // History Pagination State
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadLibrary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMyLibraryApi({ page: 1, limit: 10 });
      setData(res || { active: [], history: [] });
      setHistoryPage(res?.historyPage || 1);
      setHasMoreHistory(Boolean(res?.hasMoreHistory));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load library data");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreHistory = async () => {
    if (loadingMore || !hasMoreHistory) return;
    setLoadingMore(true);
    try {
      const nextPage = historyPage + 1;
      const res = await getMyLibraryApi({ page: nextPage, limit: 10 });
      setData((prev) => ({
        ...prev,
        history: [...(prev.history || []), ...(res?.history || [])],
      }));
      setHistoryPage(nextPage);
      setHasMoreHistory(Boolean(res?.hasMoreHistory));
    } catch (err) {
      console.error("Failed to load more history:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 6, textAlign: "center" }}>
        <CircularProgress size={36} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontWeight: 700 }}>
          Loading library details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error" icon={<ErrorOutline />} sx={{ borderRadius: "16px", fontWeight: 700 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const activeBooks = data.active || [];
  const historyBooks = data.history || [];
  const todayStr = new Date().toISOString().split("T")[0];

  const cardSx = {
    borderRadius: "24px",
    border: "1px solid rgba(0,0,0,0.06)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
    overflow: "hidden",
    bgcolor: "#ffffff",
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 10 }}>
      <Stack spacing={2.5}>
        {/* Header Summary */}
        <Card sx={{ ...cardSx, border: "1px solid #e2e8f0" }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900, color: "#0f172a" }}>
                  My Books
                </Typography>
              </Box>

              <Chip
                label={`${activeBooks.length} Currently Issued`}
                sx={{
                  fontWeight: 900,
                  fontSize: 12,
                  bgcolor: "#eef2ff",
                  color: "#4f46e5",
                  border: "1px solid #c7d2fe",
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabIndex}
            onChange={(e, val) => setTabIndex(val)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": { textTransform: "none", fontWeight: 800, fontSize: "0.9rem" },
            }}
          >
            <Tab icon={<AccessTime sx={{ fontSize: 18 }} />} iconPosition="start" label={`Issued (${activeBooks.length})`} />
            <Tab icon={<History sx={{ fontSize: 18 }} />} iconPosition="start" label={`History (${data.historyTotal || historyBooks.length})`} />
          </Tabs>
        </Box>

        {/* Tab 0: Currently Issued */}
        {tabIndex === 0 && (
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              {activeBooks.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <MenuBook sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    No books currently issued.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {activeBooks.map((issue) => {
                    const isOverdue = issue.due_date < todayStr;
                    const imageUrl = issue.Book?.image_url ? getAssetUrl(issue.Book.image_url) : null;

                    return (
                      <Box
                        key={issue.id}
                        sx={{
                          p: 2,
                          borderRadius: "20px",
                          border: "1px solid",
                          borderColor: isOverdue ? "#fecdd3" : "#e2e8f0",
                          bgcolor: isOverdue ? "#fff1f2" : "#f8fafc",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        {/* Book Cover Photo */}
                        <Avatar
                          variant="rounded"
                          src={imageUrl || undefined}
                          sx={{
                            width: 56,
                            height: 68,
                            borderRadius: "12px",
                            bgcolor: "#e0e7ff",
                            color: "#3730a3",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          }}
                        >
                          {!imageUrl && <Book />}
                        </Avatar>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: "#0f172a", noWrap: true }}>
                            {issue.Book?.book_name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#64748b", display: "block" }}>
                            {issue.Book?.book_no}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: isOverdue ? "#e11d48" : "#475569",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              mt: 0.5,
                            }}
                          >
                            <AccessTime sx={{ fontSize: 14 }} />
                            {isOverdue ? `Overdue! Due: ${formatDate(issue.due_date)}` : `Due Date: ${formatDate(issue.due_date)}`}
                          </Typography>
                        </Box>

                        <Chip
                          label={isOverdue ? "Overdue" : "Issued"}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: 11,
                            fontWeight: 800,
                            bgcolor: isOverdue ? "#ffe4e6" : "#e0e7ff",
                            color: isOverdue ? "#9f1239" : "#3730a3",
                            flexShrink: 0,
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 1: History */}
        {tabIndex === 1 && (
          <Card sx={cardSx}>
            <CardContent sx={{ p: 2.5 }}>
              {historyBooks.length === 0 ? (
                <Box sx={{ py: 4, textAlign: "center" }}>
                  <History sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    No book history found.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {historyBooks.map((issue) => {
                    const isReturned = issue.status === "returned";
                    const isDamaged = issue.status === "damaged";
                    const isLost = issue.status === "lost";
                    const imageUrl = issue.Book?.image_url ? getAssetUrl(issue.Book.image_url) : null;

                    return (
                      <Box
                        key={issue.id}
                        sx={{
                          p: 2,
                          borderRadius: "20px",
                          border: "1px solid #f1f5f9",
                          bgcolor: "#fafafa",
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Avatar
                          variant="rounded"
                          src={imageUrl || undefined}
                          sx={{
                            width: 52,
                            height: 64,
                            borderRadius: "12px",
                            bgcolor: "#f1f5f9",
                            color: "#64748b",
                          }}
                        >
                          {!imageUrl && <Book />}
                        </Avatar>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 800, color: "#0f172a", noWrap: true }}>
                            {issue.Book?.book_name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#64748b", display: "block" }}>
                            {issue.Book?.book_no}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mt: 0.5 }}>
                            Issued: {formatDate(issue.issue_date)} {issue.returned_date ? `· Returned: ${formatDate(issue.returned_date)}` : ""}
                          </Typography>
                        </Box>

                        <Chip
                          label={issue.status}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: 11,
                            fontWeight: 800,
                            textTransform: "capitalize",
                            bgcolor: isReturned ? "#dcfce7" : isDamaged ? "#fef3c7" : isLost ? "#ffe4e6" : "#f1f5f9",
                            color: isReturned ? "#15803d" : isDamaged ? "#b45309" : isLost ? "#b91c1c" : "#64748b",
                            flexShrink: 0,
                          }}
                        />
                      </Box>
                    );
                  })}

                  {/* Load More History Button */}
                  {hasMoreHistory && (
                    <Box sx={{ textAlign: "center", pt: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={loadMoreHistory}
                        disabled={loadingMore}
                        endIcon={loadingMore ? <CircularProgress size={16} /> : <ExpandMore />}
                        sx={{
                          borderRadius: "14px",
                          fontWeight: 800,
                          textTransform: "none",
                          px: 3,
                          borderColor: "#cbd5e1",
                          color: "#475569",
                        }}
                      >
                        {loadingMore ? "Loading..." : "Load More History"}
                      </Button>
                    </Box>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
