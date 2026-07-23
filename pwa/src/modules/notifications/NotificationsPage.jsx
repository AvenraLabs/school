import { useEffect, useRef, useState } from "react";
import {
  Container,
  CircularProgress,
  Alert,
  Typography,
  Fab,
  Box,
  Button,
  Stack,
} from "@mui/material";
import { Add, NotificationsNone } from "@mui/icons-material";
import { useNotifications } from "./useNotifications";
import NotificationsList from "./NotificationsList";
import CreateNotificationDialog from "./CreateNotificationDialog";
import { useAuth } from "../../auth/AuthProvider";

export default function NotificationsPage() {
  const { user } = useAuth();
  const {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    acknowledge,
    markAllRead,
    loadMore,
    refresh,
  } = useNotifications();

  const [showCreate, setShowCreate] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  // IntersectionObserver sentinel for auto-load on scroll
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: "120px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  const canCreate = user?.role === "teacher" || user?.role === "admin";
  const hasUnread = items.some((item) => !item.is_acknowledged);

  const handleMarkAllRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await markAllRead();
    } finally {
      setMarkingAll(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, pb: 10 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ color: "text.primary" }}>
          Notifications
        </Typography>
        {items.length > 0 && hasUnread && (
          <Button
            size="small"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            sx={{
              textTransform: "none",
              fontWeight: 800,
              color: "primary.main",
              "&:hover": { bgcolor: "primary.lighter" },
            }}
          >
            {markingAll ? "Marking..." : "Mark all as read"}
          </Button>
        )}
      </Stack>

      {items.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 2,
            textAlign: "center",
            bgcolor: "white",
            borderRadius: "16px",
            border: "1px dashed",
            borderColor: "grey.200",
            mt: 2,
          }}
        >
          <NotificationsNone sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="subtitle1" fontWeight="bold" color="text.secondary">
            All caught up!
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5, maxWidth: 260 }}>
            You have no notifications at this moment.
          </Typography>
        </Box>
      ) : (
        <>
          <NotificationsList items={items} onAcknowledge={acknowledge} />

          {/* IntersectionObserver sentinel — triggers loadMore automatically */}
          <Box ref={sentinelRef} sx={{ height: 4, mt: 2 }} />

          {/* Loading indicator when fetching next page */}
          {loadingMore && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {/* End-of-feed message */}
          {!hasMore && items.length > 0 && (
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ display: "block", textAlign: "center", mt: 3, pb: 2, fontWeight: 600 }}
            >
              You're all caught up ✓
            </Typography>
          )}
        </>
      )}

      {canCreate && (
        <>
          <Box sx={{ position: "fixed", bottom: 80, right: 16, zIndex: 1000 }}>
            <Fab
              color="primary"
              onClick={() => setShowCreate(true)}
              sx={{ boxShadow: "0 4px 14px rgba(25, 118, 210, 0.4)" }}
            >
              <Add />
            </Fab>
          </Box>

          <CreateNotificationDialog
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
