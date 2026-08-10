import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import {
  sendChatMessage,
  sendChatMessageStream,
  listChatSessions,
  getSessionMessages,
  deleteSession,
  triggerIngestion,
  runTeacherAiContent,
  getCurriculumSubjects,
  getCurriculumChapters,
  getCurriculumGrades,
} from "./rag.controller.js";

const router = Router();

router.use(protect);

// Student AI Chat Routes
router.post("/chat", sendChatMessage);
router.post("/chat/stream", sendChatMessageStream);
router.get("/chat/sessions", listChatSessions);
router.get("/chat/sessions/:sessionId", getSessionMessages);
router.delete("/chat/sessions/:sessionId", deleteSession);

// Teacher AI Tools Generation Route
router.post("/teacher-ai", allowRoles("teacher", "school_admin", "super_admin"), runTeacherAiContent);

// Admin RAG Ingestion Route
router.post("/ingest", allowRoles("school_admin", "super_admin"), triggerIngestion);

// ─── Curriculum Metadata (powers Teacher AI dropdowns) ───
// Returns data from PostgreSQL only — fast, no ChromaDB
router.get(
  "/curriculum/subjects",
  allowRoles("teacher", "school_admin", "super_admin"),
  getCurriculumSubjects
);
router.get(
  "/curriculum/chapters",
  allowRoles("teacher", "school_admin", "super_admin"),
  getCurriculumChapters
);
router.get(
  "/curriculum/grades",
  allowRoles("teacher", "school_admin", "super_admin"),
  getCurriculumGrades
);

export default router;

