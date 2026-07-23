import { useEffect, useState } from "react";
import { getReportCard } from "./reportCard.api";
import api from "../../api/axios";

export function useReportCard(reportCardId) {
  const [data, setData] = useState(null);
  const [gradingScales, setGradingScales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reportCardId) return;
    fetchReportCard();
  }, [reportCardId]);

  async function fetchReportCard() {
    try {
      setLoading(true);
      const [res, scaleRes] = await Promise.all([
        getReportCard(reportCardId),
        api.get("/report-cards/grading-scales")
      ]);
      setData(res.data.data);
      setGradingScales(scaleRes.data?.data || []);
    } catch {
      setError("Failed to load report card");
    } finally {
      setLoading(false);
    }
  }

  return {
    data,
    gradingScales,
    loading,
    error,
  };
}
