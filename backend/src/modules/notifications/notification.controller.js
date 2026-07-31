import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import {
  createNotificationService,
  listNotificationsForUserService,
} from "./notification.service.js";
import * as whatsappService from "../whatsapp/whatsapp.service.js";

/* ADMIN / TEACHER: CREATE */
export const createNotification = asyncHandler(async (req, res) => {
  const { send_whatsapp, ...notificationData } = req.body;

  const notification = await createNotificationService({
    school_id: req.user.school_id,
    sender_user_id: req.user.id,
    sender_role: req.user.role,
    ...notificationData,
  });

  // Real-time socket broadcast for push notifications
  if (req.io) {
    const schoolRoom = `school:${req.user.school_id}`;
    req.io.to(schoolRoom).emit("notification:new", {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      target_role: notification.target_role,
      class_id: notification.class_id,
      section_id: notification.section_id,
      is_poster: notification.is_poster,
      start_date: notification.start_date,
      end_date: notification.end_date,
      specific_dates: notification.specific_dates,
      image_url: notification.image_url,
    });
  }

  if (send_whatsapp) {
    // Resolve and send in the background
    whatsappService.resolveAnnouncementRecipients({
      school_id: req.user.school_id,
      target_role: notificationData.target_role,
      class_id: notificationData.class_id ? Number(notificationData.class_id) : undefined,
      section_id: notificationData.section_id ? Number(notificationData.section_id) : undefined,
    }).then((recipientList) => {
      return whatsappService.sendAnnouncement(
        recipientList,
        notificationData.title,
        notificationData.message,
        req.user.school_id
      );
    }).catch((err) => {
      console.error("WhatsApp announcement background error:", err);
    });
  }

  res.status(201).json({
    success: true,
    data: notification,
  });
});

/* ALL USERS: LIST */
export const listNotifications = asyncHandler(async (req, res) => {
  let classIds = [];
  let sectionIds = [];

  if (req.user.role === "student") {
    if (req.user.class_id) classIds = [req.user.class_id];
    if (req.user.section_id) sectionIds = [req.user.section_id];
  }


  if (req.user.role === "teacher") {
    const TeacherAssignment = (await import("../teacher-assignments/teacher-assignment.model.js")).default;
    const assignments = await TeacherAssignment.findAll({
      where: { teacher_id: req.user.id },
      attributes: ["class_id", "section_id"],
    });
    classIds = [
      ...classIds,
      ...assignments.map((a) => a.class_id).filter(Boolean),
    ];
    sectionIds = [
      ...sectionIds,
      ...assignments.map((a) => a.section_id).filter(Boolean),
    ];
  }

  const limit = req.query.limit ? parseInt(req.query.limit) : 20;
  const offset = req.query.offset ? parseInt(req.query.offset) : 0;

  const result = await listNotificationsForUserService({
    school_id: req.user.school_id,
    user_role: req.user.role,
    user_id: req.user.id,
    class_ids: classIds,
    section_ids: sectionIds,
    limit,
    offset,
  });

  res.json({
    success: true,
    total: result.count,
    items: result.rows.map((row) => {
      const plain = row.toJSON();
      const ack = plain.notification_acks?.[0];
      const u = plain.User || plain.user;
      return {
        ...plain,
        // Ensure snake_case date field is always present regardless of Sequelize naming
        created_at: plain.created_at || plain.createdAt,
        updated_at: plain.updated_at || plain.updatedAt,
        is_acknowledged: Boolean(ack),
        acknowledged_at: ack?.acknowledged_at || null,
        sender: u
          ? {
              id: u.id,
              name: u.name,
              avatar_url: u.avatar_url,
              role: u.role,
            }
          : null,
        school: plain.School || plain.school
          ? {
              id: (plain.School || plain.school).id,
              school_name: (plain.School || plain.school).school_name,
              logo_url: (plain.School || plain.school).logo_url,
            }
          : null,
      };
    }),
  });
});

/* ALL USERS: MARK ALL AS READ */
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  let classIds = [];
  let sectionIds = [];

  if (req.user.role === "student") {
    if (req.user.class_id) classIds = [req.user.class_id];
    if (req.user.section_id) sectionIds = [req.user.section_id];
  }

  if (req.user.role === "teacher") {
    const TeacherAssignment = (await import("../teacher-assignments/teacher-assignment.model.js")).default;
    const assignments = await TeacherAssignment.findAll({
      where: { teacher_id: req.user.id },
      attributes: ["class_id", "section_id"],
    });
    classIds = [
      ...classIds,
      ...assignments.map((a) => a.class_id).filter(Boolean),
    ];
    sectionIds = [
      ...sectionIds,
      ...assignments.map((a) => a.section_id).filter(Boolean),
    ];
  }

  const result = await listNotificationsForUserService({
    school_id: req.user.school_id,
    user_role: req.user.role,
    user_id: req.user.id,
    class_ids: classIds,
    section_ids: sectionIds,
  });

  const unacknowledged = result.rows.filter(row => {
    const plain = row.toJSON();
    const ack = plain.notification_acks?.[0];
    return !ack;
  });

  if (unacknowledged.length > 0) {
    const NotificationAck = (await import("./notification-ack.model.js")).default;
    const acks = unacknowledged.map(n => ({
      notification_id: n.id,
      user_id: req.user.id,
      user_role: req.user.role,
    }));
    await NotificationAck.bulkCreate(acks, { ignoreDuplicates: true });
  }

  res.json({
    success: true,
    message: "All notifications marked as read",
  });
});

/* ALL USERS: FETCH ACTIVE POSTERS */
export const getActivePosters = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const user_role = req.user.role;
  const user_id = req.user.id;
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const { Op } = (await import("sequelize")).default;
  const Notification = (await import("./notification.model.js")).default;

  // Resolve target classes/sections for student/teacher
  let classIds = [];
  let sectionIds = [];

  if (user_role === "student") {
    if (req.user.class_id) classIds = [Number(req.user.class_id)];
    if (req.user.section_id) sectionIds = [Number(req.user.section_id)];
  } else if (user_role === "teacher") {
    const TeacherAssignment = (await import("../teacher-assignments/teacher-assignment.model.js")).default;
    const assignments = await TeacherAssignment.findAll({
      where: { teacher_id: user_id },
      attributes: ["class_id", "section_id"],
    });
    classIds = assignments.map((a) => Number(a.class_id)).filter(Boolean);
    sectionIds = assignments.map((a) => Number(a.section_id)).filter(Boolean);
  }

  const where = {
    school_id,
    is_poster: true,
    is_active: true,
  };

  if (user_role !== "school_admin") {
    const audienceFilter = { target_role: { [Op.in]: [user_role, "all"] } };
    
    // Class/section scope
    const scopeConditions = [{ class_id: null }];
    if (classIds.length) scopeConditions.push({ class_id: { [Op.in]: classIds } });
    if (sectionIds.length) scopeConditions.push({ section_id: { [Op.in]: sectionIds } });

    where[Op.and] = [
      audienceFilter,
      { [Op.or]: scopeConditions },
    ];
  }

  const allPosters = await Notification.findAll({
    where,
    order: [["created_at", "DESC"]],
  });

  const activePosters = allPosters.filter((row) => {
    if (row.specific_dates && Array.isArray(row.specific_dates) && row.specific_dates.length > 0) {
      return row.specific_dates.includes(today);
    }
    if (row.start_date && row.end_date) {
      return row.start_date <= today && row.end_date >= today;
    }
    return false;
  });

  res.json({
    success: true,
    data: activePosters.map((row) => {
      const plain = row.toJSON();
      return {
        ...plain,
        created_at: plain.created_at || plain.createdAt,
        updated_at: plain.updated_at || plain.updatedAt,
      };
    }),
  });
});

/* ADMIN / TEACHER: UPDATE ANNOUNCEMENT / POSTER */
export const updateNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const Notification = (await import("./notification.model.js")).default;

  const notification = await Notification.findOne({
    where: {
      id,
      school_id: req.user.school_id,
    },
  });

  if (!notification) {
    throw new AppError("Announcement not found", 404);
  }

  const {
    title,
    message,
    target_role,
    class_id,
    section_id,
    image_url,
    is_poster,
    start_date,
    end_date,
    specific_dates,
  } = req.body;

  if (title !== undefined) notification.title = title;
  if (message !== undefined) notification.message = message;
  if (target_role !== undefined) notification.target_role = target_role;
  notification.class_id = class_id ? Number(class_id) : null;
  notification.section_id = section_id ? Number(section_id) : null;
  if (image_url !== undefined) notification.image_url = image_url;
  if (is_poster !== undefined) notification.is_poster = is_poster;
  notification.start_date = start_date || null;
  notification.end_date = end_date || null;
  notification.specific_dates = specific_dates || null;

  await notification.save();

  res.json({
    success: true,
    data: notification,
  });
});

/* ADMIN / TEACHER: DELETE ANNOUNCEMENT / POSTER */
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const Notification = (await import("./notification.model.js")).default;
  const NotificationAck = (await import("./notification-ack.model.js")).default;

  const notification = await Notification.findOne({
    where: {
      id,
      school_id: req.user.school_id,
    },
  });

  if (!notification) {
    throw new AppError("Announcement not found", 404);
  }

  // Delete associated acknowledgements first
  await NotificationAck.destroy({ where: { notification_id: id } });

  await notification.destroy();

  res.json({
    success: true,
    message: "Announcement deleted successfully",
  });
});

