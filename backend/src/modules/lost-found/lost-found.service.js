import LostFoundItem from "./lost-found.model.js";
import User from "../users/user.model.js";
import { Op } from "sequelize";
import Student from "../students/student.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";

export const createLostFoundItem = async ({
  school_id,
  created_by,
  title,
  type,
  description,
  date,
  photos,
}) => {
  return await LostFoundItem.create({
    school_id,
    created_by,
    title,
    type,
    description,
    date,
    photos,
  });
};

export const getLostFoundItemById = async (id, school_id) => {
  return await LostFoundItem.findOne({
    where: { id, school_id },
    include: [
      {
        model: User,
        as: "Creator",
        attributes: ["id", "name", "role", "avatar_url"],
        include: [
          {
            model: Student,
            attributes: ["class_id", "section_id"],
            include: [
              { model: Class, attributes: ["class_name"] },
              { model: Section, attributes: ["name"] },
            ],
          },
        ],
      },
    ],
  });
};

export const listLostFoundItems = async ({
  school_id,
  status = "OPEN",
  type,
  search,
  created_by,
  limit = 20,
  offset = 0,
}) => {
  const where = { school_id };

  if (status) {
    where.status = status;
  }
  if (type) {
    where.type = type;
  }
  if (created_by) {
    where.created_by = created_by;
  }
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows, count } = await LostFoundItem.findAndCountAll({
    where,
    limit,
    offset,
    order: [["created_at", "DESC"]],
    include: [
      {
        model: User,
        as: "Creator",
        attributes: ["id", "name", "role", "avatar_url"],
        include: [
          {
            model: Student,
            attributes: ["class_id", "section_id"],
            include: [
              { model: Class, attributes: ["class_name"] },
              { model: Section, attributes: ["name"] },
            ],
          },
        ],
      },
    ],
  });

  return { items: rows, total: count };
};

export const updateLostFoundStatus = async (id, school_id, status) => {
  const item = await LostFoundItem.findOne({ where: { id, school_id } });
  if (!item) return null;

  item.status = status;
  await item.save();
  return item;
};

export const deleteLostFoundItem = async (id, school_id) => {
  const item = await LostFoundItem.findOne({ where: { id, school_id } });
  if (!item) return false;

  await item.destroy();
  return true;
};
