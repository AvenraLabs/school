import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { validate } from "../../shared/middlewares/validate.js";

import {
  markAttendanceSchema,
  attendanceSummarySchema,
  dailyAttendanceQuerySchema,
} from "./attendance.summary.schema.js";

import {
  markAttendance,
  sendAbsentWhatsApp,
  getDailyAttendance,
  getTeacherAttendanceSummary,
  getStudentAttendanceSummary,
} from "./attendance.summary.controller.js";

const router = express.Router();

/* =========================
   TEACHER / ADMIN
========================= */
router.post(
  "/teachers/attendance",
  protect,
  allowRoles("teacher", "school_admin"),
  validate(markAttendanceSchema),
  markAttendance
);

router.post(
  "/teachers/attendance/send-absent-whatsapp",
  protect,
  allowRoles("teacher", "school_admin"),
  sendAbsentWhatsApp
);

router.get(
  "/teachers/attendance/daily",
  protect,
  allowRoles("teacher", "school_admin"),
  validate(dailyAttendanceQuerySchema),
  getDailyAttendance
);

router.get(
  "/teachers/attendance/summary",
  protect,
  allowRoles("teacher", "school_admin"),
  validate(attendanceSummarySchema),
  getTeacherAttendanceSummary
);

/* =========================
   STUDENT
========================= */
router.get(
  "/students/attendance/summary",
  protect,
  allowRoles("student"),
  validate(attendanceSummarySchema),
  getStudentAttendanceSummary
);

export default router;
