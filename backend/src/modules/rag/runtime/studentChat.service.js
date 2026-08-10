import StudentChatSession from "../models/student-chat-session.model.js";
import StudentChatMessage from "../models/student-chat-message.model.js";
import User from "../../users/user.model.js";
import School from "../../schools/school.model.js";
import Student from "../../students/student.model.js";
import Class from "../../classes/classes.model.js";
import AiChatLog from "../../ai-chat-logs/ai-chat-log.model.js";
import { deductTokens, assertHasTokenBalance } from "../../tokens/token.service.js";

import { detectSubject } from "./detectSubject.js";
import { searchStudentChunks } from "./searchStudentChunks.js";
import { buildStudentRagPrompt, buildLanguageDirectPrompt, buildGeneralCurriculumPrompt } from "./buildPrompt.js";
import { generateAnswer, generateAnswerStream } from "./generateAnswer.js";

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
export async function processStudentChatMessage({ userId, schoolId, sessionId, question, onChunk }) {
  if (!question || !question.trim()) {
    throw new Error("Question is required");
  }

  // Pre-check token balance BEFORE calling Gemini API (0 API calls wasted if 0 tokens remaining)
  await assertHasTokenBalance(userId);

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

  // If no sessionId passed, reuse recent active session updated in the last 2 hours to prevent duplicate session creation
  if (!session) {
    const { Op } = await import("sequelize");
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    session = await StudentChatSession.findOne({
      where: {
        student_id: userId,
        is_active: true,
        updated_at: { [Op.gte]: twoHoursAgo },
      },
      order: [["updated_at", "DESC"]],
    });
  }

  if (!session) {
    const titleSnippet = question.trim().slice(0, 30) + (question.length > 30 ? "..." : "");
    session = await StudentChatSession.create({
      student_id: userId,
      school_id: school ? school.id : user.school_id,
      title: titleSnippet,
    });
  }

  // Step 1: Subject Detection & Intent Classification (Greetings, Language, Core Academic)
  const { subject, isLanguage, isGreeting } = await detectSubject({ question, board, grade });

  // Update session subject if not set
  if (!session.subject && subject) {
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
  let promptTokens = 0;
  let candidateTokens = 0;
  let sourceType = "rag";

  const runner = onChunk ? (prompt) => generateAnswerStream(prompt, onChunk) : generateAnswer;

  try {
    if (isGreeting) {
      // Direct Greeting Response - no RAG search or disclaimers
      sourceType = "greeting";
      answer = `Hello! I am your AI Study Assistant for Grade ${grade}. How can I help you with your studies today?`;
      if (onChunk) onChunk(answer);
      tokensUsed = 0;
    } else if (isLanguage) {
      // Language direct explanation route
      sourceType = "direct_language";
      const prompt = buildLanguageDirectPrompt({ question, grade, subject });
      const res = await runner(prompt);
      answer = res.text;
      tokensUsed = res.tokensUsed || 0;
      promptTokens = res.promptTokens || 0;
      candidateTokens = res.candidateTokens || 0;
    } else {
      // Core Subject RAG Route: Always search RAG chunks matching student's class and board
      const { chunks, metadatas } = await searchStudentChunks({
        question,
        board,
        grade,
        subject,
        limit: 5,
      });

      if (chunks && chunks.length > 0) {
        sourceType = "rag";
        const contextText = chunks.join("\n\n");
        const prompt = buildStudentRagPrompt({
          question,
          contextText,
          metadatas,
          grade,
          subject,
        });

        const res = await runner(prompt);
        answer = res.text;
        tokensUsed = res.tokensUsed || 0;
        promptTokens = res.promptTokens || 0;
        candidateTokens = res.candidateTokens || 0;

        sources = Array.from(
          new Set(
            metadatas.map(
              (m) => `${m.chapterTitle || "Chapter " + m.chapter} (Pages ${m.pageStart || 1}-${m.pageEnd || 1})`
            )
          )
        );
      } else {
        // Fallback directly to Gemini if vector matching finds no textbook chunks
        sourceType = "direct_curriculum_fallback";
        const prompt = buildGeneralCurriculumPrompt({ question, grade, subject, board });
        const res = await runner(prompt);
        answer = res.text;
        tokensUsed = res.tokensUsed || 0;
        promptTokens = res.promptTokens || 0;
        candidateTokens = res.candidateTokens || 0;
      }
    }
  } catch (aiErr) {
    console.error("[processStudentChatMessage] AI generation error:", aiErr.message || aiErr);
    answer = "I'm sorry, I encountered a temporary connection issue while answering your question. Please try again in a few moments!";
    if (onChunk) onChunk(answer);
    sourceType = "direct_curriculum_fallback";
    tokensUsed = 0;
    promptTokens = 0;
    candidateTokens = 0;
  }

  // Record assistant response message in database
  const assistantMsg = await StudentChatMessage.create({
    session_id: session.id,
    sender: "assistant",
    content: answer,
    sources,
    tokens_used: tokensUsed,
  });

  const ALLOWED_AI_TYPES = [
    "rag",
    "chat",
    "quiz",
    "homework",
    "summary",
    "question_paper",
    "lesson_summary",
    "greeting",
    "direct_language",
    "direct_curriculum_fallback",
  ];
  const safeAiType = ALLOWED_AI_TYPES.includes(sourceType) ? sourceType : "rag";

  // Log usage & deduct tokens
  const log = await AiChatLog.create({
    user_id: userId,
    user_query: question,
    ai_response: answer,
    tokens_used: tokensUsed,
    prompt_tokens: promptTokens,
    candidate_tokens: candidateTokens,
    model_used: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
    ai_type: safeAiType,
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
  const sessions = await StudentChatSession.findAll({
    where: { student_id: userId, is_active: true },
    order: [["updated_at", "DESC"]],
  });

  if (!sessions || sessions.length === 0) return [];

  const sessionIds = sessions.map((s) => s.id);
  const { Sequelize } = await import("sequelize");
  const messageCounts = await StudentChatMessage.findAll({
    attributes: ["session_id", [Sequelize.fn("COUNT", Sequelize.col("id")), "msg_count"]],
    where: { session_id: sessionIds },
    group: ["session_id"],
    raw: true,
  });

  const countMap = new Map(
    messageCounts.map((m) => [String(m.session_id), parseInt(m.msg_count || 0, 10)])
  );

  return sessions.filter((s) => (countMap.get(String(s.id)) || 0) > 0);
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
