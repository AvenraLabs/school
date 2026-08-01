import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { requireModuleEnabled } from "../../shared/middlewares/requireModule.js";
import {
  createVideoGeneration,
  getVideoGenerationStatus,
  getTeacherVideos,
  getStudentClassVideos,
  deleteVideoGeneration,
} from "./video-generation.controller.js";

const router = Router();

router.use(protect);
router.use(requireModuleEnabled("ai_video"));

router.post("/", createVideoGeneration);
router.get("/teacher/my-videos", getTeacherVideos);
router.get("/student/class-videos", getStudentClassVideos);
router.get("/:id", getVideoGenerationStatus);
router.delete("/:id", deleteVideoGeneration);

export default router;
