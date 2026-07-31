import express from "express";
import {
  getReadinessCheck,
  runTimetableGeneration,
  getGenerationJobStatus,
  confirmTimetableGeneration,
} from "./timetable-generation.controller.js";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";

const router = express.Router();

router.use(protect);

router.get(
  "/readiness",
  allowRoles("school_admin", "teacher"),
  getReadinessCheck
);

router.post(
  "/run",
  allowRoles("school_admin"),
  runTimetableGeneration
);

router.get(
  "/:jobId",
  allowRoles("school_admin", "teacher"),
  getGenerationJobStatus
);

router.post(
  "/:jobId/confirm",
  allowRoles("school_admin"),
  confirmTimetableGeneration
);

export default router;
