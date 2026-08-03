import { getAiClient, getGeminiModel } from "../shared/aiClient.js";
import { getTeacherChapter } from "./getTeacherChapter.js";
import { isLanguageSubject } from "./detectSubject.js";
import School from "../../schools/school.model.js";
import Class from "../../classes/classes.model.js";
import TeacherQuiz from "../../quiz/teacher-quiz.model.js";
import TeacherQuizQuestion from "../../quiz/teacher-quiz-question.model.js";
import AppError from "../../../shared/appError.js";
import AiChatLog from "../../ai-chat-logs/ai-chat-log.model.js";
import { deductTokens, ensureTokenAccount, assertHasTokenBalance } from "../../tokens/token.service.js";

/**
 * Generates teacher AI tools:
 * 1. Question Paper
 * 2. Lesson Plan
 * 3. Lesson Summary
 * 4. Teacher-created Quiz (Saves directly to DB for student homework attempt)
 */
export async function generateTeacherAiContent({
  user,
  tool, // 'question_paper' | 'lesson_plan' | 'lesson_summary' | 'student_quiz'
  board,
  grade,
  subject,
  chapter,
  title,
  classId,
  numQuestions = 5,
  difficulty = "MEDIUM",
  marks = "50",
  customInstructions = "",
}) {
  if (user.role !== "teacher" && user.role !== "school_admin" && user.role !== "super_admin") {
    throw new AppError("Only teachers or school administrators can generate AI content", 403);
  }

  const school = await School.findByPk(user.school_id);
  const finalBoard = (school?.board || board || "CBSE").toUpperCase();

  // Extract numerical grade standard (e.g., Class 10 -> 10)
  const gradeStr = String(grade || "6");
  const gradeMatch = gradeStr.match(/\d+/);
  const finalGrade = gradeMatch ? gradeMatch[0] : "6";
  const finalSubject = subject || "General";

  // Check language bypass
  const isLang = isLanguageSubject(finalSubject);
  let chapterContext = "";
  let chunksCount = 0;

  if (!isLang && chapter) {
    try {
      const ragRes = await getTeacherChapter({
        board: finalBoard,
        grade: finalGrade,
        subject: finalSubject,
        chapter,
      });
      chapterContext = ragRes.fullChapterText || "";
      chunksCount = ragRes.chunksCount || 0;
    } catch (e) {
      console.warn("[TeacherAI] RAG context lookup warning:", e.message);
    }
  }

  const ai = getAiClient();
  const GEMINI_MODEL = getGeminiModel();

  if (user?.id) {
    await assertHasTokenBalance(user.id);
  }

  // Handle Student Quiz Tool (Saves to DB)
  if (tool === "student_quiz") {
    if (!classId) {
      throw new AppError("Target class selection is required to generate student quiz", 400);
    }

    const quizPrompt = `
You are an expert curriculum designer.
Generate a structured quiz based ${
      chapterContext
        ? "ONLY on the following textbook chapter context"
        : `on the standard Grade ${finalGrade} ${finalSubject} curriculum`
    }.

Quiz Title: ${title || `${finalSubject} Ch-${chapter || 1} Quiz`}
Subject: ${finalSubject}
Grade/Standard: Grade ${finalGrade} (${finalBoard})
Number of Questions: ${Math.min(Math.max(numQuestions, 3), 15)}
Difficulty: ${difficulty}

System Rules:
1. Return ONLY valid JSON matching this exact structure:
{
  "title": "${title || `${finalSubject} Quiz`}",
  "instructions": "Answer all questions carefully.",
  "questions": [
    {
      "question_text": "Question statement?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "Option A",
      "explanation": "Brief explanation of correct choice.",
      "marks": 1
    }
  ]
}
2. Ensure options contain 4 distinct choices.
3. correct_answer MUST match one of the choices in options exactly.
4. NO emojis. NO conversational intro text. NO markdown formatting outside JSON.

${chapterContext ? `Textbook Context:\n${chapterContext}` : ""}
`;

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: quizPrompt,
    });

    const text = result.text || result?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
    const cleaned = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      parsed = JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      throw new AppError("AI returned invalid quiz JSON format", 500);
    }

    // Save quiz to Database
    const quiz = await TeacherQuiz.create({
      school_id: user.school_id,
      teacher_id: user.id,
      class_id: classId,
      subject: finalSubject,
      chapter: String(chapter || "1"),
      title: parsed.title || title || `${finalSubject} Quiz`,
      instructions: parsed.instructions || "Complete the homework quiz assignment.",
      difficulty,
      total_marks: (parsed.questions || []).length,
      status: "published",
    });

    const questionsToCreate = (parsed.questions || []).map((q, idx) => ({
      quiz_id: quiz.id,
      order_index: idx + 1,
      question_text: q.question_text,
      options: q.options || [],
      correct_answer: q.correct_answer,
      explanation: q.explanation || "",
      marks: q.marks || 1,
    }));

    await TeacherQuizQuestion.bulkCreate(questionsToCreate);

    return {
      tool: "student_quiz",
      quizId: quiz.id,
      title: quiz.title,
      questionsCount: questionsToCreate.length,
      publishedToClassId: classId,
      message: `Quiz created and published for student homework!`,
      content: JSON.stringify(parsed, null, 2),
      meta: {
        isLanguageSubject: isLang,
        usedRagContext: Boolean(chapterContext),
        chunksCount,
        board: finalBoard,
        grade: finalGrade,
      },
    };
  }

  // Handle Question Paper, Lesson Plan, and Lesson Summary
  let systemPrompt = "";

  if (tool === "question_paper") {
    systemPrompt = `
You are an expert examination master preparing an official Question Paper for Grade ${finalGrade} ${finalSubject} (${finalBoard} Board).

Topic / Chapter: ${chapter || title || "Comprehensive Chapter Assessment"}
Total Marks: ${marks || "50"}
Difficulty Level: ${difficulty}

${chapterContext ? `Textbook Context:\n${chapterContext}\n` : ""}

System Rules:
1. Format as clean, professional Markdown.
2. Structure into:
   - **Header Block** (School/Exam Name, Subject, Grade ${finalGrade}, Time Allowed, Max Marks: ${marks})
   - **General Instructions** (Read questions carefully, all questions compulsory, etc.)
   - **Section A**: Multiple Choice Questions (MCQs) with 4 options each
   - **Section B**: Short Answer Questions (2-3 marks each)
   - **Section C**: Long Answer / Analytical Questions (4-5 marks each)
   - **Section D**: Answer Key & Marking Scheme (Clear solution for each question at the bottom)
3. NO emojis. NO conversational fluff or decorative ASCII characters.
4. Language & Depth strictly aligned to Grade ${finalGrade} ${finalBoard} academic standards.
${customInstructions ? `Additional Teacher Directive: ${customInstructions}` : ""}
`;
  } else if (tool === "lesson_plan") {
    systemPrompt = `
You are an expert Master Educator creating a structured 45-Minute Lesson Plan for Grade ${finalGrade} ${finalSubject} (${finalBoard} Board).

Topic / Chapter: ${chapter || title || "Lesson Plan"}

${chapterContext ? `Textbook Context:\n${chapterContext}\n` : ""}

System Rules:
1. Format as clean, structured Markdown.
2. Include the following sections:
   - **Lesson Overview**: Grade ${finalGrade}, Subject, Unit/Chapter, Duration: 45 Mins
   - **Learning Objectives**: (3-4 measurable learning outcomes)
   - **Prerequisites & Key Vocabulary**: Essential terms student should know beforehand
   - **Teaching Methodology & Resources**: Board, Diagrams, Experiments, PPTs
   - **Step-by-Step 45-Minute Timeline**:
     - *00-05 Mins*: Warm-up / Hook Question
     - *05-20 Mins*: Core Concept Explanation & Demonstration
     - *20-35 Mins*: Interactive Classroom Activity / Group Problem Solving
     - *35-40 Mins*: Real-world Applications & Discussion
     - *40-45 Mins*: Summary & Homework Assignment
   - **Differentiated Instruction**: Support for struggling students and challenge for advanced learners
   - **Homework & Assessment**: 2 practice questions for home
3. NO emojis. NO conversational intro text.
${customInstructions ? `Additional Teacher Directive: ${customInstructions}` : ""}
`;
  } else {
    // lesson_summary
    systemPrompt = `
You are an expert Academic Lead generating a concise, high-yield Lesson Summary & Revision Guide for Grade ${finalGrade} ${finalSubject} (${finalBoard} Board).

Topic / Chapter: ${chapter || title || "Lesson Summary"}

${chapterContext ? `Textbook Context:\n${chapterContext}\n` : ""}

System Rules:
1. Format as clean, structured Markdown.
2. Include:
   - **Chapter Overview**: Core theme and learning objectives
   - **Key Concepts & Bulleted Mind-Map**: Clear bullet points explaining each major concept
   - **Important Definitions & Key Terms**: Concise glossary of essential terms
   - **Formulae / Key Principles**: Fundamental rules, equations, or laws
   - **Common Misconceptions & Exam Pitfalls**: What students frequently get wrong
   - **5-Minute Rapid Revision Checklist**: Quick check questions for students
3. NO emojis. NO conversational fluff.
4. Straight to the point.
${customInstructions ? `Additional Teacher Directive: ${customInstructions}` : ""}
`;
  }

  const result = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: systemPrompt,
  });

  const generatedText =
    result.text || result?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";

  if (user?.id) {
    const usage = result.usageMetadata || {};
    const promptTokens = usage.promptTokenCount || 0;
    const candidateTokens = usage.candidatesTokenCount || 0;
    const tokensUsed = usage.totalTokenCount || (promptTokens + candidateTokens);

    const log = await AiChatLog.create({
      user_id: user.id,
      user_query: String(title || chapter || tool).slice(0, 250),
      ai_response: generatedText.slice(0, 500),
      tokens_used: tokensUsed,
      prompt_tokens: promptTokens,
      candidate_tokens: candidateTokens,
      model_used: GEMINI_MODEL,
      ai_type: tool === "question_paper" ? "question_paper" : tool === "student_quiz" ? "quiz" : "lesson_summary",
      class_level: String(finalGrade || ""),
    });

    await deductTokens({
      userId: user.id,
      amount: tokensUsed,
      reason: `teacher_ai_${tool}`,
      refId: log.id,
    });
  }

  return {
    tool,
    content: generatedText,
    meta: {
      isLanguageSubject: isLang,
      usedRagContext: Boolean(chapterContext),
      chunksCount,
      board: finalBoard,
      grade: finalGrade,
      subject: finalSubject,
      chapter,
    },
  };
}
