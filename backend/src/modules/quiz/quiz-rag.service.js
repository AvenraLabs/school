import { getAiClient, getGeminiModel } from "../rag/shared/aiClient.js";
import { buildQuizPrompt } from "./quiz-rag.prompts.js";
import Quiz from "./quiz.model.js";
import QuizQuestion from "./quiz-question.model.js";
import AppError from "../../shared/appError.js";
import { retrieveRagContext } from "../rag/rag.service.js";
import AiChatLog from "../ai-chat-logs/ai-chat-log.model.js";
import { deductTokens, ensureTokenAccount, assertHasTokenBalance } from "../tokens/token.service.js";

function extractJson(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new AppError("AI returned invalid quiz format", 500);
  }
  const jsonText = cleaned.slice(start, end + 1);
  return JSON.parse(jsonText);
}

export async function generateQuizFromAi({
  user,
  topic,
  classLevel,
  difficulty,
  numQuestions,
}) {
  const safeNumQuestions = Math.min(Math.max(numQuestions || 5, 1), 20);
  const safeDifficulty = difficulty || "MEDIUM";
  const safeClassLevel = classLevel || 5;

  // Check token balance BEFORE calling Gemini API
  if (user?.id) {
    await assertHasTokenBalance(user.id);
  }

  let contextText = "";
  try {
    const context = await retrieveRagContext({
      query: topic,
      classLevel: safeClassLevel,
    });
    if (context && context.chunks && context.chunks.length) {
      contextText = context.chunks.join("\n\n");
    }
  } catch (err) {
    console.error("Quiz RAG context retrieval failed, using fallback general knowledge:", err);
  }

  const prompt = buildQuizPrompt({
    topic,
    classLevel: safeClassLevel,
    difficulty: safeDifficulty,
    numQuestions: safeNumQuestions,
    contextText,
  });

  const ai = getAiClient();
  const GEMINI_MODEL = getGeminiModel();

  const result = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });
  const text =
    result.text ||
    result?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
    "";

  let parsed;
  try {
    parsed = extractJson(text);
  } catch {
    throw new AppError("AI returned invalid quiz format", 500);
  }

  if (!parsed?.questions || !Array.isArray(parsed.questions)) {
    throw new AppError("AI returned invalid quiz format", 500);
  }

  const tokensUsed =
    result.usageMetadata?.totalTokenCount ||
    Math.max(150, Math.ceil((prompt.length + text.length) / 4));

  const quiz = await Quiz.create({
    title: parsed.title || topic,
    topic,
    difficulty: safeDifficulty,
    num_questions: parsed.questions.length,
    owner_user_id: user.id,
  });

  if (user?.id) {
    const log = await AiChatLog.create({
      user_id: user.id,
      user_query: topic,
      ai_response: text.slice(0, 500),
      tokens_used: tokensUsed,
      model_used: GEMINI_MODEL,
      ai_type: "quiz",
      class_level: String(safeClassLevel),
    });

    await deductTokens({
      userId: user.id,
      amount: tokensUsed,
      reason: "teacher_quiz_generation",
      refId: quiz.id,
    });
  }

  const questionRows = parsed.questions.map((q, i) => ({
    quiz_id: quiz.id,
    order_index: i,
    question_text: q.question_text || q.question,
    options: q.options,
    correct_option_index:
      q.correct_option_index !== undefined
        ? q.correct_option_index
        : q.correct_index,
  }));

  const createdQuestions = await QuizQuestion.bulkCreate(questionRows, {
    returning: true,
  });

  return {
    quizId: quiz.id,
    questions: createdQuestions,
  };
}
