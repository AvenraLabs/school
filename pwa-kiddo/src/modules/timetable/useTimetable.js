import { useEffect, useState } from "react";
import { getTimetable } from "./timetable.api";
import { useAuth } from "../../auth/AuthProvider";
import { getParentChildren } from "../parent-analytics/parent-analytics.api";

export function useTimetable() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  useEffect(() => {
    if (!user?.role) return;

    if (user.role === "parent") {
      async function loadChildren() {
        try {
          setLoading(true);
          const res = await getParentChildren();
          const list = res.data?.data || [];
          setChildren(list);
          if (list.length > 0) {
            setSelectedStudentId(list[0].student?.id);
          } else {
            setError("No approved linked children found for this parent.");
            setLoading(false);
          }
        } catch (err) {
          console.error("Failed to load parent's children", err);
          setError("Failed to load linked children.");
          setLoading(false);
        }
      }
      loadChildren();
    } else {
      setChildren([]);
      setSelectedStudentId(null);
    }
  }, [user?.role]);

  useEffect(() => {
    if (!user?.role) return;
    if (user.role === "parent" && !selectedStudentId) return;

    fetchTimetable();
  }, [user?.role, selectedStudentId]);

  async function fetchTimetable() {
    try {
      setLoading(true);
      setError(null);

      let targetClassId = null;
      let targetSectionId = null;

      if (user.role === "parent") {
        const activeChild = children.find(c => c.student?.id === selectedStudentId);
        if (activeChild?.student) {
          targetClassId = activeChild.student.class_id || activeChild.student.class?.id;
          targetSectionId = activeChild.student.section_id || activeChild.student.section?.id;
        }
      } else {
        targetClassId = user.class_id;
        targetSectionId = user.section_id;
      }

      console.log("Timetable User Context:", { targetClassId, targetSectionId, role: user.role });

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
    children,
    selectedStudentId,
    setSelectedStudentId,
  };
}

