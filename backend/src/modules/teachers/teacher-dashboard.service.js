import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import Timetable from "../timetables/timetable.model.js";
import Homework from "../homework/homework.model.js";
import HomeworkSubmission from "../homework/homework-submission.model.js";
import Student from "../students/student.model.js";
import TeacherAssignment from "../teacher-assignments/teacher-assignment.model.js";
import TokenAccount from "../tokens/token-account.model.js";
import { ensureTokenAccount } from "../tokens/token.service.js";
import AiChatLog from "../ai-chat-logs/ai-chat-log.model.js";

const getToday = () => new Date().toISOString().slice(0, 10);
const getDayName = () =>
  new Date()
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();

const ALLOWED_DAYS = new Set([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]);

export const getTeacherDashboardService = async ({
  school_id,
  teacher_id,
  user_id,
}) => {
  const today = getToday();
  const day = getDayName();

  /* 1) Classes handled by teacher */
  const assignments = await TeacherAssignment.findAll({
    where: {
      school_id,
      teacher_id,
      is_active: true,
    },
    attributes: ["class_id", "section_id"],
  });

  const classIds = [...new Set(assignments.map((a) => a.class_id))];
  const sectionIds = assignments.map((a) => a.section_id);

  const classes = classIds.length
    ? await Class.findAll({
        where: { school_id, id: classIds },
        include: [
          {
            model: Section,
            where: { id: sectionIds },
            required: true,
          },
        ],
      })
    : [];

  /* 2) Timetable (today) */
  const timetable =
    classIds.length && ALLOWED_DAYS.has(day)
      ? await Timetable.findAll({
          where: {
            school_id,
            class_id: classIds,
            section_id: sectionIds,
            day_of_week: day,
          },
          order: [["start_time", "ASC"]],
        })
      : [];

  /* 3) Homework (today) */
  const homework = classIds.length
    ? await Homework.findAll({
        where: {
          school_id,
          class_id: classIds,
          section_id: sectionIds,
          homework_date: today,
        },
      })
    : [];

  const homeworkIds = homework.map((h) => h.id);

  /* 4) Homework completion */
  const submissions = await HomeworkSubmission.findAll({
    where: { homework_id: homeworkIds },
  });

  const submissionCountMap = {};
  submissions.forEach((s) => {
    if (!submissionCountMap[s.homework_id]) {
      submissionCountMap[s.homework_id] = 0;
    }
    if (s.is_completed) {
      submissionCountMap[s.homework_id]++;
    }
  });

  const homeworkSummary = await Promise.all(
    homework.map(async (h) => {
      const totalStudents = await Student.count({
        where: {
          class_id: h.class_id,
          section_id: h.section_id,
          is_active: true,
        },
      });

      return {
        homework_id: h.id,
        class_id: h.class_id,
        section_id: h.section_id,
        description: h.description,
        completed: submissionCountMap[h.id] || 0,
        total_students: totalStudents,
        pending: totalStudents - (submissionCountMap[h.id] || 0),
      };
    })
  );

  /* 5) Pending report cards */
  const pendingReportCards = 0;

  // 6) AI Tokens & AI Video Seconds (lifetime used + current balance)
  await ensureTokenAccount(user_id);
  const tokenAccount = await TokenAccount.findOne({
    where: { user_id },
    attributes: ["balance", "video_seconds_balance", "image_generation_balance"],
  });

  const usedTotal = await AiChatLog.sum("tokens_used", {
    where: { user_id },
  });
  const used = usedTotal || 0;
  const remaining = tokenAccount?.balance ?? 0;
  const total = used + remaining;

  // Video Seconds Calculation
  const videoRemaining = tokenAccount?.video_seconds_balance ?? 0;
  let videoUsed = 0;
  let imageUsed = 0;
  if (teacher_id) {
    const VideoGeneration = (await import("../ai-video/video-generation.model.js")).default;
    const videos = await VideoGeneration.findAll({
      where: { teacher_id },
      attributes: ["duration", "content_type", "image_url"],
    });
    videoUsed = videos.reduce((sum, v) => sum + (parseInt(v.duration, 10) || 5), 0);
    imageUsed = videos.filter((v) => v.content_type === "diagram_only" || Boolean(v.image_url)).length;
  }
  const videoTotal = videoUsed + videoRemaining;

  // Diagram / Image Generation Calculation
  const imageRemaining = tokenAccount?.image_generation_balance ?? 0;
  const imageTotal = imageUsed + imageRemaining;

  return {
    classes,
    timetable,
    homework_summary: homeworkSummary,
    pending_report_cards: pendingReportCards,
    ai_tokens: { total, used, remaining },
    ai_video_seconds: { total: videoTotal, used: videoUsed, remaining: videoRemaining },
    ai_diagram_images: { total: imageTotal, used: imageUsed, remaining: imageRemaining },
  };
};
