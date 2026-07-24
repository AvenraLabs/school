import { getAiClient, getGeminiModel } from "../../rag/shared/aiClient.js";

/**
 * Generate a rich, cinematic educational animation prompt for Kling AI via Gemini
 */
export async function generateEducationalVideoPrompt({
  topic,
  subjectName,
  classLevel,
  language = "English",
  duration = "5",
}) {
  try {
    const ai = getAiClient();
    const model = getGeminiModel();

    const systemPrompt = `You are a world-class 3D educational animator and director creating video prompts for AI video generators (Kling AI).
Generate a single, highly detailed, visually compelling text-to-video prompt for a Grade ${classLevel || 6} student.

Subject: ${subjectName || "General Science"}
Topic: ${topic}
Language Context: ${language}
Target Duration: ${duration} seconds

Requirements for the generated video prompt:
- Scientifically accurate, vivid 3D visual animation of the topic.
- Show key educational elements, clear motion, smooth camera trajectory.
- Vibrant, bright colors, friendly and engaging for children aged 10-14.
- No watermarks, no channel logos, no fuzzy noise.
- Output ONLY the final visual prompt string (1-3 paragraphs) with no intro text or markdown wrapping.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
    });

    const resultText = response.text ? response.text.trim() : "";
    
    if (resultText && resultText.length > 20) {
      return resultText;
    }

    // Fallback prompt template if Gemini returns minimal text
    return `Create a high-quality 3D educational animation for Grade ${classLevel || 6} students on the topic of "${topic}" (${subjectName || "Science"}). Show clear, vibrant, detailed visual elements of ${topic} with smooth camera panning, bright color palette, realistic space/scientific textures, highly engaging for children, no logos or watermarks.`;
  } catch (error) {
    console.error("[GeminiVideoPrompt] Failed to generate prompt, using fallback:", error.message);
    return `A vivid 3D educational animation for school students exploring "${topic}" in ${subjectName || "Science"}. High resolution, bright colors, detailed elements, smooth motion, clear educational presentation, child friendly, no watermarks.`;
  }
}
