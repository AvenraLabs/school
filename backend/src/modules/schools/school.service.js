import School from "./school.model.js";
import User from "../users/user.model.js";
import Student from "../students/student.model.js";
import Teacher from "../teachers/teacher.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import WhatsappLog from "../whatsapp/whatsapp-log.model.js";
import AppError from "../../shared/appError.js";
import { getPagination } from "../../shared/utils/pagination.js";
import { Op } from "sequelize";

/* =========================
   SUPER ADMIN: GET THE ACTIVE SINGLE SCHOOL
========================= */
export const getActiveSchoolService = async () => {
  const school = await School.findOne({
    include: [
      {
        model: User,
        where: { role: "school_admin" },
        required: false,
        attributes: ["id", "username", "is_active", "first_login"],
      },
    ],
  });

  if (school) {
    const [studentsCount, teachersCount, schoolAdminsCount, driversCount, activeUsersCount, inactiveUsersCount] = await Promise.all([
      User.count({ where: { school_id: school.id, role: "student" } }),
      User.count({ where: { school_id: school.id, role: "teacher" } }),
      User.count({ where: { school_id: school.id, role: "school_admin" } }),
      User.count({ where: { school_id: school.id, role: "driver" } }),
      User.count({ where: { school_id: school.id, is_active: true } }),
      User.count({ where: { school_id: school.id, is_active: false } }),
    ]);

    school.setDataValue("studentsCount", studentsCount);
    school.setDataValue("teachersCount", teachersCount);
    school.setDataValue("schoolAdminsCount", schoolAdminsCount);
    school.setDataValue("driversCount", driversCount);
    school.setDataValue("activeUsersCount", activeUsersCount);
    school.setDataValue("inactiveUsersCount", inactiveUsersCount);
  }

  return school;
};

/* =========================
   SUPER ADMIN: GET ALL SCHOOLS LIST
========================= */
export const getAllSchoolsService = async () => {
  const schools = await School.findAll({
    include: [
      {
        model: User,
        where: { role: "school_admin" },
        required: false,
        attributes: ["id", "username", "is_active", "first_login"],
      },
    ],
    order: [["id", "ASC"]],
  });

  for (const s of schools) {
    const [studentsCount, teachersCount] = await Promise.all([
      User.count({ where: { school_id: s.id, role: "student" } }),
      User.count({ where: { school_id: s.id, role: "teacher" } }),
    ]);
    s.setDataValue("studentsCount", studentsCount);
    s.setDataValue("teachersCount", teachersCount);
  }

  return schools;
};

/* =========================
   SUPER ADMIN: UPDATE SCHOOL STATUS
========================= */
export const updateSchoolStatusService = async ({ school_id, status }) => {
  const school = await School.findByPk(school_id);
  if (!school) {
    throw new AppError("School not found", 404);
  }

  school.status = status;
  await school.save();
  return school;
};

/* =========================
   SUPER ADMIN: SCHOOL ADMIN STATUS
========================= */
export const updateSchoolAdminStatusService = async ({
  school_id,
  is_active,
}) => {
  const admin = await User.findOne({
    where: { school_id, role: "school_admin" },
  });

  if (!admin) {
    throw new AppError("School admin not found", 404);
  }

  admin.is_active = is_active;
  await admin.save();

  // Sync school status with admin active status
  const school = await School.findByPk(school_id);
  if (school) {
    school.status = is_active ? "active" : "suspended";
    await school.save();
  }

  return admin;
};

/* =========================
   SUPER ADMIN: RESET ADMIN PASSWORD
========================= */
export const resetSchoolAdminPasswordService = async ({
  school_id,
  new_password,
}) => {
  const admin = await User.findOne({
    where: { school_id, role: "school_admin" },
  });

  if (!admin) {
    throw new AppError("School admin not found", 404);
  }

  admin.password = new_password;
  admin.first_login = true;
  await admin.save();

  return { username: admin.username };
};

/* =========================
   SUPER ADMIN: SCHOOL STATS
========================= */
export const getSchoolStatsService = async ({ school_id, query = {} }) => {
  const school = await School.findByPk(school_id);
  if (!school) throw new AppError("School not found", 404);

  const { limit, offset } = getPagination(query);
  const role = query.role || null; // 'student' | 'teacher' | null
  const class_id = query.class_id ? Number(query.class_id) : null;
  const section_id = query.section_id ? Number(query.section_id) : null;

  // ── counts ──────────────────────────────────────────────────────────
  const [studentCount, teacherCount, whatsappCount] = await Promise.all([
    Student.count({ where: { school_id } }),
    Teacher.count({ where: { school_id } }),
    WhatsappLog.count({ where: { school_id } }),
  ]);

  // ── classes + sections for filter dropdowns ──────────────────────────
  const classes = await Class.findAll({
    where: { school_id },
    attributes: ["id", "class_name"],
    include: [{
      model: Section,
      attributes: ["id", "name"],
      required: false,
    }],
    order: [["class_name", "ASC"]],
  });

  // ── paginated users list ─────────────────────────────────────────────
  let users = [];
  let total = 0;

  if (!role || role === "student") {
    const where = { school_id };
    if (class_id) where.class_id = class_id;
    if (section_id) where.section_id = section_id;

    const res = await Student.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ["id", "name", "username", "is_active"],
      }, {
        model: Class,
        attributes: ["id", "class_name"],
      }, {
        model: Section,
        attributes: ["id", "name"],
      }],
      limit: role ? limit : Math.min(limit, 20),
      offset: role ? offset : 0,
      order: [["id", "DESC"]],
    });

    const mapped = res.rows.map(s => ({
      id: s.id,
      user_id: s.user_id,
      name: s.user?.name || "—",
      username: s.user?.username || "—",
      is_active: s.user?.is_active,
      role: "student",
      class: s.class?.class_name || "—",
      section: s.section?.name || "—",
      admission_no: s.admission_no,
    }));

    if (role === "student") {
      users = mapped;
      total = res.count;
    } else {
      users.push(...mapped.slice(0, 5));
    }
  }

  if (!role || role === "teacher") {
    const res = await Teacher.findAndCountAll({
      where: { school_id },
      include: [{
        model: User,
        attributes: ["id", "name", "username", "is_active"],
      }],
      limit: role ? limit : Math.min(limit, 20),
      offset: role ? offset : 0,
      order: [["id", "DESC"]],
    });

    const mapped = res.rows.map(t => ({
      id: t.id,
      user_id: t.user_id,
      name: t.user?.name || "—",
      username: t.user?.username || "—",
      is_active: t.user?.is_active,
      role: "teacher",
      class: "—",
      section: "—",
    }));

    if (role === "teacher") {
      users = mapped;
      total = res.count;
    } else {
      users.push(...mapped.slice(0, 5));
    }
  }

  if (!role) total = studentCount + teacherCount;

  return {
    success: true,
    school: { id: school.id, name: school.school_name },
    counts: { students: studentCount, teachers: teacherCount, whatsapp: whatsappCount },
    classes,
    total,
    items: users,
  };
};

/* =========================
   SUPER ADMIN: UPDATE SCHOOL DETAILS
   ========================= */
export const updateSchoolService = async (school_id, payload) => {
  const school = await School.findByPk(school_id);
  if (!school) {
    throw new AppError("School not found", 404);
  }
  await school.update(payload);
  return school;
};

/* =========================
   SCHOOL ADMIN: UPDATE SETTINGS
   ========================= */
export const updateSchoolSettingsService = async (school_id, { board, risk_attendance_cutoff, risk_academic_cutoff, risk_grade_drop_margin }) => {
  const school = await School.findByPk(school_id);
  if (!school) {
    throw new AppError("School not found", 404);
  }

  if (board) {
    school.board = String(board).trim().toUpperCase();
  }

  if (risk_attendance_cutoff !== undefined) {
    const val = Number(risk_attendance_cutoff);
    if (isNaN(val) || val < 1 || val > 100) {
      throw new AppError("Attendance cutoff must be between 1 and 100", 400);
    }
    school.risk_attendance_cutoff = val;
  }

  if (risk_academic_cutoff !== undefined) {
    const val = Number(risk_academic_cutoff);
    if (isNaN(val) || val < 1 || val > 100) {
      throw new AppError("Academic score cutoff must be between 1 and 100", 400);
    }
    school.risk_academic_cutoff = val;
  }

  if (risk_grade_drop_margin !== undefined) {
    const val = Number(risk_grade_drop_margin);
    if (isNaN(val) || val < 1 || val > 100) {
      throw new AppError("Grade drop margin must be between 1 and 100", 400);
    }
    school.risk_grade_drop_margin = val;
  }

  await school.save();
  return school;
};

/* =========================
   SUPER ADMIN: UPDATE SCHOOL MODULE TOGGLES
   ========================= */
export const updateSchoolModulesService = async (school_id, enabled_modules) => {
  const school = await School.findByPk(school_id);
  if (!school) {
    throw new AppError("School not found", 404);
  }

  const currentModules = school.enabled_modules || {};
  const updatedModules = {
    ...currentModules,
    ...enabled_modules,
  };

  school.enabled_modules = updatedModules;
  await school.save();
  return school;
};
