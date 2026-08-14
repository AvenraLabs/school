import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import {
  processStudentChatMessage,
  getStudentChatSessions,
  getStudentChatMessages,
  deleteStudentChatSession,
  ingestAllBooks,
} from "./rag.service.js";
import {
  getAvailableSubjects,
  getAvailableChapters,
  getAvailableGrades,
  invalidateCurriculumCache,
} from "./curriculum-cache.service.js";

// Student Chat API
export const sendChatMessage = asyncHandler(async (req, res) => {
  const { question, sessionId } = req.body;
  if (!question) {
    throw new AppError("Question is required", 400);
  }

  const result = await processStudentChatMessage({
    userId: req.user.id,
    schoolId: req.user.school_id,
    sessionId,
    question,
  });

  res.json(result);
});

// Student Chat API (Streaming SSE Token Response)
export const sendChatMessageStream = asyncHandler(async (req, res) => {
  const { question, sessionId } = req.body;
  if (!question) {
    throw new AppError("Question is required", 400);
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const result = await processStudentChatMessage({
    userId: req.user.id,
    schoolId: req.user.school_id,
    sessionId,
    question,
    onChunk: (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    },
  });

  res.write(`data: ${JSON.stringify({ done: true, meta: result })}\n\n`);
  res.end();
});

// List Chat Sessions
export const listChatSessions = asyncHandler(async (req, res) => {
  const sessions = await getStudentChatSessions(req.user.id);
  res.json({ sessions });
});

// Get Chat Session Messages
export const getSessionMessages = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const messages = await getStudentChatMessages(sessionId, req.user.id);
  res.json({ messages });
});

// Delete Chat Session
export const deleteSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const result = await deleteStudentChatSession(sessionId, req.user.id);
  res.json(result);
});

// Trigger RAG Ingestion (Admin only)
export const triggerIngestion = asyncHandler(async (req, res) => {
  if (req.user.role !== "super_admin" && req.user.role !== "school_admin") {
    throw new AppError("Forbidden", 403);
  }

  // Trigger ingestion asynchronously and invalidate cache
  ingestAllBooks()
    .then(() => invalidateCurriculumCache())
    .catch((err) => console.error("RAG Ingestion error:", err));

  res.json({ message: "Textbook RAG ingestion pipeline started in background." });
});

// Teacher AI Tools Generation
export const runTeacherAiContent = asyncHandler(async (req, res) => {
  const { generateTeacherAiContent } = await import("./runtime/teacherAi.service.js");
  const result = await generateTeacherAiContent({
    user: req.user,
    ...req.body,
  });
  res.json(result);
});

// ─────────────────────────────────────────────────
//  CURRICULUM METADATA ENDPOINTS (Direct from ChromaDB)
// ─────────────────────────────────────────────────

/**
 * GET /api/rag/curriculum/subjects?board=CBSE&grade=6
 * Returns distinct subjects ingested in ChromaDB for the given board + grade.
 */
export const getCurriculumSubjects = asyncHandler(async (req, res) => {
  let { board, grade } = req.query;
  if (!grade) {
    throw new AppError("grade is required", 400);
  }

  if (req.user?.school_id) {
    const School = (await import("../schools/school.model.js")).default;
    const school = await School.findByPk(req.user.school_id);
    if (school?.board) {
      board = school.board;
    }
  }

  const rawBoard = String(board || "").toUpperCase().trim();
  const targetBoard = (!rawBoard || rawBoard === "1" || rawBoard.includes("CBSE")) ? "CBSE" : rawBoard;
  const gradeNum = String(grade).replace(/\D/g, "") || "6";

  const subjects = await getAvailableSubjects(targetBoard, gradeNum);
  res.json({ subjects, board: targetBoard });
});

/**
 * GET /api/rag/curriculum/chapters?board=CBSE&grade=6&subject=Science
 * Returns all chapters in ChromaDB for board + grade + subject.
 */
export const getCurriculumChapters = asyncHandler(async (req, res) => {
  let { board, grade, subject } = req.query;
  if (!grade || !subject) {
    throw new AppError("grade and subject are required", 400);
  }

  if (req.user?.school_id) {
    const School = (await import("../schools/school.model.js")).default;
    const school = await School.findByPk(req.user.school_id);
    if (school?.board) {
      board = school.board;
    }
  }

  const rawBoard = String(board || "").toUpperCase().trim();
  const targetBoard = (!rawBoard || rawBoard === "1" || rawBoard.includes("CBSE")) ? "CBSE" : rawBoard;
  const gradeNum = String(grade).replace(/\D/g, "") || "6";

  const chapters = await getAvailableChapters(targetBoard, gradeNum, subject);
  res.json({ chapters, board: targetBoard });
});

/**
 * GET /api/rag/curriculum/grades?board=CBSE
 * Returns distinct grades that have ingested books in ChromaDB.
 */
export const getCurriculumGrades = asyncHandler(async (req, res) => {
  let { board } = req.query;

  if (req.user?.school_id) {
    const School = (await import("../schools/school.model.js")).default;
    const school = await School.findByPk(req.user.school_id);
    if (school?.board) {
      board = school.board;
    }
  }

  const rawBoard = String(board || "").toUpperCase().trim();
  const targetBoard = (!rawBoard || rawBoard === "1" || rawBoard.includes("CBSE")) ? "CBSE" : rawBoard;

  const grades = await getAvailableGrades(targetBoard);
  res.json({ grades, board: targetBoard });
});

