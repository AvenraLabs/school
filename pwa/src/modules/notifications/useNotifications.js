import { useEffect, useRef, useState, useCallback } from "react";
import {
  getNotifications,
  acknowledgeNotification,
  markAllNotificationsAsRead,
} from "./notifications.api";
import { useAuth } from "../../auth/AuthProvider";

const LIMIT = 15;

// Shared module-level state across all hook consumers (AppHeader, NotificationsPage, etc.)
let sharedItems = [];
let sharedTotal = 0;
let sharedHasMore = false;
let currentUserId = null;
let isFetching = false;
const listeners = new Set();

function notifyAll() {
  const currentList = [...sharedItems];
  listeners.forEach((fn) => fn(currentList));
}

export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id;

  const [items, setItems] = useState(sharedItems);
  const [loading, setLoading] = useState(sharedItems.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(sharedHasMore);
  const offsetRef = useRef(0);

  // Subscribe component to shared notifications state
  useEffect(() => {
    listeners.add(setItems);
    // Sync current shared items immediately on mount
    setItems([...sharedItems]);
    setHasMore(sharedHasMore);

    return () => {
      listeners.delete(setItems);
    };
  }, []);

  const fetchPage = useCallback(async (offset = 0, replace = false) => {
    if (isFetching && !replace) return;
    try {
      isFetching = true;
      if (replace) setLoading(true);
      else setLoadingMore(true);

      const res = await getNotifications({ limit: LIMIT, offset });
      const data = res.data?.items || res.data?.data || res.data || [];
      const total = res.data?.total ?? 0;

      if (replace) {
        sharedItems = data;
      } else {
        const existingIds = new Set(sharedItems.map((n) => String(n.id)));
        const newItems = data.filter((n) => !existingIds.has(String(n.id)));
        sharedItems = [...sharedItems, ...newItems];
      }

      sharedTotal = total;
      sharedHasMore = offset + LIMIT < total;
      setHasMore(sharedHasMore);
      offsetRef.current = offset;
      notifyAll();
    } catch {
      setError("Failed to load notifications");
    } finally {
      isFetching = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Handle user change or initial fetch
  useEffect(() => {
    if (!userId) {
      sharedItems = [];
      sharedTotal = 0;
      sharedHasMore = false;
      currentUserId = null;
      notifyAll();
      return;
    }

    if (currentUserId !== userId) {
      currentUserId = userId;
      sharedItems = [];
      sharedTotal = 0;
      sharedHasMore = false;
      offsetRef.current = 0;
      fetchPage(0, true);
    } else if (sharedItems.length === 0) {
      fetchPage(0, true);
    }
  }, [userId, fetchPage]);

  // Window event listeners for global sync across multiple tabs/windows/instances
  useEffect(() => {
    const refreshHandler = () => {
      offsetRef.current = 0;
      fetchPage(0, true);
    };

    const ackHandler = (e) => {
      const ackId = e.detail?.id;
      if (!ackId) return;
      sharedItems = sharedItems.map((n) =>
        String(n.id) === String(ackId) ? { ...n, is_acknowledged: true } : n
      );
      notifyAll();
    };

    const markAllHandler = () => {
      sharedItems = sharedItems.map((n) => ({ ...n, is_acknowledged: true }));
      notifyAll();
    };

    window.addEventListener("notifications:refresh", refreshHandler);
    window.addEventListener("notifications:acknowledged", ackHandler);
    window.addEventListener("notifications:mark-all-read", markAllHandler);

    return () => {
      window.removeEventListener("notifications:refresh", refreshHandler);
      window.removeEventListener("notifications:acknowledged", ackHandler);
      window.removeEventListener("notifications:mark-all-read", markAllHandler);
    };
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (loadingMore || !sharedHasMore || isFetching) return;
    const nextOffset = offsetRef.current + LIMIT;
    fetchPage(nextOffset, false);
  }, [loadingMore, fetchPage]);

  async function acknowledge(id) {
    if (!id) return;

    // 1. Optimistic update immediately in memory across all components
    sharedItems = sharedItems.map((n) =>
      String(n.id) === String(id) ? { ...n, is_acknowledged: true } : n
    );
    notifyAll();

    // 2. Broadcast custom event
    window.dispatchEvent(
      new CustomEvent("notifications:acknowledged", { detail: { id } })
    );

    // 3. Persist to API in background
    try {
      await acknowledgeNotification(id);
    } catch (err) {
      console.error("Failed to acknowledge notification:", err);
    }
  }

  async function markAllRead() {
    // 1. Optimistic update immediately across all components
    sharedItems = sharedItems.map((n) => ({ ...n, is_acknowledged: true }));
    notifyAll();

    // 2. Broadcast custom event
    window.dispatchEvent(new Event("notifications:mark-all-read"));

    // 3. Persist to API in background
    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  }

  const unreadCount = items.filter((n) => !n.is_acknowledged).length;

  return {
    items,
    unreadCount,
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
