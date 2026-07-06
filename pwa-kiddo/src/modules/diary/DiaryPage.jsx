import { useState } from "react";
import {
  Container,
  CircularProgress,
  Alert,
  Typography,
  Card,
  CardContent,
  Box,
  Stack,
  Button,
  Fab,
  Grid,
} from "@mui/material";
import { Assignment, Add } from "@mui/icons-material";
import { useDiary } from "./useDiary";
import { useAuth } from "../../auth/AuthProvider";
import CreateHomeworkDialog from "./CreateHomeworkDialog";

export default function DiaryPage() {
  const { user } = useAuth();
  const { items, loading, error, refresh, loadMore, hasMore, loadingMore } = useDiary();
  const [showCreate, setShowCreate] = useState(false);

  const canCreate = user?.role === "teacher" || user?.role === "school_admin";

  if (loading) {
    return (
      <Container sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const groupedEntries = Object.entries(
    items.reduce((acc, item) => {
      const raw =
        item.created_at ||
        item.createdAt ||
        item.homework_date ||
        "unknown";
      const dateKey =
        raw === "unknown"
          ? "unknown"
          : new Date(raw).toISOString().split("T")[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(item);
      return acc;
    }, {})
  ).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <Container maxWidth="sm" sx={{ mt: 3, pb: 10 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Homework
      </Typography>

      {items.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 5, color: 'text.secondary' }}>
          <Assignment sx={{ fontSize: 60, opacity: 0.5, mb: 2 }} />
          <Typography>No homework assigned yet!</Typography>
        </Box>
      ) : (
        <>
          {groupedEntries.map(([dateKey, dayItems]) => (
            <Box key={dateKey} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5, color: "text.secondary" }}>
                {dateKey === "unknown"
                  ? "No date"
                  : new Date(dateKey).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
              <Grid container spacing={2}>
                {dayItems.map((item) => {
                  const subjectName =
                    item.Subject?.name ||
                    item.subject?.name ||
                    item.subject ||
                    "Subject";
                  const dueDate = item.homework_date || item.due_date || "";
                  const className =
                    item.Class?.class_name ||
                    item.class?.class_name ||
                    item.class?.name ||
                    "";
                  const sectionName =
                    item.Section?.name ||
                    item.section?.name ||
                    "";

                  return (
                    <Grid item xs={12} key={item.id}>
                      <Card sx={{ borderRadius: 3, boxShadow: 'none', border: "1px solid rgba(0,0,0,0.05)" }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                            <Box>
                              <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                {subjectName}
                              </Typography>
                              {(className || sectionName) && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  {[className, sectionName].filter(Boolean).join(" ")}
                                </Typography>
                              )}
                            </Box>
                            {dueDate && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
                              >
                                Due: {new Date(dueDate).toLocaleDateString()}
                              </Typography>
                            )}
                          </Stack>

                          <Typography variant="body2" color="text.primary" sx={{ mt: 1.5, lineHeight: 1.5 }}>
                            {item.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ))}

          {/* Pagination Load More Button */}
          {hasMore && (
            <Box sx={{ textAlign: "center", mt: 4, mb: 2 }}>
              <Button
                variant="outlined"
                onClick={loadMore}
                disabled={loadingMore}
                startIcon={loadingMore ? <CircularProgress size={16} /> : null}
                sx={{
                  borderRadius: "12px",
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                }}
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            </Box>
          )}
        </>
      )}

      {canCreate && (
        <>
          <Box sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}>
            <Fab color="primary" onClick={() => setShowCreate(true)}>
              <Add />
            </Fab>
          </Box>

          <CreateHomeworkDialog
            open={showCreate}
            onClose={() => setShowCreate(false)}
            onSuccess={() => {
              if (refresh) refresh();
            }}
          />
        </>
      )}
    </Container>
  );
}
