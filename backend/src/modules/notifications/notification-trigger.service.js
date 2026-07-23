import Notification from "./notification.model.js";

/**
 * Generic trigger helper
 */
const createNotification = async ({
  school_id,
  sender_user_id,
  sender_role,
  title,
  message,
  target_role,
  class_id = null,
  section_id = null,
}) => {
  return Notification.create({
    school_id,
    sender_user_id,
    sender_role,
    title,
    message,
    target_role,
    class_id,
    section_id,
  });
};

/* ===============================
   HOMEWORK CREATED
================================ */
export const triggerHomeworkNotification = async ({
  school_id,
  teacher_user_id,
  class_id,
  section_id,
  subject_name,
}) => {
  return createNotification({
    school_id,
    sender_user_id: teacher_user_id,
    sender_role: "teacher",
    title: "New Homework Assigned",
    message: `New homework has been assigned for ${subject_name}. Please check.`,
    target_role: "all", // students + teachers
    class_id,
    section_id,
  });
};

/* ===============================
   REPORT CARD PUBLISHED
================================ */
export const triggerReportCardNotification = async ({
  school_id,
  teacher_user_id,
  student_name,
  exam_name,
  class_id,
  section_id,
}) => {
  return createNotification({
    school_id,
    sender_user_id: teacher_user_id,
    sender_role: "teacher",
    title: "Report Card Published",
    message: `Report card for ${student_name} (${exam_name}) has been published.`,
    target_role: "student", // students only
    class_id,
    section_id,
  });
};

/* ===============================
   FEE PAYMENT RECEIVED
================================ */
export const triggerFeePaymentReceivedNotification = async ({
  school_id,
  admin_user_id,
  amount,
  balance,
  class_id,
  section_id,
}) => {
  return createNotification({
    school_id,
    sender_user_id: admin_user_id || 1,
    sender_role: "school_admin",
    title: "Fee Payment Received",
    message: `✅ ₹${Number(amount).toLocaleString("en-IN")} payment received. Remaining balance: ₹${Number(balance).toLocaleString("en-IN")}.`,
    target_role: "student",
    class_id,
    section_id,
  });
};

/* ===============================
   FEE DUE DATE REMINDER
================================ */
export const triggerFeeDueReminderNotification = async ({
  school_id,
  term_name,
  amount,
  due_date,
  days_left,
  class_id,
  section_id,
}) => {
  const timeMsg = days_left === 0 ? "today" : days_left < 0 ? "overdue" : `due in ${days_left} days`;
  return createNotification({
    school_id,
    sender_user_id: 1,
    sender_role: "school_admin",
    title: "Fee Due Reminder",
    message: `Reminder: ${term_name} fee (₹${Number(amount).toLocaleString("en-IN")}) is ${timeMsg} (${due_date}).`,
    target_role: "student",
    class_id,
    section_id,
  });
};
