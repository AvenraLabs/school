import { getAiClient, getGeminiModel } from "../shared/aiClient.js";

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
 * Invokes Gemini model to generate answer.
 */
export async function generateAnswer(prompt) {
  const ai = getAiClient();
  const GEMINI_MODEL = getGeminiModel();

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const usage = result.usageMetadata || {};
    const tokensUsed = usage.totalTokenCount || 0;
    const rawText =
      result.text ||
      result?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      "";

    const text = sanitizeAiOutput(rawText);

    return {
      text,
      tokensUsed,
      modelUsed: GEMINI_MODEL,
    };
  } catch (e) {
    console.error("[generateAnswer] Gemini API invocation error:", e.message);
    throw e;
  }
}
