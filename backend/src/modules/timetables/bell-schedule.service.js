import { Op } from "sequelize";
import db from "../../config/db.js";
import BellScheduleTemplate from "./bell-schedule-template.model.js";
import BellSchedulePeriod from "./bell-schedule-period.model.js";
import Class from "../classes/classes.model.js";
import AppError from "../../shared/appError.js";

/* =====================================================
   CREATE BELL SCHEDULE TEMPLATE (WITH PERIODS & CLASSES)
===================================================== */
export const createBellScheduleService = async ({
  school_id,
  name,
  working_days_per_week = 6,
  periods = [],
  class_ids = [],
}) => {
  return await db.transaction(async (t) => {
    // Check name uniqueness per school
    const existing = await BellScheduleTemplate.findOne({
      where: { school_id, name },
      transaction: t,
    });
    if (existing) {
      throw new AppError("A bell schedule template with this name already exists", 409);
    }

    const template = await BellScheduleTemplate.create(
      {
        school_id,
        name,
        working_days_per_week,
      },
      { transaction: t }
    );

    const periodRows = periods.map((p, idx) => ({
      template_id: template.id,
      order_index: p.order_index ?? idx + 1,
      start_time: p.start_time,
      end_time: p.end_time,
      is_break: !!p.is_break,
      title: p.is_break ? (p.title || "Break") : null,
    }));

    if (periodRows.length > 0) {
      await BellSchedulePeriod.bulkCreate(periodRows, { transaction: t });
    }

    if (Array.isArray(class_ids) && class_ids.length > 0) {
      await Class.update(
        { bell_schedule_template_id: template.id },
        { where: { school_id, id: class_ids }, transaction: t }
      );
    }

    const result = await BellScheduleTemplate.findOne({
      where: { id: template.id, school_id },
      include: [
        { model: BellSchedulePeriod, as: "periods" },
        { model: Class, attributes: ["id", "class_name"] },
      ],
      transaction: t,
    });

    return result;
  });
};

/* =====================================================
   GET ALL BELL SCHEDULE TEMPLATES FOR SCHOOL
===================================================== */
export const getBellSchedulesService = async ({ school_id }) => {
  const templates = await BellScheduleTemplate.findAll({
    where: { school_id },
    include: [
      {
        model: BellSchedulePeriod,
        as: "periods",
      },
      {
        model: Class,
        attributes: ["id", "class_name"],
      },
    ],
    order: [
      ["name", "ASC"],
      [{ model: BellSchedulePeriod, as: "periods" }, "order_index", "ASC"],
    ],
  });

  return templates;
};

/* =====================================================
   GET SINGLE BELL SCHEDULE TEMPLATE BY ID
===================================================== */
export const getBellScheduleByIdService = async ({ school_id, template_id }) => {
  const template = await BellScheduleTemplate.findOne({
    where: { id: template_id, school_id },
    include: [
      {
        model: BellSchedulePeriod,
        as: "periods",
      },
      {
        model: Class,
        attributes: ["id", "class_name"],
      },
    ],
    order: [[{ model: BellSchedulePeriod, as: "periods" }, "order_index", "ASC"]],
  });

  if (!template) {
    throw new AppError("Bell schedule template not found", 404);
  }

  return template;
};

/* =====================================================
   UPDATE BELL SCHEDULE TEMPLATE & PERIODS & CLASSES
===================================================== */
export const updateBellScheduleService = async ({
  school_id,
  template_id,
  name,
  working_days_per_week,
  periods,
  class_ids,
}) => {
  return await db.transaction(async (t) => {
    const template = await BellScheduleTemplate.findOne({
      where: { id: template_id, school_id },
      transaction: t,
    });

    if (!template) {
      throw new AppError("Bell schedule template not found", 404);
    }

    // Name conflict check if changing name
    if (name && name !== template.name) {
      const existing = await BellScheduleTemplate.findOne({
        where: { school_id, name },
        transaction: t,
      });
      if (existing) {
        throw new AppError("A bell schedule template with this name already exists", 409);
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (working_days_per_week !== undefined) updates.working_days_per_week = working_days_per_week;

    await template.update(updates, { transaction: t });

    // Replace periods if array provided
    if (Array.isArray(periods)) {
      await BellSchedulePeriod.destroy({
        where: { template_id },
        transaction: t,
      });

      const periodRows = periods.map((p, idx) => ({
        template_id,
        order_index: p.order_index ?? idx + 1,
        start_time: p.start_time,
        end_time: p.end_time,
        is_break: !!p.is_break,
        title: p.is_break ? (p.title || "Break") : null,
      }));

      if (periodRows.length > 0) {
        await BellSchedulePeriod.bulkCreate(periodRows, { transaction: t });
      }
    }

    if (Array.isArray(class_ids)) {
      // Unassign classes removed from this template
      await Class.update(
        { bell_schedule_template_id: null },
        {
          where: {
            school_id,
            bell_schedule_template_id: template_id,
            id: { [Op.notIn]: class_ids.length ? class_ids : [0] },
          },
          transaction: t,
        }
      );

      // Assign selected classes to this template
      if (class_ids.length > 0) {
        await Class.update(
          { bell_schedule_template_id: template_id },
          { where: { school_id, id: class_ids }, transaction: t }
        );
      }
    }

    const updated = await BellScheduleTemplate.findOne({
      where: { id: template_id, school_id },
      include: [
        { model: BellSchedulePeriod, as: "periods" },
        { model: Class, attributes: ["id", "class_name"] },
      ],
      transaction: t,
    });

    return updated;
  });
};

/* =====================================================
   DELETE BELL SCHEDULE TEMPLATE
===================================================== */
export const deleteBellScheduleService = async ({ school_id, template_id }) => {
  return await db.transaction(async (t) => {
    const template = await BellScheduleTemplate.findOne({
      where: { id: template_id, school_id },
      transaction: t,
    });

    if (!template) {
      throw new AppError("Bell schedule template not found", 404);
    }

    await template.destroy({ transaction: t });
    return { success: true };
  });
};
