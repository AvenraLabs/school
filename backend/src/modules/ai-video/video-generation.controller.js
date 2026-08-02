import VideoGeneration from "./video-generation.model.js";
import { enqueueVideoGeneration } from "./services/video-queue.service.js";
import AppError from "../../shared/appError.js";
import Teacher from "../teachers/teacher.model.js";
import Student from "../students/student.model.js";
import Class from "../classes/classes.model.js";
import { Op } from "sequelize";
import AiChatLog from "../ai-chat-logs/ai-chat-log.model.js";
import { Storage } from "@google-cloud/storage";
import {
  deductTokens,
  ensureTokenAccount,
  assertHasTokenBalance,
  assertHasVideoSecondsBalance,
  deductVideoSeconds,
} from "../tokens/token.service.js";

/**
 * POST /api/ai/videos
 * Create a new AI Video generation job
 */
export async function createVideoGeneration(req, res, next) {
  try {
    const { classId, sectionId, subjectId, subjectName, topic, language, duration } = req.body;

    if (!topic || !topic.trim()) {
      throw new AppError("Topic is required to generate an educational video", 400);
    }

    const cleanDuration = ["4", "6", "8"].includes(String(duration)) ? String(duration) : "6";
    const durationSec = parseInt(cleanDuration, 10);

    // Check AI Gemini Token Balance & Veo 3 Video Seconds quota BEFORE creating job
    if (req.user?.id) {
      await assertHasTokenBalance(req.user.id);
      await assertHasVideoSecondsBalance(req.user.id, durationSec);
    }

    // Determine Teacher ID
    let teacherId = null;
    let schoolId = req.user?.school_id || 1;

    if (req.user?.role === "teacher") {
      const teacherProfile = await Teacher.findOne({ where: { user_id: req.user.id } });
      if (teacherProfile) {
        teacherId = teacherProfile.id;
        if (teacherProfile.school_id) schoolId = teacherProfile.school_id;
      }
    }

    // Resolve target Class record ID for Class level sharing across all sections (e.g. Class 6)
    let targetClassId = null;
    if (classId) {
      const parsed = parseInt(classId, 10);
      const foundClass = await Class.findOne({
        where: {
          school_id: schoolId,
          [Op.or]: [
            { id: isNaN(parsed) ? -1 : parsed },
            { class_name: String(classId) },
            { class_name: `Class ${classId}` },
            { class_name: `Grade ${classId}` },
          ],
        },
      });
      if (foundClass) {
        targetClassId = foundClass.id;
      } else if (!isNaN(parsed)) {
        targetClassId = parsed;
      }
    }

    const cleanLanguage = language || "English";

    // Create DB Record
    const videoGen = await VideoGeneration.create({
      school_id: schoolId,
      teacher_id: teacherId,
      class_id: targetClassId,
      section_id: sectionId || null,
      subject_id: subjectId || null,
      subject_name: subjectName || "Science",
      topic: topic.trim(),
      language: cleanLanguage,
      duration: cleanDuration,
      status: "pending",
    });

    // Deduct Gemini Tokens & Veo 3 Video Seconds
    if (req.user?.id) {
      const tokensUsed = 250;
      const log = await AiChatLog.create({
        user_id: req.user.id,
        user_query: topic.trim(),
        ai_response: `AI Video Generation queued (${cleanDuration}s) for topic: ${topic.trim()}`,
        tokens_used: tokensUsed,
        model_used: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
        ai_type: "summary",
        class_level: String(targetClassId || ""),
      });

      await deductTokens({
        userId: req.user.id,
        amount: tokensUsed,
        reason: "ai_video_scene_generation",
        refId: videoGen.id,
      });

      await deductVideoSeconds({
        userId: req.user.id,
        durationSec,
        reason: "veo_3_video_generation",
        refId: videoGen.id,
      });
    }

    // Enqueue background processing
    enqueueVideoGeneration(videoGen.id);

    res.status(201).json({
      status: "success",
      message: "Video generation job created successfully",
      data: {
        jobId: videoGen.id,
        status: "processing",
        topic: videoGen.topic,
        duration: videoGen.duration,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ai/videos/:id
 * Poll status of a specific video generation job
 */
export async function getVideoGenerationStatus(req, res, next) {
  try {
    const { id } = req.params;
    const videoGen = await VideoGeneration.findByPk(id);

    if (!videoGen) {
      throw new AppError("Video generation job not found", 404);
    }

    const streamUrl = `/api/ai/videos/stream/${videoGen.id}`;

    res.json({
      status: "success",
      data: {
        id: videoGen.id,
        status: videoGen.status, // "pending", "processing", "completed", "failed"
        videoUrl: streamUrl || videoGen.video_url,
        streamUrl,
        gcsPublicUrl: videoGen.video_url,
        topic: videoGen.topic,
        subjectName: videoGen.subject_name,
        duration: videoGen.duration,
        errorMessage: videoGen.error_message,
        completedAt: videoGen.completed_at,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ai/videos/teacher/my-videos
 * Get all videos generated by teacher
 */
export async function getTeacherVideos(req, res, next) {
  try {
    let whereClause = {};

    if (req.user?.role === "teacher") {
      const teacherProfile = await Teacher.findOne({ where: { user_id: req.user.id } });
      if (teacherProfile) {
        whereClause.teacher_id = teacherProfile.id;
      }
    }

    const rawVideos = await VideoGeneration.findAll({
      where: whereClause,
      order: [["created_at", "DESC"]],
      limit: 30,
    });

    const videos = rawVideos.map((v) => {
      const json = v.toJSON();
      json.stream_url = `/api/ai/videos/stream/${v.id}`;
      return json;
    });

    res.json({
      status: "success",
      data: {
        videos,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ai/videos/student/class-videos
 * Get all completed videos for student's class
 */
export async function getStudentClassVideos(req, res, next) {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      throw new AppError("Student profile not found", 404);
    }

    const rawVideos = await VideoGeneration.findAll({
      where: {
        class_id: student.class_id,
        status: "completed",
      },
      order: [["created_at", "DESC"]],
      limit: 30,
    });

    const videos = rawVideos.map((v) => {
      const json = v.toJSON();
      json.stream_url = `/api/ai/videos/stream/${v.id}`;
      return json;
    });

    res.json({
      status: "success",
      data: {
        videos,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/ai/videos/:id
 * Delete a video generation job
 */
export async function deleteVideoGeneration(req, res, next) {
  try {
    const { id } = req.params;
    const videoGen = await VideoGeneration.findByPk(id);

    if (!videoGen) {
      throw new AppError("Video generation record not found", 404);
    }

    await videoGen.destroy();

    res.json({
      status: "success",
      message: "Video generation job deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ai/videos/stream/:id
 * Streams video directly from GCS with HTTP 206 partial content support
 */
export async function streamVideo(req, res, next) {
  try {
    const { id } = req.params;
    const videoGen = await VideoGeneration.findByPk(id);

    if (!videoGen) {
      throw new AppError("Video record not found", 404);
    }

    const gcsUri = videoGen.video_path || videoGen.video_url;
    if (!gcsUri) {
      throw new AppError("No video file associated with this record", 404);
    }

    let bucketName = null;
    let objectPath = null;

    if (gcsUri.startsWith("gs://")) {
      const match = gcsUri.match(/^gs:\/\/([^\/]+)\/(.+)$/);
      if (match) {
        bucketName = match[1];
        objectPath = match[2];
      }
    } else if (gcsUri.startsWith("https://storage.googleapis.com/")) {
      const match = gcsUri.match(/^https:\/\/storage\.googleapis\.com\/([^\/]+)\/(.+)$/);
      if (match) {
        bucketName = match[1];
        objectPath = match[2];
      }
    }

    if (!bucketName || !objectPath) {
      return res.redirect(gcsUri);
    }

    const project = process.env.GCP_PROJECT || process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
    const storage = new Storage({ projectId: project });
    const file = storage.bucket(bucketName).file(objectPath);

    const [exists] = await file.exists();
    if (!exists) {
      throw new AppError("Video file does not exist in Cloud Storage bucket", 404);
    }

    const [metadata] = await file.getMetadata();
    const fileSize = parseInt(metadata.size, 10);
    const contentType = metadata.contentType || "video/mp4";

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      });

      file.createReadStream({ start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      });

      file.createReadStream().pipe(res);
    }
  } catch (error) {
    next(error);
  }
}


