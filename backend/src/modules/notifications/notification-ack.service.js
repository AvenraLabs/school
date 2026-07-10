import Notification from "./notification.model.js";
import NotificationAck from "./notification-ack.model.js";
import { getPagination } from "../../shared/utils/pagination.js";
import AppError from "../../shared/appError.js";

export const acknowledgeNotificationService = async ({
  notification_id,
  user_id,
  user_role,
  school_id,
}) => {
  if (!["teacher", "student"].includes(user_role)) {
    throw new AppError("Not allowed to acknowledge", 403);
  }

  const notification = await Notification.findByPk(notification_id);
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }
  if (String(notification.school_id) !== String(school_id)) {
    throw new AppError("Forbidden", 403);
  }

  await NotificationAck.findOrCreate({
    where: {
      notification_id,
      user_id,
    },
    defaults: {
      user_role,
    },
  });

  return true;
};

/* VIEW ACKS (admin / sender teacher) */
export const listNotificationAcksService = async ({
  notification_id,
  requester,
  query,
}) => {
  const notification = await Notification.findByPk(notification_id);
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (String(notification.school_id) !== String(requester.school_id)) {
    throw new AppError("Forbidden", 403);
  }

  // Permission check
  if (
    requester.role !== "school_admin" &&
    notification.sender_user_id !== requester.id
  ) {
    throw new AppError("Not allowed to view acknowledgements", 403);
  }

  const { limit, offset } = getPagination(query);

  const User = (await import("../users/user.model.js")).default;
  const Student = (await import("../students/student.model.js")).default;
  const Teacher = (await import("../teachers/teacher.model.js")).default;

  const { rows, count } = await NotificationAck.findAndCountAll({
    where: { notification_id },
    include: [
      { model: Notification },
      { model: User, attributes: ["id", "name", "role", "avatar_url"] }
    ],
    order: [["acknowledged_at", "DESC"]],
    limit,
    offset,
  });

  // Calculate target audience count
  let targetCount = 0;
  if (notification.target_role === "student") {
    const studentWhere = { school_id: notification.school_id, status: "ACTIVE" };
    if (notification.class_id) studentWhere.class_id = notification.class_id;
    if (notification.section_id) studentWhere.section_id = notification.section_id;
    targetCount = await Student.count({ where: studentWhere });
  } else if (notification.target_role === "teacher") {
    targetCount = await Teacher.count({ where: { school_id: notification.school_id, status: "ACTIVE" } });
  } else if (notification.target_role === "all") {
    const studentCount = await Student.count({ where: { school_id: notification.school_id, status: "ACTIVE" } });
    const teacherCount = await Teacher.count({ where: { school_id: notification.school_id, status: "ACTIVE" } });
    targetCount = studentCount + teacherCount;
  }

  return {
    rows,
    seenCount: count,
    unseenCount: Math.max(0, targetCount - count),
    totalCount: targetCount,
  };
};
