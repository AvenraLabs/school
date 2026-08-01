import VideoGeneration from "../video-generation.model.js";
import { generateEducationalVideoPrompt } from "./gemini-prompt.service.js";
import { submitTextToVideoTask } from "./google-video.service.js";
import { downloadAndSaveVideo } from "./video-storage.service.js";
import logger from "../../../shared/logger.js";

/**
 * Executes full background video generation workflow:
 * 1. Generates Gemini Prompt
 * 2. Submits task to Google Vertex AI (Veo 3: veo-3.0-fast-001)
 * 3. Logs Operation Name immediately and awaits result
 * 4. Downloads & stores MP4 locally
 * 5. Updates PostgreSQL record
 */
export async function processVideoGeneration(generationId) {
  const record = await VideoGeneration.findByPk(generationId);
  if (!record) {
    logger.error("VIDEO_WORKER_NOT_FOUND", `VideoGeneration record ${generationId} not found`, { generationId });
    return;
  }

  try {
    logger.info("VIDEO_WORKER_START", `Starting video generation ID #${generationId} (Topic: "${record.topic}")...`, { generationId, topic: record.topic });
    await record.update({ status: "processing" });

    // Step 1: Generate Prompt via Gemini
    let prompt = record.prompt;
    if (!prompt) {
      logger.info("VIDEO_WORKER_GEMINI_PROMPT", `Generating Gemini animation prompt for "${record.topic}"...`, { generationId });
      prompt = await generateEducationalVideoPrompt({
        topic: record.topic,
        classLevel: record.class_id,
        duration: record.duration,
      });
      await record.update({ prompt });
    }

    // Step 2: Submit to Google Vertex AI (Veo)
    logger.info("VIDEO_WORKER_VEO_SUBMIT", `Submitting task to Google Vertex AI (Veo)...`, { generationId });
    const result = await submitTextToVideoTask({
      prompt,
      duration: record.duration || "6",
      classId: record.class_id,
      subjectName: record.subject_name,
      topic: record.topic,
    });

    const operationName = result.operationName;
    await record.update({
      operation_name: operationName,
    });
    logger.info("VIDEO_WORKER_VEO_JOB_ASSIGNED", `Veo Operation Name assigned: ${operationName}`, { generationId, operationName });

    if (result.status === "completed" && result.videoUrl) {
      logger.info("VIDEO_WORKER_VEO_SUCCESS", `Veo task ${operationName} completed successfully! Video URL received.`, { generationId, operationName, videoUrl: result.videoUrl });

      // Step 3: Resolve Cloud Storage Web URL
      const { filePath, publicUrl } = await downloadAndSaveVideo({
        videoUrl: result.videoUrl,
        classId: record.class_id,
        subjectName: record.subject_name,
        topic: record.topic,
      });

      // Step 4: Update PostgreSQL Record
      await record.update({
        status: "completed",
        video_path: filePath,
        video_url: publicUrl,
        completed_at: new Date(),
      });

      logger.info("VIDEO_WORKER_COMPLETE", `Video generation #${generationId} complete! Saved to ${publicUrl}`, { generationId, publicUrl });
      return;
    } else {
      const err = "Veo 3 video generation failed to return a valid video URL";
      logger.error("VIDEO_WORKER_VEO_FAILED", `Task ${operationName} failed: ${err}`, { generationId, operationName, error: err });
      await record.update({
        status: "failed",
        error_message: err,
      });
      return;
    }
  } catch (error) {
    logger.error("VIDEO_WORKER_EXCEPTION", `Error processing video generation #${generationId}: ${error.message}`, { generationId, error: error.message });
    await record.update({
      status: "failed",
      error_message: error.message || "Unexpected background error occurred",
    });
  }
}

/**
 * Queue a new video generation task
 */
export function enqueueVideoGeneration(generationId) {
  logger.info("VIDEO_QUEUE_ENQUEUE", `Enqueuing VideoGeneration ID #${generationId}...`, { generationId });
  
  // Non-blocking asynchronous execution in Node process
  setImmediate(() => {
    processVideoGeneration(generationId).catch((err) => {
      logger.error("VIDEO_QUEUE_WORKER_ERROR", `Background process error for ID #${generationId}: ${err.message}`, { generationId, error: err.message });
    });
  });
}
