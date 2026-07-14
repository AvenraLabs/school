import api from "../../api/axios";

// Create a new notification (Admin/Teacher)
export const createNotification = (data) =>
  api.post("/notifications", data);

// List notifications for the current user
export const listNotifications = (params = {}) =>
  api.get("/notifications", { params });

// Alias for backward compatibility
export const getNotifications = listNotifications;

// Acknowledge a notification
export const acknowledgeNotification = (id) =>
  api.post(`/notifications/${id}/acknowledge`);

// Get acknowledgements for a notification
export const getNotificationAcknowledgements = (id) =>
  api.get(`/notifications/${id}/acknowledgements`);

// Mark all notifications as read
export const markAllNotificationsAsRead = () =>
  api.post("/notifications/mark-all-read");

// Fetch active poster announcements
export const getActivePosters = () =>
  api.get("/notifications/active-posters").then(res => res.data);
