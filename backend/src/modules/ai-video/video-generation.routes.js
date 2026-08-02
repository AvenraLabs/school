import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { requireModuleEnabled } from "../../shared/middlewares/requireModule.js";
import { validate } from "../../shared/middlewares/validate.js";
import { createVideoGenerationSchema } from "./video-generation.schema.js";
import {
  createVideoGeneration,
  getVideoGenerationStatus,
  getTeacherVideos,
  getStudentClassVideos,
  deleteVideoGeneration,
  streamVideo,
} from "./video-generation.controller.js";

const router = Router();

// Allow public streaming of generated video assets (HTML5 video tags don't send auth headers)
router.get("/stream/:id", streamVideo);

router.use(protect);
router.use(requireModuleEnabled("ai_video"));

router.post("/", validate(createVideoGenerationSchema), createVideoGeneration);
router.get("/teacher/my-videos", getTeacherVideos);
router.get("/student/class-videos", getStudentClassVideos);
router.get("/:id", getVideoGenerationStatus);
router.delete("/:id", deleteVideoGeneration);

export default router;
