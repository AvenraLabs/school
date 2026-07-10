import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Alert,
  Snackbar,
} from "@mui/material";
import { Close, PhotoCamera } from "@mui/icons-material";
import { useState } from "react";
import { submitFeedbackApi } from "./feedback.api";
import { processImageForUpload } from "../../utils/imageUtils";
import cloudStorageService from "../../services/cloudStorage";
import { getAssetUrl } from "../../utils/asset";

// Simple User Agent parser to detect browser
function getBrowserInfo() {
  const ua = navigator.userAgent;
  let tem;
  let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return `IE ${tem[1] || ""}`;
  }
  if (M[1] === "Chrome") {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) return tem.slice(1).join(" ").replace("OPR", "Opera");
  }
  M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
  return M.join(" ");
}

export default function FeedbackPage() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("bug_report");
  const [description, setDescription] = useState("");
  const [screenshot, setScreenshot] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    try {
      const processed = await processImageForUpload(file, {
        validation: { maxSizeInMB: 3 },
        compression: { maxWidth: 800, maxHeight: 800, quality: 0.7 }
      });
      const uploadResult = await cloudStorageService.uploadImage(processed, { type: "announcement" });
      setScreenshot(uploadResult.url);
    } catch (err) {
      setError(err.message || "Failed to upload screenshot");
    }
  };

  const removeScreenshot = async () => {
    if (screenshot) {
      await cloudStorageService.deleteImage(screenshot);
    }
    setScreenshot("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Title and Description are required");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await submitFeedbackApi({
        title,
        category,
        description,
        screenshot_url: screenshot || undefined,
        browser: getBrowserInfo(),
        app_version: "1.3.0",
      });
      setSuccess(true);
      setTitle("");
      setCategory("bug_report");
      setDescription("");
      setScreenshot("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 3, pb: 10 }}>
      <Typography variant="h5" fontWeight="950" sx={{ fontFamily: "'Outfit', sans-serif", mb: 1 }}>
        Feedback
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Submit issues, feature requests, or suggestions directly to the platform developers.
      </Typography>

      <Card
        sx={{
          borderRadius: "20px",
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              label="Feedback Category"
              select
              size="small"
              required
              fullWidth
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="bug_report">Bug Report</MenuItem>
              <MenuItem value="feature_request">Feature Request</MenuItem>
              <MenuItem value="suggestion">Suggestion</MenuItem>
              <MenuItem value="complaint">Complaint</MenuItem>
              <MenuItem value="appreciation">Appreciation</MenuItem>
            </TextField>

            <TextField
              label="Subject Title"
              size="small"
              required
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Navigation bar wraps on small screen"
            />

            <TextField
              label="Description"
              required
              multiline
              rows={4}
              size="small"
              fullWidth
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of your feedback..."
            />

            {/* Screenshot Uploader */}
            <Box>
              <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Screenshot (Optional)
              </Typography>
              {screenshot ? (
                <Box sx={{ position: "relative", width: 120, height: 90 }}>
                  <Box
                    component="img"
                    src={getAssetUrl(screenshot)}
                    alt=""
                    sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)" }}
                  />
                  <IconButton
                    onClick={removeScreenshot}
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
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700, borderStyle: "dashed" }}
                >
                  Upload Screenshot
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleScreenshotUpload}
                  />
                </Button>
              )}
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ borderRadius: "24px", height: "48px", textTransform: "none", fontWeight: 700 }}
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={success}
        autoHideDuration={4000}
        onClose={() => setSuccess(false)}
        message="Thank you! Feedback submitted successfully."
      />
    </Container>
  );
}
