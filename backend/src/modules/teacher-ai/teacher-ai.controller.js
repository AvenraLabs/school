import asyncHandler from "../../shared/asyncHandler.js";
import { runTeacherAI, getTeacherAiHistoryService } from "./teacher-ai.service.js";

export const teacherAiHandler = asyncHandler(async (req, res) => {
  const { aiType, payload } = req.body;

  if (!aiType || !payload) {
    return res.status(400).json({
      message: "aiType and payload are required",
    });
  }

  const result = await runTeacherAI({
    user: req.user,
    aiType,
    payload,
  });

  res.json({
    aiType,
    result,
  });
});

export const teacherAiHistoryHandler = asyncHandler(async (req, res) => {
  const history = await getTeacherAiHistoryService(req.user.id);
  res.json({
    success: true,
    history,
  });
});
