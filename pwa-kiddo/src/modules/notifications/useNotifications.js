import { useEffect, useState } from "react";
import {
  getNotifications,
  acknowledgeNotification,
  markAllNotificationsAsRead,
} from "./notifications.api";

export function useNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
    const handler = () => fetchNotifications();
    window.addEventListener("notifications:refresh", handler);
    return () => window.removeEventListener("notifications:refresh", handler);
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const res = await getNotifications();
      setItems(res.data.data || res.data.items || res.data);
    } catch {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function acknowledge(id) {
    await acknowledgeNotification(id);
    setItems((prev) =>
      prev.map((n) =>
        n.id === id
          ? { ...n, is_acknowledged: true }
          : n
      )
    );
    window.dispatchEvent(new Event("notifications:refresh"));
  }

  async function markAllRead() {
    try {
      await markAllNotificationsAsRead();
      setItems((prev) =>
        prev.map((n) => ({ ...n, is_acknowledged: true }))
      );
      window.dispatchEvent(new Event("notifications:refresh"));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }

  return {
    items,
    loading,
    error,
    acknowledge,
    markAllRead,
    refresh: fetchNotifications,
  };
}
