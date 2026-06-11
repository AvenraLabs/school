import { Op } from "sequelize";
import db from "../../config/db.js";
import { getPagination } from "../../shared/utils/pagination.js";

export const listAuditLogsService = async ({ school_id, query }) => {
  const AuditLog = db.models.audit_log;
  const User = db.models.user;

  const { limit, offset } = getPagination(query);
  const safeQuery = query || {};
  const { entity_type, entity_id, from_date, to_date } = safeQuery;

  const where = {};

  if (entity_type) {
    where.entity_type = entity_type;
  }

  if (entity_id) {
    where.entity_id = Number(entity_id);
  }

  if (from_date || to_date) {
    where.created_at = {};
    if (from_date) where.created_at[Op.gte] = new Date(from_date);
    if (to_date) where.created_at[Op.lte] = new Date(to_date);
  }

  const include = [
    {
      model: User,
      attributes: ["id", "name", "username"],
      ...(school_id ? { where: { school_id } } : {}),
    },
  ];

  return AuditLog.findAndCountAll({
    where,
    include,
    limit,
    offset,
    order: [["created_at", "DESC"]],
  });
};

