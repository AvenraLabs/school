import { getAiClient, getGeminiModel } from "../../../modules/rag/shared/aiClient.js";
import {
  getGenAIClient,
  getStorageClient,
  getGcsOutputUri,
  slugify,
} from "./google-video.service.js";
import { checkAndDeductTokens } from "../../tokens/token.service.js";
import AiChatLog from "../../ai-chat-logs/ai-chat-log.model.js";
import logger from "../../../shared/logger.js";

/**
 * Ask Gemini Flash Lite to return a structured JSON object containing:
 *   { "imagePrompt": "<Imagen prompt string>", "summary": "<≤15-word student caption>" }
 */
async function buildDiagramPromptAndSummary({ topic, classLevel, userId, refId }) {
  const ai = getAiClient();
  const model = getGeminiModel();

  const systemPrompt = `You are an educational content designer generating Imagen AI prompts for labeled 2D diagrams.

Topic: "${topic}"
Target Grade: ${classLevel || 6}

Your task is to output ONLY valid JSON (no markdown fences, no extra text) with exactly two keys:

1. "imagePrompt": A detailed Imagen text-to-image prompt for a flat, vector-style educational diagram about the topic.
   Rules for the imagePrompt:
   - Label 4 to 8 clearly identified parts directly on the diagram (use callout lines or text annotations in the image)
   - Style: clean flat-design illustration, white background, bright educational colors, child-friendly, similar to a textbook diagram
   - Include the text labels AS PART OF THE IMAGE (not as a caption): each part should have its name written next to it with a line pointing to it
   - No watermarks, no logos, no photographer credits

2. "summary": A single student-facing sentence of 15 words or fewer explaining what they will learn from this diagram.

Output ONLY the raw JSON object. No extra text.`;

  try {
    const generatePromise = ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Gemini diagram prompt timed out (8s)")), 8000)
    );

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const rawText = (response.text || "").trim();

    const usage = response.usageMetadata || {};
    const tokensUsed = usage.totalTokenCount || Math.max(50, Math.ceil(((systemPrompt?.length || 0) + rawText.length) / 4));

    if (userId) {
      try {
        await checkAndDeductTokens({
          userId,
          amount: tokensUsed,
          reason: "ai_diagram_prompt_generation",
          refId: refId || null,
        });

        await AiChatLog.create({
          user_id: userId,
          user_query: `Diagram prompt for "${topic}"`,
          ai_response: rawText.slice(0, 500),
          tokens_used: tokensUsed,
          model_used: model,
          ai_type: "summary",
          class_level: String(classLevel || ""),
        });
      } catch (deductErr) {
        logger.warn("DIAGRAM_TOKEN_DEDUCT_WARN", `Failed to deduct prompt tokens: ${deductErr.message}`);
      }
    }

    const cleaned = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.imagePrompt && parsed.summary) {
      return { imagePrompt: String(parsed.imagePrompt), summary: String(parsed.summary).slice(0, 200) };
    }
    throw new Error("Gemini returned JSON but missing required keys");
  } catch (err) {
    logger.warn("DIAGRAM_PROMPT_FALLBACK", `Gemini diagram prompt failed: ${err.message}. Using fallback.`);
    return {
      imagePrompt: `A flat vector-style educational diagram for Grade ${classLevel || 6} students about "${topic}". Clean white background, bright colors, 4–8 clearly labeled parts with callout lines pointing to each component, child-friendly textbook illustration style, no watermarks.`,
      summary: `Explore the key parts of ${topic} in this labeled diagram.`,
    };
  }
}

/**
 * Generate a labeled 2D educational diagram via Vertex AI Imagen,
 * upload the PNG to GCS, and return the GCS URI + public HTTPS URL + summary.
 */
export async function generateEducationalDiagram({ topic, classLevel, subjectName, classId, userId, refId }) {
  const startTime = Date.now();
  try {
    const { imagePrompt, summary } = await buildDiagramPromptAndSummary({ topic, classLevel, userId, refId });
    logger.info("DIAGRAM_PROMPT_READY", `Imagen prompt built for "${topic}"`, { imagePrompt: imagePrompt.slice(0, 120) });

    const ai = getGenAIClient();
    const imagenModel = process.env.IMAGEN_MODEL_NAME || "gemini-2.5-flash-image";

    let imageBuffer = null;

    if (imagenModel.includes("flash-image") || imagenModel.startsWith("gemini-")) {
      const imageResponse = await ai.models.generateContent({
        model: imagenModel,
        contents: imagePrompt,
        config: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      const candidates = imageResponse?.candidates || [];
      const parts = candidates[0]?.content?.parts || imageResponse?.parts || [];
      const imagePart = parts.find((part) => part.inlineData || part.inline_data);
      const base64Data = imagePart?.inlineData?.data || imagePart?.inline_data?.data;

      if (!base64Data) {
        throw new Error("Model returned a response but no image data was found.");
      }

      imageBuffer = Buffer.from(base64Data, "base64");
    } else {
      const imageResponse = await ai.models.generateImages({
        model: imagenModel,
        prompt: imagePrompt,
        config: { numberOfImages: 1, outputMimeType: "image/png" },
      });

      const generatedImage = imageResponse?.generatedImages?.[0]?.image;
      if (!generatedImage?.imageBytes) {
        throw new Error("Imagen returned no image bytes");
      }

      imageBuffer = Buffer.from(generatedImage.imageBytes, "base64");
    }

    const rawGcsBase = getGcsOutputUri();
    const bucketMatch = rawGcsBase.match(/^gs:\/\/([^/]+)\//);
    if (!bucketMatch) throw new Error(`Cannot parse bucket from GCS_OUTPUT_URI: ${rawGcsBase}`);
    const bucketName = bucketMatch[1];

    const envFolder = process.env.NODE_ENV === "production" ? "prod" : "dev";
    const classFolder = `class_${classId || "all"}`;
    const subjectSlug = slugify(subjectName || "general");
    const topicSlug = slugify(topic);

    const objectPath = `generations/${envFolder}/${classFolder}/${subjectSlug}/${topicSlug}/diagram.png`;
    const gsUri = `gs://${bucketName}/${objectPath}`;
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${objectPath}`;

    const storage = getStorageClient();
    const file = storage.bucket(bucketName).file(objectPath);
    await file.save(imageBuffer, {
      contentType: "image/png",
      metadata: { cacheControl: "public, max-age=31536000" },
    });

    logger.integration({
      integration: "imagen",
      action: "generate_diagram",
      status: "success",
      duration_ms: Date.now() - startTime,
      meta: { topic, publicUrl },
    });

    return { imagePath: gsUri, imageUrl: publicUrl, summary };
  } catch (err) {
    logger.error(
      "DIAGRAM_GENERATION_FAILED",
      `Diagram generation failed for "${topic}": ${err.message}`,
      { error: err.stack || err }
    );
    logger.integration({
      integration: "imagen",
      action: "generate_diagram",
      status: "failure",
      duration_ms: Date.now() - startTime,
      error: err.message,
    });
    return null;
  }
}
