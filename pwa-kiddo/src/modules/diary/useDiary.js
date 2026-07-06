import { useEffect, useState, useCallback } from "react";
import { getDiary } from "./diary.api";
import { useAuth } from "../../auth/AuthProvider";

export function useDiary() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const limit = 10; // Fetch 10 items per page for mobile responsiveness

  // Initial load
  useEffect(() => {
    if (!user) return;
    fetchInitialDiary();
  }, [user]);

  async function fetchInitialDiary() {
    try {
      setLoading(true);
      setError(null);
      setOffset(0);

      const res = await getDiary({ limit, offset: 0 });
      const data = res?.data || res;
      
      const nextItems = Array.isArray(data?.items) ? data.items :
                        Array.isArray(data?.data) ? data.data :
                        Array.isArray(data) ? data : [];
      
      setItems(nextItems);
      setTotal(data?.total || nextItems.length);
    } catch (err) {
      setError("Failed to load diary");
    } finally {
      setLoading(false);
    }
  }

  const loadMore = useCallback(async () => {
    if (loadingMore || items.length >= total) return;
    try {
      setLoadingMore(true);
      const nextOffset = offset + limit;
      setOffset(nextOffset);

      const res = await getDiary({ limit, offset: nextOffset });
      const data = res?.data || res;
      
      const nextItems = Array.isArray(data?.items) ? data.items :
                        Array.isArray(data?.data) ? data.data :
                        Array.isArray(data) ? data : [];

      setItems((prev) => [...prev, ...nextItems]);
      setTotal(data?.total || (items.length + nextItems.length));
    } catch (err) {
      console.error("Failed to load more diary items", err);
    } finally {
      setLoadingMore(false);
    }
  }, [items, total, offset, loadingMore]);

  return {
    items,
    total,
    loading,
    loadingMore,
    error,
    refresh: fetchInitialDiary,
    loadMore,
    hasMore: items.length < total,
  };
}
