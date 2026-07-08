import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import {
  createFeedback,
  listAllFeedbacks,
  updateFeedbackStatus,
} from "./feedback.service.js";

export const submitFeedback = asyncHandler(async (req, res) => {
  const feedback = await createFeedback({
    school_id: req.user.school_id,
    user_id: req.user.id,
    role: req.user.role,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    data: feedback,
  });
});

export const getFeedbacks = asyncHandler(async (req, res) => {
  const status = req.query.status;
  const category = req.query.category;
  const search = req.query.search;
  const limit = req.query.limit ? parseInt(req.query.limit) : 20;
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;

  const result = await listAllFeedbacks({
    status,
    category,
    search,
    limit,
    offset,
  });

  res.json({
    success: true,
    data: result.items,
    total: result.total,
  });
});

export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const feedback = await updateFeedbackStatus(req.params.id, status);
  
  if (!feedback) {
    throw new AppError("Feedback not found", 404);
  }

  res.json({
    success: true,
    data: feedback,
  });
});
