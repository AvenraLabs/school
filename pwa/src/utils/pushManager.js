import api from "../api/axios";

/**
 * Utility to convert URL-safe Base64 string to Uint8Array for VAPID applicationServerKey
 */
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Request notification permission and subscribe device to Web Push
 */
export async function registerAndSubscribePush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("[PushManager] Web Push is not supported in this browser environment.");
    return false;
  }

  try {
    // 1. Request user permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("[PushManager] Push notification permission denied by user.");
      return false;
    }

    // 2. Obtain VAPID Public Key from env or backend
    let vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      try {
        const res = await api.get("/notifications/vapid-public-key");
        vapidPublicKey = res.data?.data?.publicKey;
      } catch (e) {
        console.error("[PushManager] Failed to fetch VAPID public key from backend:", e);
      }
    }

    if (!vapidPublicKey) {
      console.error("[PushManager] VAPID public key missing. Skipping push subscription.");
      return false;
    }

    // 3. Wait for service worker registration
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      console.warn("[PushManager] Service Worker registration not ready.");
      return false;
    }

    // 4. Check existing subscription or subscribe fresh
    let subscription = await registration.pushManager.getSubscription();
    const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
      console.log("[PushManager] Successfully created new push subscription.");
    }

    // 5. Send subscription payload to backend DB
    const subscriptionJSON = subscription.toJSON();
    await api.post("/notifications/push-subscribe", {
      subscription: subscriptionJSON,
    });

    console.log("[PushManager] Push subscription synced with backend server.");
    return true;
  } catch (error) {
    console.error("[PushManager] Failed to subscribe device to Web Push:", error);
    return false;
  }
}

/**
 * Unsubscribe current device from Web Push
 */
export async function unsubscribePushDevice() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      await api.post("/notifications/push-unsubscribe", { endpoint });
      console.log("[PushManager] Unsubscribed device from push notifications.");
    }
  } catch (error) {
    console.error("[PushManager] Error unsubscribing device:", error);
  }
}
