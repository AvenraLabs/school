import { Op } from "sequelize";
import { getAiClient, getGeminiModel } from "../rag/shared/aiClient.js";
import { getTeacherChapter } from "../rag/runtime/getTeacherChapter.js";
import { isLanguageSubject } from "../rag/runtime/detectSubject.js";
import TeacherAiDocument from "./teacher-ai-document.model.js";
import School from "../schools/school.model.js";
import Class from "../classes/classes.model.js";
import TeacherQuiz from "../quiz/teacher-quiz.model.js";
import TeacherQuizQuestion from "../quiz/teacher-quiz-question.model.js";
import AppError from "../../shared/appError.js";
import AiChatLog from "../ai-chat-logs/ai-chat-log.model.js";
import { deductTokens, ensureTokenAccount, assertHasTokenBalance } from "../tokens/token.service.js";

/** Extract JSON safely from Gemini output with multi-stage sanitization */
function parseGeminiJson(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new AppError("AI returned empty content. Please try again.", 500);
  }

  // 1. Remove markdown fences
  let cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

  // 2. Locate JSON object bounds
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1) {
    throw new AppError("AI response did not contain valid structured JSON. Please click Generate again.", 500);
  }

  let jsonCandidate = end > start ? cleaned.slice(start, end + 1) : cleaned.slice(start);

  // Attempt 1: Standard JSON parse
  try {
    return JSON.parse(jsonCandidate);
  } catch (err1) {
    // Attempt 2: Sanitize control characters & trailing commas
    try {
      let sanitized = jsonCandidate
        .replace(/,\s*([\}\]])/g, "$1")
        .replace(/[\u0000-\u001F]+/g, (match) => {
          return match === "\n" ? "\\n" : match === "\r" ? "\\r" : match === "\t" ? "\\t" : "";
        });
      return JSON.parse(sanitized);
    } catch (err2) {
      // Attempt 3: Repair truncated JSON by closing open brackets/braces
      try {
        let repaired = jsonCandidate.replace(/,\s*([\}\]])/g, "$1");
        let openBraces = (repaired.match(/\{/g) || []).length;
        let closeBraces = (repaired.match(/\}/g) || []).length;
        let openBrackets = (repaired.match(/\[/g) || []).length;
        let closeBrackets = (repaired.match(/\]/g) || []).length;

        while (closeBrackets < openBrackets) {
          repaired += "]";
          closeBrackets++;
        }
        while (closeBraces < openBraces) {
          repaired += "}";
          closeBraces++;
        }
        return JSON.parse(repaired);
      } catch (err3) {
        console.error("[parseGeminiJson] Failed all JSON parse attempts. Raw snippet:", rawText.slice(0, 300));
        throw new AppError("AI generated an improperly formatted response. Please click Generate again.", 500);
      }
    }
  }
}

/** Safely call Gemini API with structured JSON response config & retry */
async function safeGenerateContent(ai, model, prompt) {
  const reqPayload = {
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  };

  try {
    return await ai.models.generateContent(reqPayload);
  } catch (err) {
    const errStr = String(err?.message || err);
    console.error("[TeacherAIService] Gemini API error:", errStr);
    if (errStr.includes("503") || errStr.includes("UNAVAILABLE") || errStr.includes("high demand") || errStr.includes("429")) {
      // Wait 1.5 seconds and retry once
      await new Promise((resolve) => setTimeout(resolve, 1500));
      try {
        return await ai.models.generateContent(reqPayload);
      } catch (retryErr) {
        throw new AppError(
          "Gemini AI server is currently experiencing high demand. Please try clicking Generate again in a few seconds.",
          503
        );
      }
    }
    throw new AppError(`AI Generation Error: ${err.message || "Failed to generate content"}`, 500);
  }
}

/**
 * Main AI Content Generation Service for Teachers
 */
export async function generateTeacherAiService({
  user,
  feature, // 'question_paper' | 'lesson_plan' | 'lesson_summary' | 'teacher_quiz'
  board,
  grade,
  subject,
  chapters = [],
  chapter = "",
  title = "",
  examName = "",
  totalMarks = 50,
  duration = 60,
  numQuestions = 10,
  difficulty = "MEDIUM",
  questionTypes = [],
  teachingDuration = "45 mins",
  teachingStyle = "Interactive",
  learningObjectives = "",
  summaryLength = "Medium",
  targetAudience = "Student",
  showCorrectAnswers = true,
  showExplanations = true,
  availableUntil = null,
  classId = null,
  sectionId = null,
  instructions = "",
  skipRag = false, // When true, bypass RAG and go direct to Gemini
  topic = "", // Teacher specified topic / focus area
  questionCounts = {},
}) {
  if (user.role !== "teacher" && user.role !== "school_admin" && user.role !== "super_admin") {
    throw new AppError("Only teachers or administrators can generate AI content", 403);
  }

  // ── SPAM PROTECTION & HARD LIMITS ──
  const safeNumQuestions = Math.min(Math.max(Number(numQuestions) || 5, 1), 50); // Hard cap: max 50 questions
  const safeTotalMarks = Math.min(Math.max(Number(totalMarks) || 10, 1), 500); // Hard cap: max 500 marks
  const safeDuration = Math.min(Math.max(Number(duration) || 15, 1), 300); // Hard cap: max 300 minutes
  const safeTitle = (title || "").slice(0, 200);
  const safeInstructions = (instructions || "").slice(0, 500);

  const school = await School.findByPk(user.school_id);
  const finalBoard = (board || school?.board || "CBSE").toUpperCase();

  const gradeStr = String(grade || "10");
  const gradeMatch = gradeStr.match(/\d+/);
  const finalGrade = gradeMatch ? gradeMatch[0] : "10";
  const finalSubject = subject || "General";

  // Resolve chapter list
  let chapList = Array.isArray(chapters) && chapters.length > 0 ? chapters : [];
  if (chapList.length === 0 && chapter) {
    chapList = String(chapter).split(",").map((c) => c.trim()).filter(Boolean);
  }

  const isLang = isLanguageSubject(finalSubject);
  let textbookContext = "";
  let chunksCount = 0;

  // Skip RAG for: language subjects, explicit skipRag flag, or subject 'other'
  const bypassRag = isLang || skipRag || finalSubject.toLowerCase() === "other";

  if (!bypassRag && (chapList.length > 0 || topic)) {
    try {
      const ragRes = await getTeacherChapter({
        board: finalBoard,
        grade: finalGrade,
        subject: finalSubject,
        chapters: chapList,
        topic,
      });
      textbookContext = ragRes.fullChapterText || "";
      chunksCount = ragRes.chunksCount || 0;
    } catch (e) {
      console.warn("[TeacherAIService] RAG context lookup notice:", e.message);
    }
  }

  const ai = getAiClient();
  const GEMINI_MODEL = getGeminiModel();

  if (user?.id) {
    await assertHasTokenBalance(user.id);
  }

  async function recordTeacherUsage(promptText, resText, aiType, refId = null) {
    if (!user?.id) return;
    const tokensUsed = Math.max(150, Math.ceil(((promptText?.length || 0) + (resText?.length || 0)) / 4));
    
    const log = await AiChatLog.create({
      user_id: user.id,
      user_query: String(title || topic || feature || "Teacher AI").slice(0, 250),
      ai_response: String(resText || "").slice(0, 500),
      tokens_used: tokensUsed,
      model_used: GEMINI_MODEL,
      ai_type: aiType,
      class_level: String(finalGrade || ""),
    });

    await deductTokens({
      userId: user.id,
      amount: tokensUsed,
      reason: `teacher_ai_${feature}`,
      refId: refId || log.id,
    });
  }

  // 1. AI Question Paper Generator
  if (feature === "question_paper") {
    const mcq = Math.min(Math.max(Number(questionCounts?.mcq) || 0, 0), 20);
    const fillBlanks = Math.min(Math.max(Number(questionCounts?.fillBlanks) || 0, 0), 20);
    const trueFalse = Math.min(Math.max(Number(questionCounts?.trueFalse) || 0, 0), 20);
    const shortAnswer = Math.min(Math.max(Number(questionCounts?.shortAnswer) || 0, 0), 20);
    const longAnswer = Math.min(Math.max(Number(questionCounts?.longAnswer) || 0, 0), 20);

    const calculatedTotalMarks = (mcq * 1) + (fillBlanks * 1) + (trueFalse * 1) + (shortAnswer * 3) + (longAnswer * 5);
    const paperMarks = calculatedTotalMarks > 0 ? calculatedTotalMarks : safeTotalMarks;
    const paperDuration = Math.max(15, Math.ceil(paperMarks * 1.2));

    const sectionSpecs = [];
    if (mcq > 0) sectionSpecs.push(`- Section A: EXACTLY ${mcq} Multiple Choice Questions (1 Mark each) with 4 options`);
    if (fillBlanks > 0) sectionSpecs.push(`- Section B: EXACTLY ${fillBlanks} Fill in the Blanks / One Word Questions (1 Mark each)`);
    if (trueFalse > 0) sectionSpecs.push(`- Section C: EXACTLY ${trueFalse} True/False Questions (1 Mark each)`);
    if (shortAnswer > 0) sectionSpecs.push(`- Section D: EXACTLY ${shortAnswer} Short Answer Questions (3 Marks each)`);
    if (longAnswer > 0) sectionSpecs.push(`- Section E: EXACTLY ${longAnswer} Long Answer Questions (5 Marks each)`);

    if (sectionSpecs.length === 0) {
      sectionSpecs.push(`- Section A: EXACTLY 5 Multiple Choice Questions (1 Mark each)`, `- Section B: EXACTLY 3 Short Answer Questions (3 Marks each)`, `- Section C: EXACTLY 2 Long Answer Questions (5 Marks each)`);
    }

    const paperPrompt = `
You are an expert examination master preparing an official Question Paper for Grade ${finalGrade} ${finalSubject} (${finalBoard} Board).

Exam Title: ${title || examName || `${finalSubject} Examination`}
Topic / Focus Area: ${topic || chapList.join(", ") || "Full Curriculum"}
Selected Chapters: ${chapList.join(", ") || "Full Curriculum"}
Total Marks: ${paperMarks}
Duration: ${paperDuration} Mins
Difficulty: ${difficulty}

EXACT SECTION & QUESTION BREAKDOWN:
${sectionSpecs.join("\n")}

CRITICAL INSTRUCTION FOR MARKS:
The sum of marks for all generated questions across all sections MUST EQUAL EXACTLY ${paperMarks}.

System Rules:
1. Return ONLY valid JSON matching this exact structure:
{
  "title": "${title || `${finalSubject} Question Paper`}",
  "exam_name": "${examName || "Term Assessment"}",
  "board": "${finalBoard}",
  "grade": "Grade ${finalGrade}",
  "subject": "${finalSubject}",
  "total_marks": ${paperMarks},
  "duration_mins": ${paperDuration},
  "instructions": [
    "Read all questions carefully before answering.",
    "All sections are compulsory.",
    "Write clear and legibly."
  ],
  "sections": [
    {
      "section_name": "Section A: Multiple Choice Questions",
      "marks_per_question": 1,
      "questions": [
        {
          "q_no": 1,
          "type": "MCQ",
          "question_text": "Question statement?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "marks": 1,
          "answer": "Option A",
          "explanation": "Brief explanation"
        }
      ]
    }
  ],
  "answer_key": [
    { "q_no": 1, "answer": "Option A", "explanation": "Why Option A is correct choice" }
  ]
}
2. Language & depth strictly tailored to Grade ${finalGrade} ${finalBoard} standard.
3. Provide a clear answer key and explanation for EVERY question.
4. NO emojis. NO markdown text outside the JSON object.
${instructions ? `Teacher Directive: ${instructions}` : ""}

${textbookContext ? `Textbook Context:\n${textbookContext}` : ""}
`;

    const result = await safeGenerateContent(ai, GEMINI_MODEL, paperPrompt);
    await recordTeacherUsage(paperPrompt, result.text, "question_paper");

    const parsed = parseGeminiJson(result.text || "");
    return {
      feature: "question_paper",
      data: parsed,
      meta: { isLanguageSubject: isLang, usedRagContext: Boolean(textbookContext), chunksCount },
    };
  }

  // 2. AI Lesson Plan Generator
  if (feature === "lesson_plan") {
    const planPrompt = `
You are a Master Educator preparing a structured Lesson Plan for Grade ${finalGrade} ${finalSubject} (${finalBoard} Board).

Topic / Focus Area: ${topic || chapList.join(", ") || "Unit Plan"}
Chapter: ${chapList.join(", ") || "Unit Plan"}
Teaching Duration: ${teachingDuration}
Teaching Style: ${teachingStyle}
${learningObjectives ? `Teacher Objectives: ${learningObjectives}` : ""}

System Rules:
1. Return ONLY valid JSON matching this exact structure:
{
  "title": "${title || `${finalSubject} Lesson Plan`}",
  "grade": "Grade ${finalGrade}",
  "subject": "${finalSubject}",
  "chapter": "${topic || chapList.join(", ")}",
  "teaching_duration": "${teachingDuration}",
  "teaching_style": "${teachingStyle}",
  "learning_objectives": [
    "Objective 1",
    "Objective 2"
  ],
  "prerequisite_knowledge": [
    "Prerequisite concept 1"
  ],
  "introduction": "5-minute warm up hook question or demonstration.",
  "teaching_flow": [
    {
      "time_slot": "00 - 10 Mins",
      "activity_title": "Hook & Concept Introduction",
      "teacher_action": "Explain core concept using whiteboard diagrams.",
      "student_action": "Observe and note key terms."
    },
    {
      "time_slot": "10 - 30 Mins",
      "activity_title": "Deep Dive & Group Activity",
      "teacher_action": "Guided problem solving.",
      "student_action": "Pair activity."
    }
  ],
  "important_concepts": [
    { "concept": "Key Concept", "explanation": "Simple explanation" }
  ],
  "questions_to_ask_students": [
    "Check for understanding question 1?"
  ],
  "activities": [
    "Interactive classroom experiment or group task"
  ],
  "common_student_mistakes": [
    "Common confusion point"
  ],
  "recap": "Summary closing points and homework assignment."
}
2. NO emojis. NO text outside JSON.
${instructions ? `Teacher Directive: ${instructions}` : ""}

${textbookContext ? `Textbook Context:\n${textbookContext}` : ""}
`;

    const result = await safeGenerateContent(ai, GEMINI_MODEL, planPrompt);
    await recordTeacherUsage(planPrompt, result.text, "lesson_summary");

    const parsed = parseGeminiJson(result.text || "");
    return {
      feature: "lesson_plan",
      data: parsed,
      meta: { isLanguageSubject: isLang, usedRagContext: Boolean(textbookContext), chunksCount },
    };
  }

  // 3. AI Lesson Summary Generator
  if (feature === "lesson_summary") {
    const summaryPrompt = `
You are an Academic Lead generating a high-yield Lesson Summary for Grade ${finalGrade} ${finalSubject} (${finalBoard} Board).

Topic / Focus Area: ${topic || chapList.join(", ") || "Chapter Summary"}
Chapter: ${chapList.join(", ") || topic || "Chapter Summary"}
Summary Length: ${summaryLength}
Target Audience: ${targetAudience}

System Rules:
1. Return ONLY valid JSON matching this exact structure:
{
  "title": "${title || `${finalSubject} Summary`}",
  "grade": "Grade ${finalGrade}",
  "subject": "${finalSubject}",
  "chapter": "${topic || chapList.join(", ")}",
  "summary_length": "${summaryLength}",
  "target_audience": "${targetAudience}",
  "chapter_summary": "Comprehensive overview paragraph of the topic/chapter.",
  "key_concepts": [
    { "title": "Concept 1", "description": "Bullet point explanation" }
  ],
  "important_definitions": [
    { "term": "Term Name", "definition": "Clear concise definition" }
  ],
  "important_formulae": [
    { "name": "Law/Formula Name", "expression": "Formula / Equation" }
  ],
  "important_points": [
    "Crucial point 1"
  ],
  "exam_tips": [
    "Tip to score full marks on this topic"
  ],
  "quick_revision_checklist": [
    "Can I define X?",
    "Can I state formula Y?"
  ]
}
2. NO emojis. NO text outside JSON.
${instructions ? `Teacher Directive: ${instructions}` : ""}

${textbookContext ? `Textbook Context:\n${textbookContext}` : ""}
`;

    const result = await safeGenerateContent(ai, GEMINI_MODEL, summaryPrompt);
    await recordTeacherUsage(summaryPrompt, result.text, "summary");

    const parsed = parseGeminiJson(result.text || "");
    return {
      feature: "lesson_summary",
      data: parsed,
      meta: { isLanguageSubject: isLang, usedRagContext: Boolean(textbookContext), chunksCount },
    };
  }

  // 4. AI Teacher Quiz (Creates assignment published to target class & section)
  if (feature === "teacher_quiz") {
    if (!classId) {
      throw new AppError("Target class selection is required to assign quiz homework", 400);
    }

    const quizPrompt = `
You are an expert curriculum designer creating a Student Homework Quiz for Grade ${finalGrade} ${finalSubject} (${finalBoard} Board).

Quiz Title: ${safeTitle || `${finalSubject} Quiz`}
Topic / Focus Area: ${topic || chapList.join(", ") || "General Topic"}
Selected Chapters: ${chapList.join(", ") || "General"}
Number of Questions: ${safeNumQuestions}
Difficulty: ${difficulty}
Question Types: ${(questionTypes.length > 0 ? questionTypes : ["MCQ", "True/False"]).join(", ")}

System Rules:
1. Return ONLY valid JSON matching this exact structure:
{
  "title": "${safeTitle || `${finalSubject} Quiz Homework`}",
  "instructions": "Complete all questions carefully.",
  "difficulty": "${difficulty}",
  "estimated_minutes": ${safeDuration || 15},
  "questions": [
    {
      "order_index": 1,
      "type": "MCQ",
      "question_text": "Question statement?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Why Option A is correct choice.",
      "marks": 1
    }
  ]
}
2. Ensure options contain 4 distinct choices for MCQs.
3. correct_answer MUST match one of the choices in options exactly.
4. NO emojis. NO text outside JSON.
${safeInstructions ? `Teacher Directive: ${safeInstructions}` : ""}

${textbookContext ? `Textbook Context:\n${textbookContext}` : ""}
`;

    const result = await safeGenerateContent(ai, GEMINI_MODEL, quizPrompt);
    await recordTeacherUsage(quizPrompt, result.text, "quiz");

    const parsed = parseGeminiJson(result.text || "");
    const quizTitle = parsed.title || safeTitle || `${finalSubject} Quiz`;

    // Idempotency check: prevent duplicate quiz creation within 15 seconds
    const fifteenSecsAgo = new Date(Date.now() - 15000);
    const existingQuiz = await TeacherQuiz.findOne({
      where: {
        school_id: user.school_id,
        teacher_id: user.id,
        class_id: classId,
        title: quizTitle,
        created_at: { [Op.gte]: fifteenSecsAgo },
      },
      order: [["created_at", "DESC"]],
    });

    if (existingQuiz) {
      return {
        feature: "teacher_quiz",
        quizId: existingQuiz.id,
        data: parsed,
        publishedToClassId: classId,
        message: "Quiz homework successfully created and published to students!",
        meta: { isLanguageSubject: isLang, usedRagContext: Boolean(textbookContext), chunksCount },
      };
    }

    // Create TeacherQuiz in Database
    const quiz = await TeacherQuiz.create({
      school_id: user.school_id,
      teacher_id: user.id,
      class_id: classId,
      section_id: sectionId || null,
      subject: finalSubject,
      chapter: chapList.join(", "),
      title: quizTitle,
      instructions: parsed.instructions || safeInstructions || "Complete the quiz assignment.",
      difficulty,
      total_marks: (parsed.questions || []).reduce((sum, q) => sum + (q.marks || 1), 0),
      estimated_minutes: parsed.estimated_minutes || safeDuration || 15,
      show_correct_answers: Boolean(showCorrectAnswers),
      show_explanations: Boolean(showExplanations),
      due_date: availableUntil || null,
      status: "published",
    });

    const questionsToCreate = (parsed.questions || []).map((q, idx) => {
      const opts = Array.isArray(q.options) && q.options.length > 0 ? q.options : ["Option A", "Option B", "Option C", "Option D"];
      const rawAns = q.correct_answer || q.correctAnswer || q.answer || q.correct_option || q.correct || opts[0] || "Option A";
      const finalAns = String(rawAns).trim();

      return {
        quiz_id: quiz.id,
        order_index: idx + 1,
        question_text: q.question_text || q.question || `Question ${idx + 1}`,
        options: opts,
        correct_answer: finalAns,
        explanation: q.explanation || "",
        marks: Number(q.marks) || 1,
      };
    });

    await TeacherQuizQuestion.bulkCreate(questionsToCreate);

    return {
      feature: "teacher_quiz",
      quizId: quiz.id,
      data: parsed,
      publishedToClassId: classId,
      message: "Quiz homework successfully created and published to students!",
      meta: { isLanguageSubject: isLang, usedRagContext: Boolean(textbookContext), chunksCount },
    };
  }

  throw new AppError("Invalid AI feature requested", 400);
}

/* ============================================================================
   SAVED DRAFTS & DOCUMENTS CRUD
   ============================================================================ */

export async function saveTeacherAiDocumentService({ user, type, title, board, grade, subject, chapters, content, status = "saved" }) {
  if (!type || !title || !content) {
    throw new AppError("Type, title, and content are required to save document", 400);
  }

  // Idempotency check: block duplicate document saving for exact same title, type, and teacher within 15 seconds
  const fifteenSecsAgo = new Date(Date.now() - 15000);
  const existingDoc = await TeacherAiDocument.findOne({
    where: {
      teacher_id: user.id,
      school_id: user.school_id,
      type,
      title,
      created_at: { [Op.gte]: fifteenSecsAgo },
    },
    order: [["created_at", "DESC"]],
  });

  if (existingDoc) {
    return existingDoc;
  }

  const doc = await TeacherAiDocument.create({
    school_id: user.school_id,
    teacher_id: user.id,
    type,
    title,
    board: board || "CBSE",
    grade,
    subject,
    chapters: Array.isArray(chapters) ? chapters : [chapters].filter(Boolean),
    content,
    status,
  });

  return doc;
}

export async function updateTeacherAiDocumentService(docId, userId, payload) {
  const doc = await TeacherAiDocument.findOne({ where: { id: docId, teacher_id: userId } });
  if (!doc) throw new AppError("Saved document not found", 404);

  await doc.update(payload);
  return doc;
}

export async function listTeacherAiDocumentsService(userId, { type, search }) {
  const where = { teacher_id: userId };
  if (type) where.type = type;

  return await TeacherAiDocument.findAll({
    where,
    order: [["updated_at", "DESC"]],
  });
}

export async function getTeacherAiDocumentService(docId, userId) {
  const doc = await TeacherAiDocument.findOne({ where: { id: docId, teacher_id: userId } });
  if (!doc) throw new AppError("Saved document not found", 404);
  return doc;
}

export async function deleteTeacherAiDocumentService(docId, userId) {
  const doc = await TeacherAiDocument.findOne({ where: { id: docId, teacher_id: userId } });
  if (!doc) throw new AppError("Saved document not found", 404);
  await doc.destroy();
  return { success: true, message: "Document deleted successfully" };
}
