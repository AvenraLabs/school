import axios from "axios";
import AppError from "../../../shared/appError.js";

const KLING_BASE_URL = process.env.KLING_BASE_URL || "https://api-singapore.klingai.com";

function getKlingHeaders() {
  const apiKey = process.env.KLING_API_KEY;
  if (!apiKey) {
    throw new AppError("KLING_API_KEY environment variable is not configured on server", 500);
  }
  return {
    Authorization: `Bearer ${apiKey.trim()}`,
    "Content-Type": "application/json",
  };
}

/**
 * Submit Text-to-Video generation task to Kling AI (Kling 2.6)
 */
export async function submitTextToVideoTask({ prompt, duration = "5", mode = "std", aspect_ratio = "16:9" }) {
  if (process.env.MOCK_KLING_VIDEO === "true") {
    console.log("[KlingAI Mock Mode] Submitting mock video task...");
    return { taskId: `mock_job_${Date.now()}`, status: "submitted" };
  }

  try {
    const url = `${KLING_BASE_URL}/v1/videos/text2video`;
    const payload = {
      model_name: "kling-v2-6",
      prompt,
      duration: String(duration),
      mode,
      aspect_ratio,
    };

    console.log(`[KlingAI] Submitting Text2Video task (Model: kling-v2-6, Duration: ${duration}s)...`);
    const res = await axios.post(url, payload, { headers: getKlingHeaders(), timeout: 30000 });

    if (res.data && res.data.code === 0 && res.data.data?.task_id) {
      const taskId = res.data.data.task_id;
      console.log(`[KlingAI] Task submitted successfully. Task ID: ${taskId}`);
      return { taskId, status: "submitted" };
    }

    // Handle API response error
    const msg = res.data?.message || "Failed to submit video task to Kling AI";
    console.error("[KlingAI] Submission failed:", res.data);
    throw new AppError(`Kling AI Error: ${msg}`, 500);
  } catch (err) {
    if (err instanceof AppError) throw err;
    const errorMsg = err.response?.data?.message || err.message;
    console.error("[KlingAI] Exception submitting video task:", errorMsg);
    throw new AppError(`Kling AI Request Failed: ${errorMsg}`, 500);
  }
}

/**
 * Query task status from Kling AI
 */
export async function queryKlingTaskStatus(taskId) {
  if (String(taskId).startsWith("mock_job_") || process.env.MOCK_KLING_VIDEO === "true") {
    console.log(`[KlingAI Mock Mode] Returning mock completed video URL for task ${taskId}...`);
    return {
      status: "succeed",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      errorMessage: null,
    };
  }

  try {
    const url = `${KLING_BASE_URL}/v1/videos/text2video/${taskId}`;
    const res = await axios.get(url, { headers: getKlingHeaders(), timeout: 20000 });

    if (res.data && res.data.code === 0 && res.data.data) {
      const data = res.data.data;
      const status = data.task_status; // "submitted", "processing", "succeed", "failed"
      
      let videoUrl = null;
      let errorMessage = null;

      if (status === "succeed") {
        videoUrl = data.task_result?.videos?.[0]?.url || null;
      } else if (status === "failed") {
        errorMessage = data.task_status_msg || "Video generation failed on Kling AI server";
      }

      return {
        status,
        videoUrl,
        errorMessage,
        raw: data,
      };
    }

    const msg = res.data?.message || "Failed to query task status";
    throw new AppError(`Kling Status Error: ${msg}`, 500);
  } catch (err) {
    if (err instanceof AppError) throw err;
    const errorMsg = err.response?.data?.message || err.message;
    console.error(`[KlingAI] Exception querying task status (${taskId}):`, errorMsg);
    throw new AppError(`Kling Status Query Failed: ${errorMsg}`, 500);
  }
}
