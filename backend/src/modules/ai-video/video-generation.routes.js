import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.js";
import {
  createVideoGeneration,
  getVideoGenerationStatus,
  getTeacherVideos,
  getStudentClassVideos,
} from "./video-generation.controller.js";

const router = Router();

router.use(protect);

router.post("/", createVideoGeneration);
router.get("/teacher/my-videos", getTeacherVideos);
router.get("/student/class-videos", getStudentClassVideos);
router.get("/:id", getVideoGenerationStatus);

export default router;
