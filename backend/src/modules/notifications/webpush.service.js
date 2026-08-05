import webpush from "web-push";
import { Op } from "sequelize";
import PushSubscription from "./push-subscription.model.js";
import User from "../users/user.model.js";

// Initialize VAPID details if keys are present
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:founders@avenra.org";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

/**
 * Save or update a push subscription for a user device
 */
export async function savePushSubscription({ school_id, user_id, subscription, user_agent }) {
  if (!subscription || !subscription.endpoint || !subscription.keys) {
    throw new Error("Invalid push subscription format");
  }

  const { endpoint, keys } = subscription;
  const { p256dh, auth } = keys;

  const [record, created] = await PushSubscription.findOrCreate({
    where: { user_id, endpoint },
    defaults: {
      school_id,
      user_id,
      endpoint,
      p256dh,
      auth,
      user_agent: user_agent || null,
    },
  });

  if (!created) {
    record.p256dh = p256dh;
    record.auth = auth;
    record.user_agent = user_agent || null;
    await record.save();
  }

  return record;
}

/**
 * Remove a push subscription by user_id and endpoint
 */
export async function removePushSubscription({ user_id, endpoint }) {
  return PushSubscription.destroy({
    where: { user_id, endpoint },
  });
}

/**
 * Send Web Push notification to a list of PushSubscription model records
 */
async function sendNotificationToSubscriptions(subscriptions, payload) {
  const payloadString = JSON.stringify(payload);

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, payloadString);
      } catch (error) {
        // HTTP 404 (Not Found) or 410 (Gone) indicates subscription expired or revoked
        if (error.statusCode === 404 || error.statusCode === 410) {
          console.log(`[WebPush] Removing expired subscription ${sub.id} for user ${sub.user_id}`);
          await PushSubscription.destroy({ where: { id: sub.id } });
        } else {
          console.error(`[WebPush] Push failed for subscription ${sub.id}:`, error.message);
        }
      }
    })
  );

  return results;
}

/**
 * Dispatch targeted Web Push notifications to targeted users in a school
 */
export async function dispatchTargetedPushNotification({
  school_id,
  target_role,
  class_id,
  section_id,
  target_user_id,
  title,
  message,
  deep_link,
  notification_id,
}) {
  try {
    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn("[WebPush] Skipping push: VAPID keys not configured in environment.");
      return;
    }

    // Build query to find matching push subscriptions
    let userWhere = { school_id };

    if (target_user_id) {
      userWhere.id = target_user_id;
    } else {
      if (target_role && target_role !== "all") {
        userWhere.role = target_role;
      }
      if (target_role === "student" || target_role === "all") {
        if (class_id) userWhere.class_id = class_id;
        if (section_id) userWhere.section_id = section_id;
      }
    }

    // Query active subscriptions matching user criteria
    const subscriptions = await PushSubscription.findAll({
      where: { school_id },
      include: [
        {
          model: User,
          as: "user",
          where: userWhere,
          attributes: ["id", "role", "class_id", "section_id"],
          required: true,
        },
      ],
    });

    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    const payload = {
      title,
      body: message,
      icon: "/schooliq.jpeg",
      badge: "/schooliq.jpeg",
      data: {
        id: notification_id,
        url: deep_link || "/notifications",
      },
    };

    await sendNotificationToSubscriptions(subscriptions, payload);
  } catch (error) {
    console.error("[WebPush] Error dispatching push notifications:", error);
  }
}
