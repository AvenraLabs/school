import { GoogleGenAI } from "@google/genai";
import { Storage } from "@google-cloud/storage";
import AppError from "../../../shared/appError.js";
import logger from "../../../shared/logger.js";

function getGcpProject() {
  const project = process.env.GCP_PROJECT || process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  if (!project) throw new AppError("Environment variable GCP_PROJECT is required in .env", 500);
  return project;
}

function getGcpLocation() {
  const location = process.env.GCP_LOCATION;
  if (!location) throw new AppError("Environment variable GCP_LOCATION is required in .env", 500);
  return location;
}

function getVeoModelName() {
  const model = process.env.VEO_MODEL_NAME;
  if (!model) throw new AppError("Environment variable VEO_MODEL_NAME is required in .env", 500);
  return model;
}

function getGcsOutputUri() {
  const uri = process.env.GCS_OUTPUT_URI;
  if (!uri) throw new AppError("Environment variable GCS_OUTPUT_URI is required in .env", 500);
  return uri;
}

let aiInstance = null;
let storageInstance = null;

export function getGenAIClient() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey && process.env.USE_VERTEX_AI !== "true") {
      aiInstance = new GoogleGenAI({ apiKey });
    } else {
      aiInstance = new GoogleGenAI({
        vertexai: true,
        project: getGcpProject(),
        location: getGcpLocation(),
      });
    }
  }
  return aiInstance;
}

export function getStorageClient() {
  if (!storageInstance) {
    storageInstance = new Storage({ projectId: getGcpProject() });
  }
  return storageInstance;
}

export { getGcpProject, getGcsOutputUri };

export function slugify(text) {
  if (!text) return "general";
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "_")
    .replace(/^-+|-+$/g, "");
}

/**
 * Converts a gs://bucket-name/object-path URI to an HTTPS public storage URL
 */
export function convertGsToPublicUrl(gsUri) {
  if (!gsUri || !gsUri.startsWith("gs://")) return gsUri;
  const match = gsUri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
  if (match) {
    const bucketName = match[1];
    const objectPath = match[2];
    return `https://storage.googleapis.com/${bucketName}/${objectPath}`;
  }
  return gsUri;
}

/**
 * Submit Text-to-Video generation task to Google Vertex AI
 */
export async function submitTextToVideoTask({ prompt, duration = "6", fps = 24, classId, subjectName, topic }) {
  const startTime = Date.now();
  try {
    const ai = getGenAIClient();
    const veoModel = getVeoModelName();
    let baseGcsUri = getGcsOutputUri();
    
    // Ensure base GCS URI ends with /
    if (!baseGcsUri.endsWith("/")) {
      baseGcsUri += "/";
    }

    // Build structured folder URI with env isolation to prevent local dev & prod clashes
    const envFolder = process.env.NODE_ENV === "production" ? "prod" : "dev";
    const classFolder = `class_${classId || "all"}`;
    const subjectSlug = slugify(subjectName || "general");
    
    const outputGcsUri = `${baseGcsUri}${envFolder}/${classFolder}/${subjectSlug}/`;

    let durationSec = parseInt(String(duration), 10) || 6;
    if (![4, 6, 8].includes(durationSec)) {
      durationSec = 6;
    }

    logger.info("VEO_SUBMIT_START", `Submitting Text2Video task to Google Veo (Model: ${veoModel}, Duration: ${durationSec}s, Target: ${outputGcsUri})...`, { prompt, durationSec, outputGcsUri });

    // 1. Initiate Video Generation Operation
    let operation = await ai.models.generateVideos({
      model: veoModel,
      prompt: prompt,
      config: {
        durationSeconds: durationSec,
        fps: Number(fps) || 24,
        outputGcsUri: outputGcsUri,
      },
    });

    const operationName = operation.name;
    console.log(`Operation Name: ${operationName}`);
    logger.info("VEO_OPERATION_NAME", `Started Operation: ${operationName}`, { operationName });

    // 2. Poll the Operation until completion
    let attempts = 0;
    const maxAttempts = Number(process.env.VEO_MAX_POLL_ATTEMPTS) || 60;
    const pollIntervalMs = Number(process.env.VEO_POLL_INTERVAL_MS) || 6000;

    while (!operation.done && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
      attempts++;

      try {
        operation = await ai.operations.getVideosOperation({
          operation: operation,
        });
        logger.info("VEO_POLL_STATUS", `Veo Polling Status: done=${Boolean(operation.done)}`, { operationName, done: operation.done });
      } catch (pollErr) {
        logger.warn("VEO_POLL_WARN", `Polling exception: ${pollErr.message}`);
      }
    }

    if (!operation.done) {
      throw new Error("Video generation timed out waiting for Google Vertex AI response.");
    }

    if (operation.error) {
      throw new Error(`Google Veo Video API Error: ${operation.error.message || JSON.stringify(operation.error)}`);
    }

    // 3. Extract output URL/Data
    let rawVideoUrl = null;
    const generatedVid = operation.response?.generatedVideos?.[0]?.video || operation.generatedVideos?.[0]?.video;

    if (generatedVid?.bytesBase64Encoded) {
      rawVideoUrl = `data:video/mp4;base64,${generatedVid.bytesBase64Encoded}`;
    } else if (generatedVid?.uri) {
      rawVideoUrl = generatedVid.uri;
    } else {
      throw new Error("No video bytes or GCS URI returned by Google Veo Video API");
    }

    const publicWebUrl = convertGsToPublicUrl(rawVideoUrl);

    if (rawVideoUrl.startsWith("gs://")) {
      logger.info("VEO_GCS_URI", `GCS URI returned by Veo: ${rawVideoUrl} -> Public Web URL: ${publicWebUrl}`);
    }

    logger.integration({
      integration: "veo",
      action: "submit_video_task",
      status: "success",
      duration_ms: Date.now() - startTime,
      meta: { operationName, duration: durationSec, publicWebUrl },
    });

    return {
      operationName,
      status: "completed",
      videoUrl: publicWebUrl,
      gcsUri: rawVideoUrl,
      rawResponse: operation,
    };
  } catch (err) {
    const duration_ms = Date.now() - startTime;
    const errorMsg = err.message || "Failed to generate video via Google Veo";
    logger.error("VEO_SUBMIT_EXCEPTION", `Exception submitting video task: ${errorMsg}`, { error: err.stack || err });

    logger.integration({
      integration: "veo",
      action: "submit_video_task",
      status: "failure",
      duration_ms,
      error: errorMsg,
    });

    throw new AppError(`Google Veo Video Generation Error: ${errorMsg}`, 500);
  }
}
