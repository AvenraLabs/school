import db from "../../config/db.js";
import Student from "./student.model.js";
import User from "../users/user.model.js";

export const bulkApproveStudentsService = async ({
  student_ids,
  action,
  admin_user_id,
  school_id,
}) => {
  return db.transaction(async (t) => {
    const adminUser = await User.findByPk(admin_user_id, { transaction: t });
    if (!adminUser) {
      const err = new Error("Forbidden: admin user not found");
      err.statusCode = 403;
      throw err;
    }

    const allowedRoles = ["school_admin", "super_admin"];
    if (!allowedRoles.includes(adminUser.role)) {
      const err = new Error("Forbidden: insufficient role");
      err.statusCode = 403;
      throw err;
    }

    if (
      adminUser.role !== "super_admin" &&
      String(adminUser.school_id) !== String(school_id)
    ) {
      const err = new Error("Forbidden: cross-school access");
      err.statusCode = 403;
      throw err;
    }

    const students = await Student.findAll({
      where: {
        id: student_ids,
        school_id,
        approval_status: "pending",
      },
      transaction: t,
    });

    if (!students.length) {
      return { processed: 0 };
    }

    const studentUserIds = students.map((s) => s.user_id);

    await Student.update(
      {
        approval_status: action === "approve" ? "approved" : "rejected",
        approved_by: admin_user_id,
        approved_at: new Date(),
      },
      {
        where: { id: students.map((s) => s.id), school_id, approval_status: "pending" },
        transaction: t,
      }
    );

    if (action === "approve") {
      await User.update(
        { is_active: true },
        {
          where: {
            id: studentUserIds,
            school_id,
          },
          transaction: t,
        }
      );
    }

    return { processed: students.length };
  });
};
