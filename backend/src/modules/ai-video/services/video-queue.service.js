import VideoGeneration from "../video-generation.model.js";
import { generateEducationalVideoPrompt } from "./gemini-prompt.service.js";
import { submitTextToVideoTask, queryKlingTaskStatus } from "./kling.service.js";
import { downloadAndSaveVideo } from "./video-storage.service.js";

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
    console.error(`[VideoWorker] VideoGeneration record ${generationId} not found`);
    return;
  }

  try {
    console.log(`[VideoWorker] Starting video generation ID #${generationId} (Topic: "${record.topic}")...`);
    await record.update({ status: "processing" });

    // Step 1: Generate Prompt via Gemini
    let prompt = record.prompt;
    if (!prompt) {
      console.log(`[VideoWorker] Generating Gemini animation prompt for "${record.topic}"...`);
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
    console.log(`[VideoWorker] Submitting task to Kling AI...`);
    const { taskId } = await submitTextToVideoTask({
      prompt,
      duration: record.duration || "5",
    });

    await record.update({ kling_job_id: taskId });
    console.log(`[VideoWorker] Kling Job ID assigned: ${taskId}. Starting polling...`);

    // Step 3: Poll Kling AI status (Interval: 10s, Max Wait: 10 mins)
    const POLL_INTERVAL_MS = 10000;
    const MAX_POLLS = 60; // 60 * 10s = 600s (10 minutes)
    let pollCount = 0;
    let completed = false;

    while (pollCount < MAX_POLLS && !completed) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      pollCount++;

      console.log(`[VideoWorker] Polling Kling Task ${taskId} (Attempt ${pollCount}/${MAX_POLLS})...`);
      const statusRes = await queryKlingTaskStatus(taskId);

      if (statusRes.status === "succeed") {
        completed = true;
        console.log(`[VideoWorker] Kling task ${taskId} completed successfully! Video URL received.`);

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

        console.log(`[VideoWorker] Video generation #${generationId} complete! Saved to ${publicUrl}`);
        return;
      } else if (statusRes.status === "failed") {
        completed = true;
        const err = statusRes.errorMessage || "Kling AI reported video generation failure";
        console.error(`[VideoWorker] Kling task ${taskId} failed:`, err);
        await record.update({
          status: "failed",
          error_message: err,
        });
        return;
      }
    }

    if (!completed) {
      const timeoutErr = "Video generation timed out after 10 minutes";
      console.error(`[VideoWorker] Task #${generationId} timed out`);
      await record.update({
        status: "failed",
        error_message: timeoutErr,
      });
    }
  } catch (error) {
    console.error(`[VideoWorker] Error processing video generation #${generationId}:`, error.message);
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
  console.log(`[VideoQueue] Enqueuing VideoGeneration ID #${generationId}...`);
  
  // Non-blocking asynchronous execution in Node process
  setImmediate(() => {
    processVideoGeneration(generationId).catch((err) => {
      console.error(`[VideoQueue] Background process error for ID #${generationId}:`, err);
    });
  });
}
