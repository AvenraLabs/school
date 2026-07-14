import {
  Box,
  Container,
  Typography,
  Tab,
  Tabs,
  Stack,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Grid,
  Skeleton,
  Alert,
} from "@mui/material";
import {
  Add,
  Search,
  Close,
  PhotoCamera,
  CameraAlt,
  DeleteOutline,
  CheckCircleOutline,
  HelpOutline,
  Info,
} from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import {
  getLostFoundItems,
  getMyLostFoundItems,
  createLostFoundItem,
  closeLostFoundItem,
  deleteLostFoundItem,
} from "./lost-found.api";
import { processImageForUpload } from "../../utils/imageUtils";
import cloudStorageService from "../../services/cloudStorage";
import { getAssetUrl } from "../../utils/asset";
import ConfirmationDialog from "../../components/ConfirmationDialog";

export default function LostFoundPage() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0); // 0 = Open, 1 = My Posts, 2 = Closed
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // all, lost, found
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const LIMIT = 10;

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("lost");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    // Reset when tab or filter changes
    setOffset(0);
    setItems([]);
  }, [tabValue, typeFilter]);

  // Triggered on mount, tab/filter change (offset=0 reset), or explicit search
  useEffect(() => {
    loadItems(true);
  }, [tabValue, typeFilter, offset]);

  async function loadItems(replace = false) {
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);
    try {
      let res;
      if (tabValue === 0) {
        const typeParam = typeFilter === "all" ? "" : typeFilter;
        res = await getLostFoundItems("OPEN", typeParam, search, LIMIT, offset);
      } else if (tabValue === 1) {
        res = await getMyLostFoundItems(LIMIT, offset);
      } else {
        const typeParam = typeFilter === "all" ? "" : typeFilter;
        res = await getLostFoundItems("CLOSED", typeParam, search, LIMIT, offset);
      }
      const newItems = res.data?.data || res.data || [];
      const total = res.data?.total || 0;
      setItems((prev) => (offset === 0 ? newItems : [...prev, ...newItems]));
      setHasMore(offset + LIMIT < total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const refreshList = () => {
    if (offset === 0) {
      loadItems(true);
    } else {
      setOffset(0);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    refreshList();
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (photos.length + files.length > 2) {
      setFormError("Maximum 2 photos allowed");
      return;
    }

    setFormError("");
    try {
      const processed = await Promise.all(
        files.map((file) =>
          processImageForUpload(file, {
            validation: { maxSizeInMB: 3 },
            compression: { maxWidth: 600, maxHeight: 600, quality: 0.7 }
          })
        )
      );

      const uploadResults = await Promise.all(
        processed.map((p) => cloudStorageService.uploadImage(p, { type: "announcement" }))
      );

      const urls = uploadResults.map((r) => r.url);
      setPhotos((prev) => [...prev, ...urls]);
    } catch (err) {
      setFormError(err.message || "Failed to upload image");
    }
    e.target.value = "";
  };

  const removePhoto = async (index) => {
    const targetUrl = photos[index];
    if (targetUrl) {
      await cloudStorageService.deleteImage(targetUrl);
    }
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Title is required");
      return;
    }
    setFormError("");
    setSubmitting(true);

    try {
      await createLostFoundItem({
        title,
        type,
        date,
        description,
        photos,
      });
      setOpenDialog(false);
      resetForm();
      refreshList();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit post");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setType("lost");
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setPhotos([]);
    setFormError("");
  };
  // Confirmation Dialog States
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [closeItemId, setCloseItemId] = useState(null);
  const [closeLoading, setCloseLoading] = useState(false);

  const handleCloseItem = (id) => {
    setCloseItemId(id);
    setConfirmCloseOpen(true);
  };

  const handleConfirmClose = async () => {
    if (!closeItemId) return;
    setCloseLoading(true);
    try {
      await closeLostFoundItem(closeItemId);
      setConfirmCloseOpen(false);
      setCloseItemId(null);
      refreshList();
    } catch (err) {
      console.error(err);
    } finally {
      setCloseLoading(false);
    }
  };

  const handleDeleteItem = (id) => {
    setDeleteItemId(id);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteItemId) return;
    setDeleteLoading(true);
    try {
      await deleteLostFoundItem(deleteItemId);
      setConfirmDeleteOpen(false);
      setDeleteItemId(null);
      refreshList();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 10 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="900" sx={{ fontFamily: "'Outfit', sans-serif" }}>
          Lost & Found
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          sx={{ borderRadius: "24px", px: 2, textTransform: "none", fontWeight: 700 }}
        >
          Create
        </Button>
      </Stack>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, val) => setTabValue(val)}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Open Items" sx={{ fontWeight: 700, textTransform: "none" }} />
          <Tab label="My Posts" sx={{ fontWeight: 700, textTransform: "none" }} />
          <Tab label="Closed" sx={{ fontWeight: 700, textTransform: "none" }} />
        </Tabs>
      </Box>

      {/* Search and Filter */}
      {tabValue !== 1 && (
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: "flex", gap: 1.5, mb: 3 }}>
          <TextField
            placeholder="Search items..."
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                bgcolor: "background.paper",
              },
            }}
          />
          <TextField
            select
            size="small"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{
              minWidth: 100,
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                bgcolor: "background.paper",
              },
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="lost">Lost</MenuItem>
            <MenuItem value="found">Found</MenuItem>
          </TextField>
          <Button
            type="submit"
            variant="outlined"
            sx={{ borderRadius: "12px", textTransform: "none", fontWeight: 700 }}
          >
            Search
          </Button>
        </Box>
      )}

      {/* Item List */}
      <Stack spacing={2}>
        {loading ? (
          Array.from(new Array(3)).map((_, i) => (
            <Card key={i} sx={{ borderRadius: "16px", p: 2 }}>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="40%" height={20} />
                  <Skeleton width="20%" height={15} />
                </Box>
              </Stack>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: "8px", mb: 2 }} />
              <Skeleton width="60%" height={15} />
            </Card>
          ))
        ) : items.length === 0 ? (
          <Box sx={{ textCenter: "center", py: 8, textAlign: "center" }}>
            <HelpOutline sx={{ fontSize: 64, color: "text.disabled", opacity: 0.5, mb: 2 }} />
            <Typography variant="subtitle1" fontWeight="700" color="text.secondary">
              No items found
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Be the first to list a lost or found item.
            </Typography>
          </Box>
        ) : (
          items.map((item) => {
            const isOwner = String(item.created_by) === String(user?.id);
            const isAdmin = ["school_admin", "super_admin"].includes(user?.role);
            return (
              <Card
                key={item.id}
                sx={{
                  borderRadius: "20px",
                  border: "1px solid rgba(0,0,0,0.05)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
                  overflow: "hidden",
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  {/* Top user profile section */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        src={getAssetUrl(item.Creator?.avatar_url)}
                        sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "14px", fontWeight: 700 }}
                      >
                        {item.Creator?.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="800" sx={{ lineHeight: 1.2 }}>
                          {item.Creator?.name || "Unknown User"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(() => {
                            const role = item.Creator?.role;
                            if (role === "student") {
                              const student = item.Creator?.student || item.Creator?.Student;
                              const className = student?.class?.class_name || student?.Class?.class_name || "";
                              const sectionName = student?.section?.name || student?.Section?.name || "";
                              return [className, sectionName].filter(Boolean).join("-") || "student";
                            } else if (role === "teacher") {
                              return "teacher";
                            } else {
                              return role?.replace(/_/g, " ") || "";
                            }
                          })()}
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      label={item.type === "lost" ? "LOST" : "FOUND"}
                      color={item.type === "lost" ? "error" : "success"}
                      size="small"
                      sx={{ fontWeight: 800, borderRadius: "6px" }}
                    />
                  </Stack>

                  {/* Title & Description */}
                  <Typography variant="h6" fontWeight="800" sx={{ mb: 1, letterSpacing: "-0.3px", fontSize: "1.1rem" }}>
                    {item.title}
                  </Typography>
                  {item.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: "pre-wrap" }}>
                      {item.description}
                    </Typography>
                  )}

                  {/* Date section */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mb: 2, color: "text.secondary" }}>
                    <Info sx={{ fontSize: 16 }} />
                    <Typography variant="caption" fontWeight="600">
                      {item.type === "lost" ? "Date Lost" : "Date Found"}: {new Date(item.date).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {/* Photos */}
                  {item.photos && item.photos.length > 0 && (
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                      {item.photos.map((p, idx) => (
                        <Grid item xs={item.photos.length === 1 ? 12 : 6} key={idx}>
                          <Box
                            component="img"
                            src={getAssetUrl(p)}
                            alt=""
                            sx={{
                              width: "100%",
                              height: 160,
                              objectFit: "cover",
                              borderRadius: "12px",
                              border: "1px solid rgba(0,0,0,0.06)",
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {/* Actions */}
                  {item.status === "OPEN" ? (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {(isOwner || isAdmin) && (
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircleOutline />}
                          onClick={() => handleCloseItem(item.id)}
                          sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 700 }}
                        >
                          Mark Closed
                        </Button>
                      )}
                      {(isOwner || isAdmin) && (
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteItem(item.id)}
                          sx={{ border: "1px solid", borderColor: "error.light", borderRadius: "8px", p: 0.6 }}
                        >
                          <DeleteOutline />
                        </IconButton>
                      )}
                    </Stack>
                  ) : (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Chip label="CLOSED / SOLVED" size="small" variant="outlined" sx={{ fontWeight: 800 }} />
                      {(isOwner || isAdmin) && (
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteItem(item.id)}
                          sx={{ border: "1px solid", borderColor: "error.light", borderRadius: "8px", p: 0.6 }}
                        >
                          <DeleteOutline />
                        </IconButton>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </Stack>

      {/* Load More Button */}
      {hasMore && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setOffset((prev) => prev + LIMIT)}
            disabled={loadingMore}
            sx={{
              borderRadius: "24px",
              px: 4,
              textTransform: "none",
              fontWeight: 700,
              borderColor: "primary.main",
            }}
          >
            {loadingMore ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
            {loadingMore ? "Loading..." : "Load More"}
          </Button>
        </Box>
      )}


      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 900 }}>
          Create Post
          <IconButton onClick={() => setOpenDialog(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Item Title"
              size="small"
              required
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blue water bottle, Math textbook"
            />
            <TextField
              select
              label="Post Type"
              size="small"
              fullWidth
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <MenuItem value="lost">Lost Item</MenuItem>
              <MenuItem value="found">Found Item</MenuItem>
            </TextField>
            <TextField
              label="Date Lost/Found"
              type="date"
              size="small"
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Description / Details"
              multiline
              rows={3}
              size="small"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Left in science lab. Has a spider-man sticker."
            />

            {/* Photo Attachment Component */}
            <Box>
              <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Photos (Max 2)
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {photos.map((p, idx) => (
                  <Box key={idx} sx={{ position: "relative", width: 64, height: 64 }}>
                    <Box
                      component="img"
                      src={getAssetUrl(p)}
                      alt=""
                      sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                    />
                    <IconButton
                      onClick={() => removePhoto(idx)}
                      size="small"
                      sx={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        bgcolor: "error.main",
                        color: "white",
                        p: 0.25,
                        "&:hover": { bgcolor: "error.dark" }
                      }}
                    >
                      <Close sx={{ fontSize: 12 }} />
                    </IconButton>
                  </Box>
                ))}
                {photos.length < 2 && (
                  <Button
                    variant="outlined"
                    component="label"
                    title="Upload Photo / Take Picture"
                    sx={{ width: 64, height: 64, borderRadius: "8px", border: "1px dashed rgba(0,0,0,0.2)", p: 0 }}
                  >
                    <PhotoCamera />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </Button>
                )}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Posting..." : "Create Post"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Post"
        description="Are you sure you want to permanently delete this post? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
        loading={deleteLoading}
      />

      <ConfirmationDialog
        open={confirmCloseOpen}
        onClose={() => setConfirmCloseOpen(false)}
        onConfirm={handleConfirmClose}
        title="Close Post"
        description="Are you sure you want to mark this item as closed/solved?"
        confirmText="Close Post"
        cancelText="Cancel"
        severity="warning"
        loading={closeLoading}
      />
    </Container>
  );
}
