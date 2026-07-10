import asyncHandler from "../../shared/asyncHandler.js";
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

  const result = await listNotificationsForUserService({
    school_id: req.user.school_id,
    user_role: req.user.role,
    user_id: req.user.id,
    class_ids: classIds,
    section_ids: sectionIds,
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
