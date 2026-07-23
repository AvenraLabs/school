import { useEffect, useState } from "react";
import { getTimetable } from "./timetable.api";
import { useAuth } from "../../auth/AuthProvider";

export function useTimetable() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.role) return;
    fetchTimetable();
  }, [user?.role]);

  async function fetchTimetable() {
    try {
      setLoading(true);
      setError(null);

      let targetClassId = null;
      let targetSectionId = null;

      targetClassId = user.class_id;
      targetSectionId = user.section_id;

      if (!targetClassId || !targetSectionId) {
        setError("Missing class/section context for timetable.");
        setTimetable(null);
        return;
      }

      const params = {
        class_id: targetClassId,
        section_id: targetSectionId,
      };

      const res = await getTimetable(params);
      setTimetable(res.data.data);
    } catch {
      setError("Failed to load timetable");
    } finally {
      setLoading(false);
    }
  }

  return {
    timetable,
    loading,
    error,
  };
}
