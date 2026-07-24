import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import { Op } from "sequelize";
import TextbookChapter from "./models/textbook-chapter.model.js";
import {
  processStudentChatMessage,
  getStudentChatSessions,
  getStudentChatMessages,
  deleteStudentChatSession,
  ingestAllBooks,
} from "./rag.service.js";

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

  // Trigger ingestion asynchronously
  ingestAllBooks().catch((err) => console.error("RAG Ingestion error:", err));

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
//  CURRICULUM METADATA ENDPOINTS
//  Power the Teacher AI Tools dropdowns from PostgreSQL.
//  Fast — no ChromaDB calls.
// ─────────────────────────────────────────────────

/**
 * GET /api/rag/curriculum/subjects?board=CBSE&grade=6
 * Returns distinct subjects ingested for the given board + grade.
 */
export const getCurriculumSubjects = asyncHandler(async (req, res) => {
  const { board, grade } = req.query;
  if (!board || !grade) {
    throw new AppError("board and grade are required", 400);
  }

  const rows = await TextbookChapter.findAll({
    attributes: ["subject"],
    where: {
      board: String(board).toUpperCase().trim(),
      grade: parseInt(String(grade).replace(/\D/g, ""), 10),
    },
    group: ["subject"],
    order: [["subject", "ASC"]],
    raw: true,
  });

  const subjects = rows.map((r) => r.subject);
  res.json({ subjects });
});

/**
 * GET /api/rag/curriculum/chapters?board=CBSE&grade=6&subject=Science
 * Returns all chapters for board + grade + subject, sorted by chapter_number.
 */
export const getCurriculumChapters = asyncHandler(async (req, res) => {
  const { board, grade, subject } = req.query;
  if (!board || !grade || !subject) {
    throw new AppError("board, grade and subject are required", 400);
  }

  const rows = await TextbookChapter.findAll({
    attributes: ["chapter_number", "chapter_title"],
    where: {
      board: String(board).toUpperCase().trim(),
      grade: parseInt(String(grade).replace(/\D/g, ""), 10),
      subject: String(subject).trim(),
    },
    order: [["chapter_number", "ASC"]],
    raw: true,
  });

  const chapters = rows.map((r) => ({
    number: r.chapter_number,
    title: r.chapter_title,
    label: `Chapter ${r.chapter_number}: ${r.chapter_title}`,
  }));

  res.json({ chapters });
});

/**
 * GET /api/rag/curriculum/grades?board=CBSE
 * Returns distinct grades that have at least one ingested book for the board.
 */
export const getCurriculumGrades = asyncHandler(async (req, res) => {
  const { board } = req.query;
  if (!board) {
    throw new AppError("board is required", 400);
  }

  const rows = await TextbookChapter.findAll({
    attributes: ["grade"],
    where: {
      board: String(board).toUpperCase().trim(),
    },
    group: ["grade"],
    order: [["grade", "ASC"]],
    raw: true,
  });

  const grades = rows.map((r) => r.grade);
  res.json({ grades });
});

