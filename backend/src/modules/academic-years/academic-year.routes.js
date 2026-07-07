import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import {
  listAcademicYears,
  createAcademicYear,
  setCurrentAcademicYear,
  getPromotionPreview,
  promoteAcademicYear,
} from "./academic-year.controller.js";

const router = Router();

// Protect all routes under academic-years, allowing only admins
router.use(protect, allowRoles("school_admin", "super_admin"));

router.get("/", listAcademicYears);
router.post("/", createAcademicYear);
router.patch("/:id/current", setCurrentAcademicYear);
router.post("/preview", getPromotionPreview);
router.post("/promote", promoteAcademicYear);

export default router;
