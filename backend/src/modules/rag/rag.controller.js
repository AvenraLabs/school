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

  const targetBoard = String(board || "CBSE").toUpperCase().trim();

  const rows = await TextbookChapter.findAll({
    attributes: ["subject"],
    where: {
      board: targetBoard,
      grade: parseInt(String(grade).replace(/\D/g, ""), 10),
    },
    group: ["subject"],
    order: [["subject", "ASC"]],
    raw: true,
  });

  const subjects = rows.map((r) => r.subject);
  res.json({ subjects, board: targetBoard });
});

/**
 * GET /api/rag/curriculum/chapters?board=CBSE&grade=6&subject=Science
 * Returns all chapters for board + grade + subject, sorted by chapter_number.
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

  const targetBoard = String(board || "CBSE").toUpperCase().trim();

  const rows = await TextbookChapter.findAll({
    attributes: ["chapter_number", "chapter_title"],
    where: {
      board: targetBoard,
      grade: parseInt(String(grade).replace(/\D/g, ""), 10),
      subject: String(subject).trim(),
    },
    order: [["chapter_number", "ASC"]],
    raw: true,
  });

  const seenKeys = new Set();
  const chapters = [];

  for (const r of rows) {
    const rawTitle = String(r.chapter_title || "").trim();
    const cleanTitle = rawTitle
      .replace(/^(chapter|unit|chap|ch)\s*\d+[:\s\-\.]*/i, "")
      .trim() || rawTitle || `Chapter ${r.chapter_number}`;

    const dedupKey = `${r.chapter_number}_${cleanTitle.toLowerCase()}`;
    const titleKey = cleanTitle.toLowerCase();

    // Deduplicate by chapter number AND title
    if (!seenKeys.has(dedupKey) && !seenKeys.has(titleKey)) {
      seenKeys.add(dedupKey);
      seenKeys.add(titleKey);
      chapters.push({
        number: r.chapter_number,
        title: cleanTitle,
        label: cleanTitle,
      });
    }
  }

  res.json({ chapters, board: targetBoard });
});

/**
 * GET /api/rag/curriculum/grades?board=CBSE
 * Returns distinct grades that have at least one ingested book for the board.
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

  const targetBoard = String(board || "CBSE").toUpperCase().trim();

  const rows = await TextbookChapter.findAll({
    attributes: ["grade"],
    where: {
      board: targetBoard,
    },
    group: ["grade"],
    order: [["grade", "ASC"]],
    raw: true,
  });

  const grades = rows.map((r) => r.grade);
  res.json({ grades, board: targetBoard });
});

