import api from "../../api/axios";

export const getStudentAnalytics = (studentId) =>
  api.get(`/parents/student-analytics/${studentId}`);

export const getParentChildren = () =>
  api.get("/parents/children");
