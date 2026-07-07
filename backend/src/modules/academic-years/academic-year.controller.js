import asyncHandler from "../../shared/asyncHandler.js";
import {
  listAcademicYearsService,
  createAcademicYearService,
  setCurrentAcademicYearService,
  getPromotionPreviewService,
  promoteAcademicYearService,
} from "./academic-year.service.js";

/**
 * LIST ACADEMIC YEARS
 */
export const listAcademicYears = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const list = await listAcademicYearsService(school_id);
  res.json(list);
});

/**
 * CREATE ACADEMIC YEAR
 */
export const createAcademicYear = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const year = await createAcademicYearService(school_id, req.body);
  res.status(201).json(year);
});

/**
 * SET CURRENT ACADEMIC YEAR
 */
export const setCurrentAcademicYear = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const { id } = req.params;
  const year = await setCurrentAcademicYearService(school_id, id);
  res.json(year);
});

/**
 * GET PROMOTION PREVIEW
 */
export const getPromotionPreview = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const repeat_student_ids = req.body.repeat_student_ids || [];
  const preview = await getPromotionPreviewService(school_id, { repeat_student_ids });
  res.json(preview);
});

/**
 * EXECUTE PROMOTION WIZARD
 */
export const promoteAcademicYear = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const result = await promoteAcademicYearService(school_id, req.body);
  res.json(result);
});
