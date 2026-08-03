import VideoGeneration from "./video-generation.model.js";
import { enqueueVideoGeneration } from "./services/video-queue.service.js";
import { generateEducationalDiagram } from "./services/gemini-image.service.js";
import AppError from "../../shared/appError.js";
import Teacher from "../teachers/teacher.model.js";
import Student from "../students/student.model.js";
import Class from "../classes/classes.model.js";
import { Op, fn, col } from "sequelize";
import AiChatLog from "../ai-chat-logs/ai-chat-log.model.js";
import { Storage } from "@google-cloud/storage";
import {
  checkAndDeductImageGeneration,
  checkAndDeductVideoSeconds,
  refundGenerationQuotas,
} from "../tokens/token.service.js";

/**
 * Serialise a VideoGeneration row to a plain JSON object suitable for API responses.
 * Always includes image_url, image_path, summary, and content_type alongside the video fields.
 */
function serializeVideoGen(v) {
  const json = v.toJSON ? v.toJSON() : { ...v };
  json.stream_url = `/api/ai/videos/stream/${v.id}`;

  // Ensure image_url resolves to a valid public HTTPS URL if image_path is present
  if (!json.image_url && json.image_path) {
    if (json.image_path.startsWith("gs://")) {
      const match = json.image_path.match(/^gs:\/\/([^/]+)\/(.+)$/);
      if (match) {
        json.image_url = `https://storage.googleapis.com/${match[1]}/${match[2]}`;
      }
    } else if (json.image_path.startsWith("http://") || json.image_path.startsWith("https://")) {
      json.image_url = json.image_path;
    }
  } else if (json.image_url && json.image_url.startsWith("gs://")) {
    const match = json.image_url.match(/^gs:\/\/([^/]+)\/(.+)$/);
    if (match) {
      json.image_url = `https://storage.googleapis.com/${match[1]}/${match[2]}`;
    }
  }

  json.imageUrl = json.image_url || null;
  return json;
}

/**
 * POST /api/ai/videos
 * Create a new generation job.
 */
export async function createVideoGeneration(req, res, next) {
  try {
    const {
      classId,
      sectionId,
      subjectId,
      subjectName,
      topic,
      language,
      duration,
      content_type = "diagram_only",
    } = req.body;

    if (!topic || !topic.trim()) {
      throw new AppError("Topic is required to generate educational content", 400);
    }

    if (!subjectId && (!subjectName || !subjectName.trim())) {
      throw new AppError("Subject selection is required", 400);
    }

    const cleanDuration = ["4", "6", "8"].includes(String(duration)) ? String(duration) : "6";
    const durationSec = parseInt(cleanDuration, 10);
    const isDiagramAndVideo = content_type === "diagram_and_video";

    // Resolve teacher and school
    let teacherId = null;
    let schoolId = req.user?.school_id || 1;

    if (req.user?.role === "teacher") {
      const teacherProfile = await Teacher.findOne({ where: { user_id: req.user.id } });
      if (teacherProfile) {
        teacherId = teacherProfile.id;
        if (teacherProfile.school_id) schoolId = teacherProfile.school_id;
      }
    }

    // Resolve class ID
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
    const resolvedSubjectName = subjectName ? subjectName.trim() : "General";

    // Idempotency Check: Return completed job for identical request within 15 seconds
    const fifteenSecsAgo = new Date(Date.now() - 15000);
    const existingJob = await VideoGeneration.findOne({
      where: {
        teacher_id: teacherId,
        topic: topic.trim(),
        subject_name: resolvedSubjectName,
        content_type,
        status: "completed",
        createdAt: { [Op.gte]: fifteenSecsAgo },
      },
      order: [["createdAt", "DESC"]],
    });

    if (existingJob) {
      return res.status(200).json({
        status: "success",
        message: "Diagram generated successfully",
        data: {
          jobId: existingJob.id,
          status: "completed",
          contentType: existingJob.content_type,
          topic: existingJob.topic,
          imageUrl: existingJob.image_url,
          summary: existingJob.summary,
        },
      });
    }

    // Create DB record first to get reference ID
    const videoGen = await VideoGeneration.create({
      school_id: schoolId,
      teacher_id: teacherId,
      class_id: targetClassId,
      section_id: sectionId || null,
      subject_id: subjectId || null,
      subject_name: resolvedSubjectName,
      topic: topic.trim(),
      language: cleanLanguage,
      duration: cleanDuration,
      content_type,
      status: "processing",
    });

    // Atomic quota checks & deductions with row locking
    try {
      if (req.user?.id) {
        // Deduct 1 diagram generation quota
        await checkAndDeductImageGeneration({
          userId: req.user.id,
          count: 1,
          reason: "ai_diagram_generation",
          refId: videoGen.id,
        });

        // If video option selected, deduct video seconds
        if (isDiagramAndVideo) {
          await checkAndDeductVideoSeconds({
            userId: req.user.id,
            durationSec,
            reason: "veo_3_video_generation",
            refId: videoGen.id,
          });
        }
      }
    } catch (quotaErr) {
      await videoGen.destroy();
      throw quotaErr;
    }

    // ── DIAGRAM ONLY: handle synchronously and respond immediately ──────────────
    if (!isDiagramAndVideo) {
      const diagramResult = await generateEducationalDiagram({
        topic: videoGen.topic,
        classLevel: targetClassId,
        subjectName: videoGen.subject_name,
        classId: targetClassId,
        userId: req.user?.id,
        refId: videoGen.id,
      });

      if (diagramResult) {
        await videoGen.update({
          status: "completed",
          image_path: diagramResult.imagePath,
          image_url: diagramResult.imageUrl,
          summary: diagramResult.summary,
          completed_at: new Date(),
        });

        return res.status(201).json({
          status: "success",
          message: "Diagram generated successfully",
          data: {
            jobId: videoGen.id,
            status: "completed",
            contentType: "diagram_only",
            topic: videoGen.topic,
            imageUrl: diagramResult.imageUrl,
            summary: diagramResult.summary,
          },
        });
      } else {
        if (req.user?.id) {
          await refundGenerationQuotas({ userId: req.user.id, generationId: videoGen.id });
        }
        await videoGen.update({
          status: "failed",
          error_message: "Diagram generation failed. Please try again.",
        });

        throw new AppError("Diagram generation failed. Please try again.", 500);
      }
    }

    // ── DIAGRAM + VIDEO: enqueue background processing ──────────────────────────
    enqueueVideoGeneration(videoGen.id);

    return res.status(201).json({
      status: "success",
      message: "Content generation job created — diagram and video will be ready shortly",
      data: {
        jobId: videoGen.id,
        status: "processing",
        contentType: "diagram_and_video",
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
 * Poll status of a specific generation job.
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
        status: videoGen.status,
        contentType: videoGen.content_type || "diagram_and_video",
        videoUrl: videoGen.video_url || streamUrl,
        streamUrl,
        gcsPublicUrl: videoGen.video_url,
        imageUrl: videoGen.image_url || null,
        summary: videoGen.summary || null,
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
 * Get content generated by the calling teacher.
 * Supports pagination (`page`, `limit`) and subject filtering (`subjectName`).
 * Also returns subject counts for folder view.
 */
export async function getTeacherVideos(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const subjectFilter = req.query.subjectName || req.query.subject;

    // Auto-cleanup: Mark any stale jobs stuck in "processing" for > 10 minutes as "failed" and refund quotas
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    const staleJobs = await VideoGeneration.findAll({
      where: {
        status: "processing",
        createdAt: { [Op.lt]: tenMinsAgo },
      },
    });

    for (const staleJob of staleJobs) {
      if (req.user?.id) {
        try {
          await refundGenerationQuotas({ userId: req.user.id, generationId: staleJob.id });
        } catch (rErr) {
          // ignore refund errors if already refunded
        }
      }
      await staleJob.update({ status: "failed", error_message: "Generation timed out" });
    }

    let baseWhere = {
      status: { [Op.in]: ["completed", "processing"] },
    };

    if (req.user?.role === "teacher") {
      const teacherProfile = await Teacher.findOne({ where: { user_id: req.user.id } });
      if (teacherProfile) {
        baseWhere.teacher_id = teacherProfile.id;
      }
    }

    // Get subject counts for folder cards
    const subjectCountsRaw = await VideoGeneration.findAll({
      attributes: ["subject_name", [fn("COUNT", col("id")), "count"]],
      where: baseWhere,
      group: ["subject_name"],
      raw: true,
    });

    const subjects = subjectCountsRaw.map((s) => ({
      subject_name: s.subject_name || "General",
      count: parseInt(s.count, 10) || 0,
    }));

    // Filter by specific subject if selected
    let itemWhere = { ...baseWhere };
    if (subjectFilter) {
      itemWhere.subject_name = subjectFilter;
    }

    const { count: total, rows: rawVideos } = await VideoGeneration.findAndCountAll({
      where: itemWhere,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const videos = rawVideos.map(serializeVideoGen);
    const totalPages = Math.ceil(total / limit);

    res.json({
      status: "success",
      data: {
        videos,
        subjects,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ai/videos/student/class-videos
 * Get completed content for student's class, grouped by subject_name with pagination.
 */
export async function getStudentClassVideos(req, res, next) {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      throw new AppError("Student profile not found", 404);
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const subjectFilter = req.query.subjectName || req.query.subject;

    let baseWhere = {
      class_id: student.class_id,
      status: "completed",
    };

    // Get subject list for student folder view
    const subjectCountsRaw = await VideoGeneration.findAll({
      attributes: ["subject_name", [fn("COUNT", col("id")), "count"]],
      where: baseWhere,
      group: ["subject_name"],
      raw: true,
    });

    const subjectCounts = subjectCountsRaw.map((s) => ({
      subject_name: s.subject_name || "General",
      count: parseInt(s.count, 10) || 0,
    }));

    // Filter items if subject specified
    let itemWhere = { ...baseWhere };
    if (subjectFilter) {
      itemWhere.subject_name = subjectFilter;
    }

    const { count: total, rows: rawVideos } = await VideoGeneration.findAndCountAll({
      where: itemWhere,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const videos = rawVideos.map(serializeVideoGen);
    const totalPages = Math.ceil(total / limit);

    // Group items by subject
    const subjectMap = new Map();
    for (const vid of videos) {
      const key = vid.subject_name || "General";
      if (!subjectMap.has(key)) subjectMap.set(key, []);
      subjectMap.get(key).push(vid);
    }

    const subjects = Array.from(subjectMap.entries()).map(([subject_name, items]) => ({
      subject_name,
      items,
    }));

    res.json({
      status: "success",
      data: {
        subjects,
        subjectCounts,
        videos,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/ai/videos/:id
 * Delete a video/diagram generation record.
 * RBAC Enforced: Only Super Admin, School Admin, or the owning Teacher can delete.
 */
export async function deleteVideoGeneration(req, res, next) {
  try {
    const { id } = req.params;
    const videoGen = await VideoGeneration.findByPk(id);

    if (!videoGen) {
      throw new AppError("Video generation record not found", 404);
    }

    // Permission check
    const userRole = req.user?.role;
    const isSchoolOrSuperAdmin = userRole === "school_admin" || userRole === "super_admin";

    let isOwner = false;
    if (userRole === "teacher") {
      const teacherProfile = await Teacher.findOne({ where: { user_id: req.user.id } });
      if (teacherProfile && String(teacherProfile.id) === String(videoGen.teacher_id)) {
        isOwner = true;
      }
    }

    if (!isSchoolOrSuperAdmin && !isOwner) {
      throw new AppError("Forbidden: You do not have permission to delete this content", 403);
    }

    await videoGen.destroy();

    res.json({
      status: "success",
      message: "Content generation record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/ai/videos/stream/:id
 * Streams video directly from GCS or redirects to public GCS URL.
 */
export async function streamVideo(req, res, next) {
  try {
    const { id } = req.params;
    const videoGen = await VideoGeneration.findByPk(id);

    if (!videoGen) {
      throw new AppError("Video record not found", 404);
    }

    const gcsUri = videoGen.video_url || videoGen.video_path;
    if (!gcsUri) {
      throw new AppError("No video file associated with this record", 404);
    }

    if (gcsUri.startsWith("http://") || gcsUri.startsWith("https://")) {
      return res.redirect(302, gcsUri);
    }

    let bucketName = null;
    let objectPath = null;

    if (gcsUri.startsWith("gs://")) {
      const match = gcsUri.match(/^gs:\/\/([^/]+)\/(.+)$/);
      if (match) {
        bucketName = match[1];
        objectPath = match[2];
      }
    }

    if (!bucketName || !objectPath) {
      return res.redirect(302, gcsUri);
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
    const fileContentType = metadata.contentType || "video/mp4";

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
        "Content-Type": fileContentType,
        "Access-Control-Allow-Origin": "*",
      });

      file.createReadStream({ start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": fileContentType,
        "Access-Control-Allow-Origin": "*",
      });

      file.createReadStream().pipe(res);
    }
  } catch (error) {
    next(error);
  }
}
