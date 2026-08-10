import { getAiClient, getGeminiModel } from "../shared/aiClient.js";
import logger from "../../../shared/logger.js";

function sanitizeAiOutput(rawText) {
  if (!rawText) return "";
  let clean = rawText;

  // Remove intro greetings like "Hi there! I'd be happy to..." or "Hello! ..."
  clean = clean.replace(/^(Hi there!|Hello!|Hey there!|Sure!|I'd be happy to[^\n]*|Welcome!)[^\n]*\n+/gi, "").trim();

  // Convert markdown heading hashes like "### What is LCM?" into bold titles "**What is LCM?**"
  clean = clean.replace(/^#{1,6}\s*(.+)$/gm, "**$1**");

  // Remove raw horizontal dividers like "***" or "---"
  clean = clean.replace(/^[\*\-_]{3,}$/gm, "");

  return clean.trim();
}

/**
 * Invokes Gemini model to generate answer with structured integration logging.
 */
export async function generateAnswer(prompt) {
  const ai = getAiClient();
  const GEMINI_MODEL = getGeminiModel();
  const startTime = Date.now();

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const duration_ms = Date.now() - startTime;
    const usage = result.usageMetadata || {};
    const promptTokens = usage.promptTokenCount || 0;
    const candidateTokens = usage.candidatesTokenCount || 0;
    const tokensUsed = usage.totalTokenCount || (promptTokens + candidateTokens);
    const rawText =
      result.text ||
      result?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      "";

    const text = sanitizeAiOutput(rawText);

    logger.integration({
      integration: "gemini",
      action: "rag_answer",
      status: "success",
      duration_ms,
      meta: { modelUsed: GEMINI_MODEL, tokensUsed, promptTokens, candidateTokens },
    });

    return {
      text,
      tokensUsed,
      promptTokens,
      candidateTokens,
      modelUsed: GEMINI_MODEL,
    };
  } catch (e) {
    const duration_ms = Date.now() - startTime;
    logger.integration({
      integration: "gemini",
      action: "rag_answer",
      status: "failure",
      duration_ms,
      error: e.message,
      meta: { modelUsed: GEMINI_MODEL },
    });
    console.error("[generateAnswer] Gemini API invocation error:", e.message);
    throw e;
  }
}

/**
 * Invokes Gemini model with stream token response for real-time UI typing effect.
 */
export async function generateAnswerStream(prompt, onChunk) {
  const ai = getAiClient();
  const GEMINI_MODEL = getGeminiModel();
  const startTime = Date.now();

  try {
    const responseStream = await ai.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    let fullRawText = "";
    let promptTokens = 0;
    let candidateTokens = 0;
    let tokensUsed = 0;

    for await (const chunk of responseStream) {
      const textChunk = chunk.text || "";
      if (textChunk) {
        fullRawText += textChunk;
        if (onChunk) {
          onChunk(textChunk);
        }
      }
      if (chunk.usageMetadata) {
        promptTokens = chunk.usageMetadata.promptTokenCount || promptTokens;
        candidateTokens = chunk.usageMetadata.candidatesTokenCount || candidateTokens;
        tokensUsed = chunk.usageMetadata.totalTokenCount || tokensUsed;
      }
    }

    const text = sanitizeAiOutput(fullRawText);
    const duration_ms = Date.now() - startTime;
    if (!tokensUsed) tokensUsed = promptTokens + candidateTokens;

    logger.integration({
      integration: "gemini",
      action: "rag_answer_stream",
      status: "success",
      duration_ms,
      meta: { modelUsed: GEMINI_MODEL, tokensUsed, promptTokens, candidateTokens },
    });

    return {
      text,
      tokensUsed,
      promptTokens,
      candidateTokens,
      modelUsed: GEMINI_MODEL,
    };
  } catch (e) {
    const duration_ms = Date.now() - startTime;
    logger.integration({
      integration: "gemini",
      action: "rag_answer_stream",
      status: "failure",
      duration_ms,
      error: e.message,
      meta: { modelUsed: GEMINI_MODEL },
    });
    console.error("[generateAnswerStream] Gemini stream error:", e.message);
    throw e;
  }
}
