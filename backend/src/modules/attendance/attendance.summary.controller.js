import asyncHandler from "../../shared/asyncHandler.js";
import Attendance from "./attendance.model.js";
import {
  markAttendanceService,
  getTeacherAttendanceSummaryService,
  getStudentAttendanceSummaryService,
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
   TEACHER: GET SESSION ATTENDANCE RECORDS
========================= */
export const getSessionAttendance = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const records = await Attendance.findAll({
    where: {
      teacher_class_session_id: sessionId,
      school_id: req.user.school_id,
    },
    attributes: ["student_id", "status"],
  });
  res.json({
    success: true,
    records,
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
