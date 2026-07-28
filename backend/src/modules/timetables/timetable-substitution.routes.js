import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import {
  getTeacherPeriodsForDate,
  getAvailableSubstitutes,
  saveSubstitutions,
  getTodaySubstitutions,
} from "./timetable-substitution.controller.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("school_admin", "super_admin"));

router.get("/teacher-periods", getTeacherPeriodsForDate);
router.get("/available-substitutes", getAvailableSubstitutes);
router.get("/today", getTodaySubstitutions);
router.post("/", saveSubstitutions);

export default router;
