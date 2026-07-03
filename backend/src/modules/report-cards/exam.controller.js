import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import Student from "../students/student.model.js";

import {
  createExamService,
  lockExamService,
  listExamsByClassService,
  upsertExamSubjectService,
  removeExamSubjectService,
} from "./exam.service.js";

/* ADMIN/TEACHER: Create exam with subject schedule */
export const createExam = asyncHandler(async (req, res) => {
  const exam = await createExamService({
    school_id: req.user.school_id,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    data: exam,
  });
});

/* ADMIN: Lock / unlock exam */
export const lockExam = asyncHandler(async (req, res) => {
  const exam = await lockExamService({
    exam_id: Number(req.params.id),
    school_id: req.user.school_id,
    is_locked: req.body.is_locked,
  });

  res.json({
    success: true,
    data: exam,
  });
});

/* ALL: List exams for a class (include subject schedule) */
export const listExamsByClass = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  let class_id = req.query.class_id ? Number(req.query.class_id) : null;

  if (!class_id && req.user.role === "student") {
    const student = await Student.findOne({
      where: { user_id: req.user.id, school_id },
      attributes: ["class_id"],
    });
    class_id = student?.class_id || null;
  }

  if (!class_id) {
    throw new AppError("CLASS_ID_REQUIRED", 400);
  }

  const result = await listExamsByClassService({
    school_id,
    class_id,
    query: req.query,
  });

  res.json({
    success: true,
    total: result.count,
    items: result.rows,
  });
});

/* ADMIN/TEACHER: Add or update a subject entry on an exam */
export const upsertExamSubject = asyncHandler(async (req, res) => {
  const row = await upsertExamSubjectService({
    exam_id: Number(req.params.id),
    school_id: req.user.school_id,
    ...req.body,
  });
  res.json({ success: true, data: row });
});

/* ADMIN/TEACHER: Remove a subject from an exam */
export const removeExamSubject = asyncHandler(async (req, res) => {
  await removeExamSubjectService({
    exam_id: Number(req.params.id),
    subject_id: Number(req.params.subject_id),
    school_id: req.user.school_id,
  });
  res.json({ success: true, message: "Subject removed from exam" });
});
