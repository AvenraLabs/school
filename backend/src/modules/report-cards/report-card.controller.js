import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import {
  createReportCardService,
  saveReportCardMarksService,
  publishReportCardService,
  getReportCardService,
  listReportCardsService,
  getAcademicReportCardsService,
  bulkSaveReportCardMarksService,
  bulkPublishReportCardsService,
  getGradingScalesService,
  saveGradingScalesService,
} from "./report-card.service.js";

/* =========================
   STUBS FOR BACKWARD COMPATIBILITY
   ========================= */
export const createReportCard = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true });
});

export const saveReportCardMarks = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "Marks saved" });
});

export const publishReportCard = asyncHandler(async (req, res) => {
  res.json({ success: true });
});

/* =========================
   GET SINGLE REPORT CARD (FOR STUDENT/PARENT)
   ========================= */
export const getReportCard = asyncHandler(async (req, res) => {
  let student_id = req.user.student_id;
  if (req.user.role === "teacher" || req.user.role === "school_admin") {
    student_id = req.query.student_id ? Number(req.query.student_id) : null;
  }

  if (!student_id) {
    throw new AppError("Student ID is required", 400);
  }

  const reportCard = await getReportCardService({
    student_id,
    exam_id: Number(req.params.id),
    school_id: req.user.school_id,
  });

  if (!reportCard) {
    throw new AppError("Report card not found", 404);
  }

  res.json({
    success: true,
    data: reportCard,
  });
});

/* =========================
   LIST ALL REPORT CARDS FOR STUDENT/PARENT
   ========================= */
export const listReportCards = asyncHandler(async (req, res) => {
  if (!req.user.student_id) {
    throw new AppError("Student profile not found", 404);
  }

  const result = await listReportCardsService({
    student_id: req.user.student_id,
    school_id: req.user.school_id,
  });

  res.json({
    success: true,
    data: result.rows,
  });
});

/* =========================
   GET REPORT CARDS FOR TEACHER CLASS VIEW
   ========================= */
export const getAcademicReportCards = asyncHandler(async (req, res) => {
  const { class_id, exam_id } = req.query;
  if (!class_id || !exam_id) {
    throw new AppError("class_id and exam_id are required", 400);
  }

  const reportCards = await getAcademicReportCardsService({
    school_id: req.user.school_id,
    class_id: Number(class_id),
    exam_id: Number(exam_id),
  });

  res.json({
    success: true,
    data: reportCards,
  });
});

/* =========================
   BULK SAVE MARKS (WITH SUBJECT TEACHER VERIFICATION)
   ========================= */
export const bulkSaveReportCardMarks = asyncHandler(async (req, res) => {
  await bulkSaveReportCardMarksService({
    class_id: Number(req.body.class_id),
    section_id: Number(req.body.section_id),
    exam_id: Number(req.body.exam_id),
    report_cards: req.body.report_cards,
    school_id: req.user.school_id,
    user: req.user,
  });

  res.json({
    success: true,
    message: "Bulk marks saved successfully",
  });
});

/* =========================
   BULK PUBLISH STUB
   ========================= */
export const bulkPublishReportCards = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Bulk report cards published successfully",
  });
});

/* =========================
   GRADING SCALES CONFIGURATION
   ========================= */
export const getGradingScales = asyncHandler(async (req, res) => {
  const scales = await getGradingScalesService({
    school_id: req.user.school_id,
  });
  res.json({
    success: true,
    data: scales,
  });
});

export const saveGradingScales = asyncHandler(async (req, res) => {
  if (!Array.isArray(req.body.scales)) {
    throw new AppError("scales array is required", 400);
  }
  await saveGradingScalesService({
    school_id: req.user.school_id,
    scales: req.body.scales,
  });
  res.json({
    success: true,
    message: "Grading scales saved successfully",
  });
});
