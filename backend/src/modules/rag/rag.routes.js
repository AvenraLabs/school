import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { requireModuleEnabled } from "../../shared/middlewares/requireModule.js";
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
router.post("/chat", requireModuleEnabled("ai_tutor"), sendChatMessage);
router.post("/chat/stream", requireModuleEnabled("ai_tutor"), sendChatMessageStream);
router.get("/chat/sessions", requireModuleEnabled("ai_tutor"), listChatSessions);
router.get("/chat/sessions/:sessionId", requireModuleEnabled("ai_tutor"), getSessionMessages);
router.delete("/chat/sessions/:sessionId", requireModuleEnabled("ai_tutor"), deleteSession);

// Teacher AI Tools Generation Route
router.post("/teacher-ai", allowRoles("teacher", "school_admin", "super_admin"), requireModuleEnabled("ai_tools"), runTeacherAiContent);

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

