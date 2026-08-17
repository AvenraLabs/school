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

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON object found in Gemini response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.imagePrompt || !parsed.summary) {
      throw new Error("Gemini returned JSON but missing required keys ('imagePrompt' or 'summary')");
    }

    const usage = response.usageMetadata || {};
    const promptTokens = usage.promptTokenCount || 0;
    const candidateTokens = usage.candidatesTokenCount || 0;
    const tokensUsed = usage.totalTokenCount || (promptTokens + candidateTokens);

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
          prompt_tokens: promptTokens,
          candidate_tokens: candidateTokens,
          model_used: model,
          ai_type: "summary",
          class_level: String(classLevel || ""),
        });
      } catch (deductErr) {
        logger.warn("DIAGRAM_TOKEN_DEDUCT_WARN", `Failed to deduct prompt tokens: ${deductErr.message}`);
      }
    }

    return {
      imagePrompt: String(parsed.imagePrompt),
      summary: String(parsed.summary).slice(0, 200),
    };
  } catch (err) {
    logger.warn("DIAGRAM_PROMPT_FALLBACK", `Gemini diagram prompt failed: ${err.message}. Using fallback.`);
    return {
      imagePrompt: `A flat vector-style educational diagram for Grade ${classLevel || 6} students about "${topic}". Clean white background, bright colors, 4–8 clearly labeled parts with callout lines pointing to each component, child-friendly textbook illustration style, no watermarks.`,
      summary: `Explore the key parts of ${topic} in this labeled diagram.`,
    };
  }
}

/**
 * Generate a labeled 2D educational diagram via Vertex AI Gemini / Imagen,
 * upload the PNG to GCS, and return the GCS URI + public HTTPS URL + summary.
 */
export async function generateEducationalDiagram({ topic, classLevel, subjectName, schoolId, classId, userId, refId }) {
  const startTime = Date.now();
  const { imagePrompt, summary } = await buildDiagramPromptAndSummary({ topic, classLevel, userId, refId });
  logger.info("DIAGRAM_PROMPT_READY", `Imagen prompt built for "${topic}"`, { imagePrompt: imagePrompt.slice(0, 120) });

  const ai = getGenAIClient();
  const candidateModels = [
    process.env.IMAGEN_MODEL_NAME,
    "gemini-2.5-flash-image",
    "imagen-3.0-generate-002",
    "imagen-3.0-fast-generate-001",
    "imagen-3.0-generate-001",
    "gemini-2.0-flash-exp",
  ].filter(Boolean);

  // Deduplicate candidate models
  const uniqueModels = Array.from(new Set(candidateModels));

  let imageBuffer = null;
  let lastError = null;
  let lastModelTried = null;

  for (const modelName of uniqueModels) {
    lastModelTried = modelName;
    try {
      if (modelName.startsWith("gemini-")) {
        let imageResponse = null;
        try {
          imageResponse = await ai.models.generateContent({
            model: modelName,
            contents: imagePrompt,
            config: {
              responseModalities: ["IMAGE"],
              imageConfig: {
                aspectRatio: "1:1",
              },
            },
          });
        } catch (singleModalityErr) {
          // If ["IMAGE"] alone fails (e.g. preview vs GA differences), try ["TEXT", "IMAGE"]
          logger.warn("DIAGRAM_MODALITY_RETRY", `Model "${modelName}" failed with responseModalities: ["IMAGE"] (${singleModalityErr.message}). Retrying with ["TEXT", "IMAGE"]...`);
          imageResponse = await ai.models.generateContent({
            model: modelName,
            contents: imagePrompt,
            config: {
              responseModalities: ["TEXT", "IMAGE"],
              imageConfig: {
                aspectRatio: "1:1",
              },
            },
          });
        }

        const candidates = imageResponse?.candidates || [];
        const parts = candidates[0]?.content?.parts || imageResponse?.parts || [];
        const imagePart = parts.find((part) => part.inlineData || part.inline_data);
        const base64Data = imagePart?.inlineData?.data || imagePart?.inline_data?.data;

        if (base64Data) {
          imageBuffer = Buffer.from(base64Data, "base64");
          logger.info("DIAGRAM_GEN_SUCCESS", `Diagram generated using model "${modelName}"`);
          break;
        } else {
          throw new Error(`Model "${modelName}" returned content without an inline image part.`);
        }
      } else {
        const imageResponse = await ai.models.generateImages({
          model: modelName,
          prompt: imagePrompt,
          config: { numberOfImages: 1, outputMimeType: "image/png" },
        });

        const generatedImage = imageResponse?.generatedImages?.[0]?.image;
        if (generatedImage?.imageBytes) {
          imageBuffer = Buffer.from(generatedImage.imageBytes, "base64");
          logger.info("DIAGRAM_GEN_SUCCESS", `Diagram generated using model "${modelName}"`);
          break;
        } else {
          throw new Error(`Model "${modelName}" returned response without imageBytes.`);
        }
      }
    } catch (mErr) {
      lastError = mErr;
      logger.error("DIAGRAM_MODEL_ERROR", `Diagram generation model "${modelName}" failed: ${mErr.message}`, {
        model: modelName,
        message: mErr.message,
        status: mErr.status || mErr.statusCode || mErr.code || null,
        stack: mErr.stack,
        details: mErr.details || mErr.errorDetails || null,
      });
    }
  }

  if (!imageBuffer) {
    const finalErr = new Error(
      `Educational diagram generation failed across all candidate models (${uniqueModels.join(", ")}). Last model tried: "${lastModelTried}" — Error: ${lastError?.message || "No image buffer returned"}`
    );
    finalErr.status = lastError?.status || lastError?.statusCode || 500;
    finalErr.code = lastError?.code;
    finalErr.lastModelTried = lastModelTried;

    logger.integration({
      integration: "imagen",
      action: "generate_diagram",
      status: "failure",
      duration_ms: Date.now() - startTime,
      meta: { topic, lastModelTried, error: finalErr.message },
    });

    throw finalErr;
  }

  const rawGcsBase = getGcsOutputUri() || "";
  const bucketName = rawGcsBase.replace(/^gs:\/\//, "").split("/")[0];
  if (!bucketName) {
    const gcsErr = new Error(`Cannot parse bucket from GCS_OUTPUT_URI: ${rawGcsBase}`);
    logger.integration({
      integration: "imagen",
      action: "generate_diagram",
      status: "failure",
      duration_ms: Date.now() - startTime,
      meta: { topic, error: gcsErr.message },
    });
    throw gcsErr;
  }

  const envFolder = process.env.NODE_ENV === "production" ? "prod" : "dev";
  const schoolFolder = `school_${schoolId || "global"}`;
  const userFolder = `user_${userId || "global"}`;
  const classFolder = `class_${classId || "all"}`;
  const subjectSlug = slugify(subjectName || "general");
  const topicSlug = slugify(topic);
  const fileIdentifier = refId ? `diagram_${refId}.png` : `diagram_${Date.now()}.png`;

  const objectPath = `generations/${envFolder}/${schoolFolder}/${userFolder}/${classFolder}/${subjectSlug}/${topicSlug}/${fileIdentifier}`;
  const gsUri = `gs://${bucketName}/${objectPath}`;
  const publicUrl = `https://storage.googleapis.com/${bucketName}/${objectPath}`;

  try {
    const storage = getStorageClient();
    const file = storage.bucket(bucketName).file(objectPath);
    await file.save(imageBuffer, {
      contentType: "image/png",
      metadata: { cacheControl: "public, max-age=31536000" },
    });
  } catch (storageErr) {
    logger.error("DIAGRAM_GCS_SAVE_ERROR", `Failed to save diagram to GCS (${gsUri}): ${storageErr.message}`, {
      message: storageErr.message,
      stack: storageErr.stack,
    });
    logger.integration({
      integration: "imagen",
      action: "generate_diagram",
      status: "failure",
      duration_ms: Date.now() - startTime,
      meta: { topic, gsUri, error: storageErr.message },
    });
    throw storageErr;
  }

  logger.integration({
    integration: "imagen",
    action: "generate_diagram",
    status: "success",
    duration_ms: Date.now() - startTime,
    meta: { topic, publicUrl, modelUsed: lastModelTried },
  });

  return { imagePath: gsUri, imageUrl: publicUrl, summary };
}
