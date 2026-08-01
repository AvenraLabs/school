import { getAiClient, getGeminiModel } from "../../rag/shared/aiClient.js";

/**
 * Generate a rich, cinematic educational animation prompt for Google Veo 3 via Gemini
 */
export async function generateEducationalVideoPrompt({
  topic,
  classLevel,
  duration = "6",
}) {
  try {
    const ai = getAiClient();
    const model = getGeminiModel();

    const systemPrompt = `You are a world-class 3D educational animator and director creating video prompts for Google Veo video generator.
Generate a single, highly detailed, visually compelling text-to-video prompt for a Grade ${classLevel || 6} student.

Topic: ${topic}
Target Duration: ${duration} seconds

CRITICAL PACING & TIMING REQUIREMENTS FOR GOOGLE VEO:
- The entire educational concept MUST be visually shown and fully completed from start to finish within exactly ${duration} seconds.
- DO NOT generate slow camera trajectories or partial pans that get cut off halfway.
- If the topic covers multiple components (e.g., Solar System, Water Cycle, Cell Structure), explicitly specify a dynamic wide-angle sweep or fast-paced time-lapse camera motion so that ALL components (e.g., Sun to Neptune, Evaporation to Collection) are cleanly revealed and the concept resolves fully before the video ends.
- Use explicit speed and timing cues in the prompt (e.g., "In a brisk, smooth ${duration}-second continuous shot...", "A fast-paced, cohesive 3D visual journey covering...").
- Scientifically accurate, vivid 3D visual animation with vibrant, bright colors engaging for children aged 10-14.
- No watermarks, no channel logos, no fuzzy noise.
- Output ONLY the final visual prompt string with no intro text or markdown wrapping.`;

    const generatePromise = ai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini prompt generation timed out (5s limit)")), 5000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);

    const resultText = response.text ? response.text.trim() : "";
    
    if (resultText && resultText.length > 20) {
      return resultText;
    }

    // Fallback prompt template if Gemini returns minimal text
    return `Create a high-quality 3D educational animation for Grade ${classLevel || 6} students on "${topic}". In a brisk, smooth ${duration}-second continuous sequence, show a complete visual overview of ${topic} from start to finish with dynamic wide camera panning, vibrant colors, child-friendly 3D graphics, resolving fully within ${duration} seconds without getting cut off. No logos or watermarks.`;
  } catch (error) {
    console.error("[GeminiVideoPrompt] Failed to generate prompt, using fallback:", error.message);
    return `A vivid, fast-paced 3D educational animation for school students exploring "${topic}". High resolution, bright colors, complete visual coverage of ${topic} within ${duration} seconds, smooth motion, child friendly, no watermarks.`;
  }
}
