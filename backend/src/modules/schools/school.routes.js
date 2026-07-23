import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { validate } from "../../shared/middlewares/validate.js";

import {
  getActiveSchool,
  getSchoolStats,
  updateSchoolStatus,
  updateSchoolAdminStatus,
  resetSchoolAdminPassword,
  updateSchool,
  updateSchoolSettings,
  deleteStudent,
  deleteSectionStudents,
} from "./school.controller.js";

import {
  getSchoolDirectory,
  getSectionRoster,
  getStudentProfile,
  getStudentAttendanceLogs,
  getDashboardStats,
} from "./school.directory.controller.js";

import {
  updateSchoolStatusSchema,
  updateSchoolAdminStatusSchema,
  resetSchoolAdminPasswordSchema,
  updateSchoolSchema,
} from "./school.schema.js";

const router = express.Router();

// Directory endpoints for school admins, super admins, and teachers
router.get("/directory", protect, allowRoles("school_admin", "super_admin", "teacher"), getSchoolDirectory);
router.get("/directory/sections/:sectionId", protect, allowRoles("school_admin", "super_admin", "teacher"), getSectionRoster);

router.get("/directory/students/:studentId", protect, allowRoles("school_admin", "super_admin", "teacher"), getStudentProfile);
router.get("/directory/students/:studentId/attendance-logs", protect, allowRoles("school_admin", "super_admin", "teacher"), getStudentAttendanceLogs);
router.get("/dashboard-stats", protect, allowRoles("school_admin", "super_admin"), getDashboardStats);
router.patch("/my-settings", protect, allowRoles("school_admin"), updateSchoolSettings);

router.use(protect, allowRoles("super_admin"));

router.get("/", getActiveSchool);
router.get("/:id/stats", getSchoolStats);
router.patch("/:id/status", validate(updateSchoolStatusSchema), updateSchoolStatus);
router.patch(
  "/:id/admin-status",
  validate(updateSchoolAdminStatusSchema),
  updateSchoolAdminStatus
);
router.patch(
  "/:id/admin-reset-password",
  validate(resetSchoolAdminPasswordSchema),
  resetSchoolAdminPassword
);
router.patch(
  "/:id",
  validate(updateSchoolSchema),
  updateSchool
);

router.delete("/super-admin/students/:studentId", deleteStudent);
router.delete("/super-admin/sections/:sectionId/students", deleteSectionStudents);

export default router;
