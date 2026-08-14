import asyncHandler from "../../shared/asyncHandler.js";
import {
  getActiveSchoolService,
  getAllSchoolsService,
  createSchoolService,
  updateSchoolStatusService,
  updateSchoolAdminStatusService,
  resetSchoolAdminPasswordService,
  getSchoolStatsService,
  updateSchoolService,
  updateSchoolSettingsService,
  updateSchoolModulesService,
} from "./school.service.js";

/* CREATE NEW SCHOOL (SUPER ADMIN ONLY) */
export const createSchool = asyncHandler(async (req, res) => {
  const result = await createSchoolService(req.body);
  res.status(201).json({
    success: true,
    message: "School created successfully",
    data: result.school,
    admin: result.admin,
  });
});

/* GET ACTIVE SINGLE SCHOOL */
export const getActiveSchool = asyncHandler(async (req, res) => {

  const school = await getActiveSchoolService();
  res.json({
    success: true,
    total: school ? 1 : 0,
    items: school ? [school] : [],
  });
});

/* GET ALL SCHOOLS FOR SUPER ADMIN */
export const getAllSchools = asyncHandler(async (req, res) => {
  const schools = await getAllSchoolsService();
  res.json({
    success: true,
    total: schools.length,
    items: schools,
  });
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

/* UPDATE SCHOOL MODULES (SUPER ADMIN ONLY) */
export const updateSchoolModules = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { enabled_modules } = req.body;
  const school = await updateSchoolModulesService(id, enabled_modules);
  res.json({ success: true, message: "School modules updated successfully", data: school });
});

/* DELETE SINGLE STUDENT */
export const deleteStudent = asyncHandler(async (req, res) => {
  const { deleteSingleStudentService } = await import("../students/student-delete.service.js");
  const result = await deleteSingleStudentService(req.params.studentId);
  res.json(result);
});

/* DELETE ALL STUDENTS IN SECTION */
export const deleteSectionStudents = asyncHandler(async (req, res) => {
  const { deleteSectionStudentsService } = await import("../students/student-delete.service.js");
  const result = await deleteSectionStudentsService(req.params.sectionId);
  res.json(result);
});

/* GET CURRENT USER'S SCHOOL (FOR DYNAMIC MODULE PERMISSIONS) */
export const getMySchool = asyncHandler(async (req, res) => {
  const schoolId = req.user?.school_id;
  if (!schoolId) {
    return res.json({ success: true, data: null });
  }
  const School = (await import("./school.model.js")).default;
  const school = await School.findByPk(schoolId);
  res.json({ success: true, data: school });
});

