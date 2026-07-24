import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { upload } from "../../shared/middlewares/upload.js";
import asyncHandler from "../../shared/asyncHandler.js";

const router = express.Router();

// Mount auth middleware for all uploads
router.use(protect);

router.post(
  "/avatar",
  upload.single("avatar"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const relativeUrl = `/uploads/avatars/${req.file.filename}`;
    res.json({
      success: true,
      url: relativeUrl,
      fileName: req.file.filename,
    });
  })
);

router.post(
  "/chat",
  upload.single("chat"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const relativeUrl = `/uploads/chat/${req.file.filename}`;
    res.json({
      success: true,
      url: relativeUrl,
      fileName: req.file.filename,
    });
  })
);

router.post(
  "/announcement",
  upload.single("announcement"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const relativeUrl = `/uploads/announcements/${req.file.filename}`;
    res.json({
      success: true,
      url: relativeUrl,
      fileName: req.file.filename,
    });
  })
);

router.post(
  "/book",
  upload.single("book"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const relativeUrl = `/uploads/books/${req.file.filename}`;
    res.json({
      success: true,
      url: relativeUrl,
      fileName: req.file.filename,
    });
  })
);

router.delete(
  "/file",
  asyncHandler(async (req, res) => {
    const { path: filePath } = req.query;
    if (filePath && filePath.startsWith("/uploads/")) {
      const { deleteLocalFile } = await import("../../shared/utils/fileCleanup.js");
      deleteLocalFile(filePath);
    }
    res.json({ success: true });
  })
);

export default router;
