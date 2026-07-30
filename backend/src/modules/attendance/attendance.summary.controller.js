import asyncHandler from "../../shared/asyncHandler.js";
import Attendance from "./attendance.model.js";
import {
  markAttendanceService,
  getDailyAttendanceService,
  getTeacherAttendanceSummaryService,
  getStudentAttendanceSummaryService,
  sendAbsentWhatsAppService,
} from "./attendance.summary.service.js";

/* =========================
   TEACHER: MARK
========================= */
export const markAttendance = asyncHandler(async (req, res) => {
  await markAttendanceService({
    user: req.user,
    school_id: req.user.school_id,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    message: "Attendance marked successfully",
  });
});

/* =========================
   TEACHER: MANUAL ABSENT WHATSAPP
========================= */
export const sendAbsentWhatsApp = asyncHandler(async (req, res) => {
  const result = await sendAbsentWhatsAppService({
    school_id: req.user.school_id,
    user: req.user,
    class_id: Number(req.body.class_id),
    section_id: Number(req.body.section_id),
    date: req.body.date,
  });

  res.json({
    success: true,
    data: result,
  });
});

/* =========================
   TEACHER: GET DAILY ATTENDANCE RECORDS
========================= */
export const getDailyAttendance = asyncHandler(async (req, res) => {
  const { class_id, section_id, date } = req.query;
  const result = await getDailyAttendanceService({
    school_id: req.user.school_id,
    class_id: Number(class_id),
    section_id: Number(section_id),
    date,
    user: req.user,
  });
  res.json({
    success: true,
    ...result,
  });
});

/* =========================
   TEACHER: SUMMARY
========================= */
export const getTeacherAttendanceSummary = asyncHandler(async (req, res) => {
  const result = await getTeacherAttendanceSummaryService({
    school_id: req.user.school_id,
    query: req.query,
    teacher_id: req.user.teacher_id,
  });

  res.json({
    total: result.count,
    items: result.rows,
  });
});

/* =========================
   STUDENT: SUMMARY
========================= */
export const getStudentAttendanceSummary = asyncHandler(async (req, res) => {
  const result = await getStudentAttendanceSummaryService({
    student_user_id: req.user.id,
    query: req.query,
  });

  res.json({
    total: result.count,
    items: result.rows,
  });
});
