import { Op } from "sequelize";
import db from "../../config/db.js";

/**
 * Builds standard Sequelize WHERE search conditions for Student queries
 * Matches admission_no, roll_no, emergency_contact, user.name, user.phone, user.username
 * @param {string} searchString
 * @returns {Array|null}
 */
export const buildStudentSearchWhere = (searchString) => {
  if (!searchString || typeof searchString !== "string" || !searchString.trim()) return null;
  const s = `%${searchString.trim()}%`;
  return [
    { admission_no: { [Op.iLike]: s } },
    db.where(db.cast(db.col("student.roll_no"), "TEXT"), { [Op.iLike]: s }),
    { emergency_contact: { [Op.iLike]: s } },
    { "$user.name$": { [Op.iLike]: s } },
    { "$user.phone$": { [Op.iLike]: s } },
    { "$user.username$": { [Op.iLike]: s } },
  ];
};

/**
 * Builds standard Sequelize WHERE search conditions for Teacher queries
 * Matches employee_id, user.name, user.username, user.phone
 * @param {string} searchString
 * @returns {Array|null}
 */
export const buildTeacherSearchWhere = (searchString) => {
  if (!searchString || typeof searchString !== "string" || !searchString.trim()) return null;
  const s = `%${searchString.trim()}%`;
  return [
    { employee_id: { [Op.iLike]: s } },
    { "$user.name$": { [Op.iLike]: s } },
    { "$user.username$": { [Op.iLike]: s } },
    { "$user.phone$": { [Op.iLike]: s } },
  ];
};
