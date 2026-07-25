import StudentChatSession from "../models/student-chat-session.model.js";
import StudentChatMessage from "../models/student-chat-message.model.js";
import User from "../../users/user.model.js";
import School from "../../schools/school.model.js";
import Student from "../../students/student.model.js";
import Class from "../../classes/classes.model.js";
import AiChatLog from "../../ai-chat-logs/ai-chat-log.model.js";
import { deductTokens } from "../../tokens/token.service.js";

import { detectSubject } from "./detectSubject.js";
import { searchStudentChunks } from "./searchStudentChunks.js";
import { buildStudentRagPrompt, buildLanguageDirectPrompt, buildGeneralCurriculumPrompt } from "./buildPrompt.js";
import { generateAnswer } from "./generateAnswer.js";

/**
 * Normalizes class name (e.g. "Class 6 - A" -> "6", "Grade 10" -> "10")
 */
function normalizeGrade(className) {
  if (!className) return "6";
  const match = String(className).match(/\d+/);
  return match ? match[0] : "6";
}

/**
 * Handles student question sending in a chat session.
 * Manages chat session history, language bypass vs RAG routing, token usage, and persistence.
 */
export async function processStudentChatMessage({ userId, schoolId, sessionId, question }) {
  if (!question || !question.trim()) {
    throw new Error("Question is required");
  }

  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");

  // Fetch school for board configuration
  const school = await School.findByPk(schoolId || user.school_id);
  const board = school?.board || "CBSE";

  // Fetch student class for grade
  let grade = "6";
  const student = await Student.findOne({ where: { user_id: userId } });
  if (student && student.class_id) {
    const studentClass = await Class.findByPk(student.class_id);
    if (studentClass) {
      grade = normalizeGrade(studentClass.class_name);
    }
  }

  // Get or Create Chat Session
  let session = null;
  if (sessionId) {
    session = await StudentChatSession.findOne({
      where: { id: sessionId, student_id: userId, is_active: true },
    });
  }

  if (!session) {
    const titleSnippet = question.trim().slice(0, 30) + (question.length > 30 ? "..." : "");
    session = await StudentChatSession.create({
      student_id: userId,
      school_id: school.id,
      title: titleSnippet,
    });
  }

  // Step 1: Subject Detection & Intent Classification
  const { subject, isLanguage } = await detectSubject({ question, board, grade });

  // Update session subject if not set
  if (!session.subject) {
    session.subject = subject;
    await session.save();
  }

  // Record student user message in database
  await StudentChatMessage.create({
    session_id: session.id,
    sender: "user",
    content: question.trim(),
  });

  let answer = "";
  let sources = [];
  let tokensUsed = 0;
  let sourceType = "rag";

  const isCbsePrimary = String(board).toUpperCase() === "CBSE" && parseInt(String(grade), 10) < 6;

  if (isLanguage || isCbsePrimary) {
    // Language or CBSE Grades 1-5 Direct Gemini Route
    sourceType = isLanguage ? "direct_language" : "direct_primary_curriculum";
    const prompt = isLanguage
      ? buildLanguageDirectPrompt({ question, grade, subject })
      : buildGeneralCurriculumPrompt({ question, grade, subject, board });

    const res = await generateAnswer(prompt);
    answer = res.text;
    tokensUsed = res.tokensUsed;
  } else {
    // Core Subject Textbook RAG Route (Grades 6-12 Core)
    const { chunks, metadatas } = await searchStudentChunks({
      question,
      board,
      grade,
      subject,
      limit: 5,
    });

    if (!chunks || chunks.length === 0) {
      // Fallback to Direct Gemini if textbook chunks not found
      sourceType = "direct_curriculum_fallback";
      const prompt = buildGeneralCurriculumPrompt({ question, grade, subject, board });
      const res = await generateAnswer(prompt);
      answer = res.text;
      tokensUsed = res.tokensUsed;
    } else {
      const contextText = chunks.join("\n\n");
      const prompt = buildStudentRagPrompt({
        question,
        contextText,
        metadatas,
        grade,
        subject,
      });

      const res = await generateAnswer(prompt);
      answer = res.text;
      tokensUsed = res.tokensUsed;

      sources = Array.from(
        new Set(
          metadatas.map(
            (m) => `${m.chapterTitle || "Chapter " + m.chapter} (Pages ${m.pageStart}-${m.pageEnd})`
          )
        )
      );
    }
  }

  // Record assistant response message in database
  const assistantMsg = await StudentChatMessage.create({
    session_id: session.id,
    sender: "assistant",
    content: answer,
    sources,
    tokens_used: tokensUsed,
  });

  // Log usage & deduct tokens
  const log = await AiChatLog.create({
    user_id: userId,
    user_query: question,
    ai_response: answer,
    tokens_used: tokensUsed,
    model_used: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    ai_type: sourceType,
    class_level: grade,
  });

  if (tokensUsed > 0) {
    await deductTokens({
      userId,
      amount: tokensUsed,
      reason: "student_ai_chat",
      refId: log.id,
    });
  }

  return {
    sessionId: session.id,
    sessionTitle: session.title,
    message: assistantMsg,
    answer,
    sources,
    subject,
    sourceType,
  };
}

export async function getStudentChatSessions(userId) {
  return await StudentChatSession.findAll({
    where: { student_id: userId, is_active: true },
    order: [["updated_at", "DESC"]],
  });
}

export async function getStudentChatMessages(sessionId, userId) {
  const session = await StudentChatSession.findOne({
    where: { id: sessionId, student_id: userId, is_active: true },
  });
  if (!session) throw new Error("Chat session not found");

  return await StudentChatMessage.findAll({
    where: { session_id: sessionId },
    order: [["created_at", "ASC"]],
  });
}

export async function deleteStudentChatSession(sessionId, userId) {
  const session = await StudentChatSession.findOne({
    where: { id: sessionId, student_id: userId },
  });
  if (session) {
    session.is_active = false;
    await session.save();
  }
  return { success: true };
}
