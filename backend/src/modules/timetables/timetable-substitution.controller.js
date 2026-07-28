import asyncHandler from "../../shared/asyncHandler.js";
import {
  getTeacherPeriodsForDateService,
  getAvailableSubstitutesService,
  saveSubstitutionsService,
  getTodaySubstitutionsService,
} from "./timetable-substitution.service.js";

/* Get teacher's periods for today's weekday */
export const getTeacherPeriodsForDate = asyncHandler(async (req, res) => {
  const { teacher_id, date } = req.query;
  const result = await getTeacherPeriodsForDateService({
    school_id: req.user.school_id,
    teacher_id: Number(teacher_id),
    date: date || new Date().toISOString().slice(0, 10),
  });

  res.json({
    success: true,
    data: result,
  });
});

/* Get available substitute teachers for a period slot */
export const getAvailableSubstitutes = asyncHandler(async (req, res) => {
  const { timetable_id, date } = req.query;
  const result = await getAvailableSubstitutesService({
    school_id: req.user.school_id,
    timetable_id: Number(timetable_id),
    date: date || new Date().toISOString().slice(0, 10),
  });

  res.json({
    success: true,
    data: result,
  });
});

/* Save / update substitutions */
export const saveSubstitutions = asyncHandler(async (req, res) => {
  const { date, substitutions } = req.body;
  const result = await saveSubstitutionsService({
    user: req.user,
    school_id: req.user.school_id,
    date: date || new Date().toISOString().slice(0, 10),
    substitutions: substitutions || [],
  });

  res.json({
    success: true,
    ...result,
  });
});

/* Get existing substitutions for today */
export const getTodaySubstitutions = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const result = await getTodaySubstitutionsService({
    school_id: req.user.school_id,
    date: date || new Date().toISOString().slice(0, 10),
  });

  res.json({
    success: true,
    data: result,
  });
});
