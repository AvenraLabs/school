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
   SUPER ADMIN: CREATE SCHOOL
========================= */
export const createSchoolService = async ({
  name,
  code,
  cbse_affiliation_no,
  address,
  city,
  state,
  zip,
  email,
  admin_username,
  admin_password,
}) => {
  const exists = await School.findOne({
    where: { school_code: code },
  });

  if (exists) {
    throw new AppError("School code already exists", 409);
  }

  const school = await School.create({
    school_name: name,
    school_code: code,
    cbse_affiliation_no: cbse_affiliation_no || null,
    address: address || null,
    city: city || null,
    state: state || null,
    zip: zip || null,
    email: email || null,
    status: "active",
  });

  const existingUser = await User.findOne({
  where: { username: admin_username },
});

if (existingUser) {
  throw new AppError("Admin username already exists", 409);
}

  const admin = await User.create({
    role: "school_admin",
    school_id: school.id,
    username: admin_username,
    password: admin_password,
    first_login: true,
    is_active: true,
    name: "School Admin",
  });

  return {
    school,
    admin: { username: admin.username },
  };
};

/* =========================
   SUPER ADMIN: LIST SCHOOLS
========================= */
export const listSchoolsService = async ({ query }) => {
  const { limit, offset } = getPagination(query);
  return School.findAndCountAll({
    limit,
    offset,
    include: [
      {
        model: User,
        where: { role: "school_admin" },
        required: false,
        attributes: ["id", "username", "is_active", "first_login"],
      },
    ],
  });
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
    school: { id: school.id, name: school.school_name, code: school.school_code },
    counts: { students: studentCount, teachers: teacherCount, whatsapp: whatsappCount },
    classes,
    total,
    items: users,
  };
};
