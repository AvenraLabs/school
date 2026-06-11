import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { teacherAiHandler, teacherAiHistoryHandler } from "./teacher-ai.controller.js";

const router = express.Router();

router.post(
  "/teacher/ai",
  protect,
  allowRoles("teacher"),
  teacherAiHandler
);

router.get(
  "/teacher/ai/history",
  protect,
  allowRoles("teacher"),
  teacherAiHistoryHandler
);

export default router;
