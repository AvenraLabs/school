import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import {
  getStudentAnalytics,
  getClassAnalytics,
  getSchoolAnalytics,
} from "./analytics.controller.js";

const router = express.Router();

router.use(protect);

router.get(
  "/student",
  allowRoles("student", "teacher", "school_admin", "parent"),
  getStudentAnalytics
);
router.get(
  "/teacher/class",
  allowRoles("teacher", "school_admin"),
  getClassAnalytics
);
router.get(
  "/school",
  allowRoles("school_admin"),
  getSchoolAnalytics
);

export default router;
