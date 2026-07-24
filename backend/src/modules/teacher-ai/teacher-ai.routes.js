import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import {
  generateTeacherAiContent,
  saveTeacherAiDocument,
  updateTeacherAiDocument,
  listTeacherAiDocuments,
  getTeacherAiDocument,
  deleteTeacherAiDocument,
} from "./teacher-ai.controller.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("teacher", "school_admin", "super_admin"));

// Generate routes
router.post("/generate", generateTeacherAiContent);
router.post("/teacher-ai/generate", generateTeacherAiContent);

// Document CRUD routes
router.post("/documents", saveTeacherAiDocument);
router.post("/teacher-ai/documents", saveTeacherAiDocument);

router.get("/documents", listTeacherAiDocuments);
router.get("/teacher-ai/documents", listTeacherAiDocuments);

router.get("/documents/:id", getTeacherAiDocument);
router.get("/teacher-ai/documents/:id", getTeacherAiDocument);

router.put("/documents/:id", updateTeacherAiDocument);
router.put("/teacher-ai/documents/:id", updateTeacherAiDocument);

router.delete("/documents/:id", deleteTeacherAiDocument);
router.delete("/teacher-ai/documents/:id", deleteTeacherAiDocument);

// Backward compatibility alias route
router.post("/teacher/ai", generateTeacherAiContent);

export default router;
