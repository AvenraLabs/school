import asyncHandler from "../../shared/asyncHandler.js";
import {
  createSchoolService,
  listSchoolsService,
  updateSchoolStatusService,
  updateSchoolAdminStatusService,
  resetSchoolAdminPasswordService,
  getSchoolStatsService,
  updateSchoolService,
  updateSchoolSettingsService,
} from "./school.service.js";

/* CREATE SCHOOL */
export const createSchool = asyncHandler(async (req, res) => {
  const result = await createSchoolService(req.body);
  res.status(201).json(result);
});

/* LIST SCHOOLS */
export const listSchools = asyncHandler(async (req, res) => {
  const schools = await listSchoolsService({ query: req.query });
  res.json(schools);
});

/* GET SCHOOL STATS */
export const getSchoolStats = asyncHandler(async (req, res) => {
  const stats = await getSchoolStatsService({ school_id: req.params.id, query: req.query });
  res.json(stats);
});

/* UPDATE SCHOOL STATUS */
export const updateSchoolStatus = asyncHandler(async (req, res) => {
  const school = await updateSchoolStatusService({
    school_id: req.params.id,
    status: req.body.status,
  });

  res.json({ message: "Status updated", school });
});

/* UPDATE SCHOOL ADMIN STATUS */
export const updateSchoolAdminStatus = asyncHandler(async (req, res) => {
  const admin = await updateSchoolAdminStatusService({
    school_id: req.params.id,
    is_active: req.body.is_active,
  });

  res.json({ message: "School admin status updated", admin });
});

/* RESET SCHOOL ADMIN PASSWORD */
export const resetSchoolAdminPassword = asyncHandler(async (req, res) => {
  const result = await resetSchoolAdminPasswordService({
    school_id: req.params.id,
    new_password: req.body.new_password,
  });

  res.json({ message: "Password reset", admin: result });
});

/* UPDATE SCHOOL DETAILS */
export const updateSchool = asyncHandler(async (req, res) => {
  const school = await updateSchoolService(req.params.id, req.body);
  res.json({ message: "School updated successfully", data: school });
});

/* UPDATE SCHOOL SETTINGS */
export const updateSchoolSettings = asyncHandler(async (req, res) => {
  const result = await updateSchoolSettingsService(req.user.school_id, req.body);
  res.json({ success: true, message: "School settings updated successfully", data: result });
});
