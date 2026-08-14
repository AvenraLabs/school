import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import {
  listAcademicYearsService,
  createAcademicYearService,
  setCurrentAcademicYearService,
  getPromotionPreviewService,
  promoteAcademicYearService,
} from "./academic-year.service.js";

const getSchoolId = (req) => {
  const school_id =
    req.body?.school_id ||
    req.query?.school_id ||
    req.headers["x-school-id"] ||
    req.headers["school-id"] ||
    req.user?.school_id;
  if (!school_id) {
    throw new AppError("school_id is required", 400);
  }
  return school_id;
};

/**
 * LIST ACADEMIC YEARS
 */
export const listAcademicYears = asyncHandler(async (req, res) => {
  const school_id = getSchoolId(req);
  const list = await listAcademicYearsService(school_id);
  res.json(list);
});

/**
 * CREATE ACADEMIC YEAR
 */
export const createAcademicYear = asyncHandler(async (req, res) => {
  const school_id = getSchoolId(req);
  const year = await createAcademicYearService(school_id, req.body);
  res.status(201).json(year);
});

/**
 * SET CURRENT ACADEMIC YEAR
 */
export const setCurrentAcademicYear = asyncHandler(async (req, res) => {
  const school_id = getSchoolId(req);
  const { id } = req.params;
  const year = await setCurrentAcademicYearService(school_id, id);
  res.json(year);
});

/**
 * GET PROMOTION PREVIEW
 */
export const getPromotionPreview = asyncHandler(async (req, res) => {
  const school_id = getSchoolId(req);
  const { repeat_student_ids = [], custom_overrides = {} } = req.body || {};
  const preview = await getPromotionPreviewService(school_id, { repeat_student_ids, custom_overrides });
  res.json(preview);
});

/**
 * EXECUTE PROMOTION WIZARD
 */
export const promoteAcademicYear = asyncHandler(async (req, res) => {
  const school_id = getSchoolId(req);
  const result = await promoteAcademicYearService(school_id, req.body);
  res.json(result);
});
