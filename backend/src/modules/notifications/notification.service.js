import Notification from "./notification.model.js";
import NotificationAck from "./notification-ack.model.js";
import AppError from "../../shared/appError.js";
import { Op } from "sequelize";
import User from "../users/user.model.js";
import School from "../schools/school.model.js";

export const createNotificationService = async ({
  school_id,
  sender_user_id,
  sender_role,
  title,
  message,
  target_role,
  class_id,
  section_id,
  target_user_id,
  image_url,
  is_poster,
  start_date,
  end_date,
  specific_dates,
}) => {
  /* Role enforcement */
  if (sender_role === "teacher" && target_role === "teacher") {
    throw new AppError("Teachers cannot notify other teachers", 403);
  }

  if (sender_role !== "school_admin" && sender_role !== "teacher") {
    throw new AppError("Not allowed to send notifications", 403);
  }

  const notification = await Notification.create({
    school_id,
    sender_user_id,
    sender_role,
    title,
    message,
    target_role,
    class_id,
    section_id,
    target_user_id: target_user_id || null,
    image_url,
    is_poster,
    start_date,
    end_date,
    specific_dates,
  });

  return notification;
};


export const listNotificationsForUserService = async ({
  school_id,
  user_role,
  user_id,
  class_ids = [],
  section_ids = [],
  limit = 20,
  offset = 0,
}) => {
  const where = { school_id };

  if (user_role !== "school_admin") {
    const audienceFilter = { target_role: { [Op.in]: [user_role, "all"] } };

    // Teachers should also see notifications they created (even if targeted to students)
    const audienceOrCreator =
      user_role === "teacher"
        ? { [Op.or]: [audienceFilter, { sender_user_id: user_id }] }
        : audienceFilter;

    // Class/section scope for broadcasts
    const scopeConditions = [{ class_id: null }];
    if (class_ids.length) scopeConditions.push({ class_id: { [Op.in]: class_ids } });
    if (section_ids.length) scopeConditions.push({ section_id: { [Op.in]: section_ids } });

    // 1. Direct personal notification sent specifically to this user_id
    const directPersonalNotif = { target_user_id: user_id };

    // 2. Broadcast notification targeted to class/role (not targeted to a specific other user)
    const broadcastNotif = {
      [Op.and]: [
        { target_user_id: null },
        audienceOrCreator,
        { [Op.or]: scopeConditions },
      ],
    };

    where[Op.or] = [directPersonalNotif, broadcastNotif];
  }

  return Notification.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: User,
        attributes: ["id", "name", "avatar_url", "role"],
        required: false,
      },
      {
        model: School,
        attributes: ["id", "school_name", "logo_url"],
        required: false,
      },
      {
        model: NotificationAck,
        attributes: ["id", "user_id", "acknowledged_at"],
        required: false,
        where: { user_id },
      },
    ],
    order: [["created_at", "DESC"]],
  });
};
