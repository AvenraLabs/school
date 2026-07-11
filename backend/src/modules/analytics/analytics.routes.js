import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { getStudentAnalytics, getClassAnalytics } from "./analytics.controller.js";

const router = express.Router();

router.use(protect);

router.get("/student", allowRoles("student", "teacher", "school_admin"), getStudentAnalytics);
router.get("/teacher/class", allowRoles("teacher", "school_admin"), getClassAnalytics);

export default router;
