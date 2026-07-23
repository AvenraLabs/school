import api from "../../api/axios";

export const runTeacherAi = (aiType, payload) =>
  api.post("/teacher/ai", { aiType, payload });

export const getTeacherAiHistory = () =>
  api.get("/teacher/ai/history");
