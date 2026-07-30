import VideoGeneration from "../video-generation.model.js";
import { generateEducationalVideoPrompt } from "./gemini-prompt.service.js";
import { submitTextToVideoTask, queryKlingTaskStatus } from "./kling.service.js";
import { downloadAndSaveVideo } from "./video-storage.service.js";
import logger from "../../../shared/logger.js";

/**
 * Executes full background video generation workflow:
 * 1. Generates Gemini Prompt
 * 2. Submits task to Kling AI
 * 3. Polls task status until completed
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
        subjectName: record.subject_name,
        classLevel: record.class_id,
        language: record.language,
        duration: record.duration,
      });
      await record.update({ prompt });
    }

    // Step 2: Submit to Kling AI
    logger.info("VIDEO_WORKER_KLING_SUBMIT", `Submitting task to Kling AI...`, { generationId });
    const { taskId } = await submitTextToVideoTask({
      prompt,
      duration: record.duration || "5",
    });

    await record.update({ kling_job_id: taskId });
    logger.info("VIDEO_WORKER_KLING_JOB_ASSIGNED", `Kling Job ID assigned: ${taskId}. Starting polling...`, { generationId, taskId });

    // Step 3: Poll Kling AI status (Interval: 10s, Max Wait: 10 mins)
    const POLL_INTERVAL_MS = 10000;
    const MAX_POLLS = 60; // 60 * 10s = 600s (10 minutes)
    let pollCount = 0;
    let completed = false;

    while (pollCount < MAX_POLLS && !completed) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      pollCount++;

      logger.info("VIDEO_WORKER_POLLING", `Polling Kling Task ${taskId} (Attempt ${pollCount}/${MAX_POLLS})...`, { generationId, taskId, pollCount });
      const statusRes = await queryKlingTaskStatus(taskId);

      if (statusRes.status === "succeed") {
        completed = true;
        logger.info("VIDEO_WORKER_KLING_SUCCESS", `Kling task ${taskId} completed successfully! Video URL received.`, { generationId, taskId, videoUrl: statusRes.videoUrl });

        // Step 4: Download & Save locally
        const { filePath, publicUrl } = await downloadAndSaveVideo({
          videoUrl: statusRes.videoUrl,
          classId: record.class_id,
          subjectName: record.subject_name,
          topic: record.topic,
        });

        // Step 5: Update PostgreSQL Record
        await record.update({
          status: "completed",
          video_path: filePath,
          video_url: publicUrl,
          completed_at: new Date(),
        });

        logger.info("VIDEO_WORKER_COMPLETE", `Video generation #${generationId} complete! Saved to ${publicUrl}`, { generationId, publicUrl });
        return;
      } else if (statusRes.status === "failed") {
        completed = true;
        const err = statusRes.errorMessage || "Kling AI reported video generation failure";
        logger.error("VIDEO_WORKER_KLING_FAILED", `Kling task ${taskId} failed: ${err}`, { generationId, taskId, error: err });
        await record.update({
          status: "failed",
          error_message: err,
        });
        return;
      }
    }

    if (!completed) {
      const timeoutErr = "Video generation timed out after 10 minutes";
      logger.error("VIDEO_WORKER_TIMEOUT", `Task #${generationId} timed out after 10 minutes`, { generationId, taskId });
      await record.update({
        status: "failed",
        error_message: timeoutErr,
      });
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
 * Queue a new video generation task (BullMQ or In-Memory Background Worker)
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
