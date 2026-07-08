import Feedback from "./feedback.model.js";
import User from "../users/user.model.js";
import School from "../schools/school.model.js";
import { Op } from "sequelize";

export const createFeedback = async ({
  school_id,
  user_id,
  role,
  title,
  category,
  description,
  screenshot_url,
  browser,
  app_version,
}) => {
  return await Feedback.create({
    school_id,
    user_id,
    role,
    title,
    category,
    description,
    screenshot_url,
    browser,
    app_version,
  });
};

export const listAllFeedbacks = async ({
  status,
  category,
  search,
  limit = 20,
  offset = 0,
}) => {
  const where = {};

  if (status) {
    where.status = status;
  }
  if (category) {
    where.category = category;
  }
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows, count } = await Feedback.findAndCountAll({
    where,
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "role", "email"],
      },
      {
        model: School,
        attributes: ["id", "school_name"],
      },
    ],
  });

  return { items: rows, total: count };
};

export const updateFeedbackStatus = async (id, status) => {
  const feedback = await Feedback.findByPk(id);
  if (!feedback) return null;

  feedback.status = status;
  await feedback.save();
  return feedback;
};
