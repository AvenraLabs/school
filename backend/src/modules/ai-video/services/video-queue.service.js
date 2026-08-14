import VideoGeneration from "../video-generation.model.js";
import Teacher from "../../teachers/teacher.model.js";
import { generateEducationalVideoPrompt } from "./gemini-prompt.service.js";
import { generateEducationalDiagram } from "./gemini-image.service.js";
import { submitTextToVideoTask } from "./google-video.service.js";
import { downloadAndSaveVideo } from "./video-storage.service.js";
import { refundGenerationQuotas } from "../../tokens/token.service.js";
import logger from "../../../shared/logger.js";

/**
 * Helper to resolve the user_id associated with a video generation record
 */
async function getUserIdForRecord(record) {
  if (record.teacher_id) {
    const teacher = await Teacher.findByPk(record.teacher_id);
    if (teacher?.user_id) return teacher.user_id;
  }
  return null;
}

/**
 * Executes the background "diagram_and_video" workflow:
 *  1. Generate Gemini video prompt
 *  2. Concurrently: generate labeled 2D diagram (Imagen) + submit Veo video task
 *  3. Save whichever artifacts succeeded (partial failure is acceptable)
 *  4. Update PostgreSQL record with status and all available URLs
 *  5. If video generation (or full job) fails, refund deducted quotas for this generation ID
 */
export async function processVideoGeneration(generationId) {
  const record = await VideoGeneration.findByPk(generationId);
  if (!record) {
    logger.error("VIDEO_WORKER_NOT_FOUND", `VideoGeneration record ${generationId} not found`, { generationId });
    return;
  }

  const userId = await getUserIdForRecord(record);

  try {
    logger.info("VIDEO_WORKER_START", `Starting generation ID #${generationId} (Topic: "${record.topic}", Type: ${record.content_type || "diagram_and_video"})...`, { generationId });
    await record.update({ status: "processing" });

    // Step 1: Generate Gemini prompt for the Veo video
    let prompt = record.prompt;
    if (!prompt) {
      logger.info("VIDEO_WORKER_GEMINI_PROMPT", `Generating Gemini video prompt for "${record.topic}"...`, { generationId });
      prompt = await generateEducationalVideoPrompt({
        topic: record.topic,
        classLevel: record.class_id,
        duration: record.duration,
        userId,
        refId: generationId,
      });
      await record.update({ prompt });
    }

    // Step 2: Run diagram generation (Imagen) AND Veo video concurrently
    logger.info("VIDEO_WORKER_CONCURRENT_START", `Starting concurrent diagram + Veo tasks for #${generationId}...`, { generationId });

    const [diagramResult, videoResult] = await Promise.allSettled([
      generateEducationalDiagram({
        topic: record.topic,
        classLevel: record.class_id,
        subjectName: record.subject_name,
        schoolId: record.school_id,
        classId: record.class_id,
        userId,
        refId: generationId,
      }),
      submitTextToVideoTask({
        prompt,
        duration: record.duration || "6",
        schoolId: record.school_id,
        classId: record.class_id,
        subjectName: record.subject_name,
        topic: record.topic,
      }),
    ]);

    // Step 3: Collect whichever results succeeded
    const updates = { completed_at: new Date() };
    let anySuccess = false;
    const errors = [];

    // Diagram result
    if (diagramResult.status === "fulfilled" && diagramResult.value) {
      const { imagePath, imageUrl, summary } = diagramResult.value;
      updates.image_path = imagePath;
      updates.image_url = imageUrl;
      if (summary) updates.summary = summary;
      anySuccess = true;
      logger.info("VIDEO_WORKER_DIAGRAM_OK", `Diagram saved for #${generationId}: ${imageUrl}`, { generationId });
    } else {
      const reason = diagramResult.reason?.message || "Diagram generation failed";
      errors.push(`diagram: ${reason}`);
      logger.warn("VIDEO_WORKER_DIAGRAM_FAILED", `Diagram failed for #${generationId}: ${reason}`, { generationId });
      if (userId) {
        logger.info("VIDEO_WORKER_DIAGRAM_REFUND", `Refunding image_generations quota for #${generationId}`, { generationId, userId });
        await refundGenerationQuotas({ userId, generationId, resourceTypes: ["image_generations"] });
      }
    }

    // Video result
    if (videoResult.status === "fulfilled" && videoResult.value?.videoUrl) {
      const veoResult = videoResult.value;
      const { filePath, publicUrl } = await downloadAndSaveVideo({ videoUrl: veoResult.videoUrl });
      updates.video_path = filePath;
      updates.video_url = publicUrl;
      if (veoResult.operationName) updates.operation_name = veoResult.operationName;
      anySuccess = true;
      logger.info("VIDEO_WORKER_VEO_OK", `Video saved for #${generationId}: ${publicUrl}`, { generationId });
    } else {
      const reason = videoResult.reason?.message || "Veo video generation failed";
      errors.push(`video: ${reason}`);
      logger.warn("VIDEO_WORKER_VEO_FAILED", `Veo failed for #${generationId}: ${reason}`, { generationId });

      if (userId) {
        logger.info("VIDEO_WORKER_VEO_REFUND", `Refunding video_seconds quota for #${generationId} (User #${userId})`, { generationId, userId });
        await refundGenerationQuotas({ userId, generationId, resourceTypes: ["video_seconds"] });
      }
    }

    // Step 4: Update record
    if (anySuccess) {
      updates.status = "completed";
      if (errors.length > 0) {
        updates.error_message = `Partial: ${errors.join("; ")}`;
      }
      logger.info("VIDEO_WORKER_COMPLETE", `Generation #${generationId} complete (partial=${errors.length > 0})`, { generationId, updates });
    } else {
      updates.status = "failed";
      updates.error_message = errors.join("; ") || "Both diagram and video generation failed";
      logger.error("VIDEO_WORKER_ALL_FAILED", `All tasks failed for #${generationId}: ${updates.error_message}`, { generationId });

      // Refund all deducted quotas on total failure
      if (userId) {
        logger.info("VIDEO_WORKER_TOTAL_REFUND", `Refunding all quotas for failed generation #${generationId}`, { generationId, userId });
        await refundGenerationQuotas({ userId, generationId });
      }
    }

    await record.update(updates);
  } catch (error) {
    logger.error("VIDEO_WORKER_EXCEPTION", `Unexpected error processing #${generationId}: ${error.message}`, { generationId, error: error.message });
    await record.update({
      status: "failed",
      error_message: error.message || "Unexpected background error occurred",
    });

    // Refund quotas on uncaught exception
    if (userId) {
      try {
        await refundGenerationQuotas({ userId, generationId });
      } catch (refundErr) {
        logger.error("VIDEO_WORKER_REFUND_ERROR", `Failed to issue quota refund for #${generationId}: ${refundErr.message}`, { generationId });
      }
    }
  }
}

/**
 * Queue a new "diagram_and_video" generation task
 */
export function enqueueVideoGeneration(generationId) {
  logger.info("VIDEO_QUEUE_ENQUEUE", `Enqueuing VideoGeneration ID #${generationId}...`, { generationId });

  setImmediate(() => {
    processVideoGeneration(generationId).catch((err) => {
      logger.error("VIDEO_QUEUE_WORKER_ERROR", `Background process error for ID #${generationId}: ${err.message}`, { generationId, error: err.message });
    });
  });
}
