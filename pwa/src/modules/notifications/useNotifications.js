import { useEffect, useRef, useState, useCallback } from "react";
import {
  getNotifications,
  acknowledgeNotification,
  markAllNotificationsAsRead,
} from "./notifications.api";

const LIMIT = 15;

export function useNotifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const offsetRef = useRef(0);

  // ── Initial load + refresh event listener ──
  useEffect(() => {
    fetchPage(0, true);

    const handler = () => {
      offsetRef.current = 0;
      fetchPage(0, true);
    };
    window.addEventListener("notifications:refresh", handler);
    return () => window.removeEventListener("notifications:refresh", handler);
  }, []);

  const fetchPage = useCallback(async (offset, replace = false) => {
    try {
      if (replace) setLoading(true);
      else setLoadingMore(true);

      const res = await getNotifications({ limit: LIMIT, offset });
      const data = res.data?.items || res.data?.data || res.data || [];
      const total = res.data?.total ?? 0;

      setItems((prev) => (replace ? data : [...prev, ...data]));
      setHasMore(offset + LIMIT < total);
      offsetRef.current = offset;
    } catch {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextOffset = offsetRef.current + LIMIT;
    fetchPage(nextOffset, false);
  }, [loadingMore, hasMore, fetchPage]);

  async function acknowledge(id) {
    await acknowledgeNotification(id);
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, is_acknowledged: true } : n
      )
    );
    window.dispatchEvent(new Event("notifications:refresh"));
  }

  async function markAllRead() {
    try {
      await markAllNotificationsAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_acknowledged: true })));
      window.dispatchEvent(new Event("notifications:refresh"));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }

  return {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    acknowledge,
    markAllRead,
    loadMore,
    refresh: () => fetchPage(0, true),
  };
}
