import { getAiClient, getGeminiModel } from "../shared/aiClient.js";

/**
 * Invokes Gemini 2.5 Flash Lite model to generate answer.
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
    const text =
      result.text ||
      result?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      "";

    return {
      text: text.trim(),
      tokensUsed,
      modelUsed: GEMINI_MODEL,
    };
  } catch (e) {
    console.error("[generateAnswer] Gemini API invocation error:", e.message);
    throw e;
  }
}
