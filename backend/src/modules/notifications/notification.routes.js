import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { validate } from "../../shared/middlewares/validate.js";
import { allowRoles } from "../../shared/middlewares/role.js";

import {
  createNotificationSchema,
  updateNotificationSchema,
} from "./notification.schema.js";
import {
  createNotification,
  updateNotification,
  deleteNotification,
  listNotifications,
  markAllNotificationsAsRead,
  getActivePosters,
  subscribePush,
  unsubscribePush,
  getVapidPublicKey,
} from "./notification.controller.js";
import {
  acknowledgeNotification,
  listNotificationAcks,
} from "./notification-ack.controller.js";

const router = express.Router();

router.use(protect);

/* PUSH SUBSCRIPTION ROUTES */
router.post("/push-subscribe", subscribePush);
router.post("/push-unsubscribe", unsubscribePush);
router.get("/vapid-public-key", getVapidPublicKey);


/* admin & teacher */
router.post(
  "/",
  allowRoles("school_admin", "teacher"),
  validate(createNotificationSchema),
  createNotification
);

router.put(
  "/:id",
  allowRoles("school_admin", "teacher"),
  validate(updateNotificationSchema),
  updateNotification
);

router.delete(
  "/:id",
  allowRoles("school_admin", "teacher"),
  deleteNotification
);

/* all logged-in users */
router.get("/", listNotifications);
router.get("/active-posters", getActivePosters);

router.post("/mark-all-read", markAllNotificationsAsRead);

router.post(
  "/:id/acknowledge",
  protect,
  acknowledgeNotification
);

router.get(
  "/:id/acknowledgements",
  protect,
  listNotificationAcks
);

export default router;

