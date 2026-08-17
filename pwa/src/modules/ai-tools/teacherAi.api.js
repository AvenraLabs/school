import api from "../../api/axios";

export const generateTeacherAiApi = (payload) =>
  api.post("/teacher-ai/generate", payload, { timeout: 180000 });

export const saveTeacherAiDocumentApi = (payload) =>
  api.post("/teacher-ai/documents", payload);

export const updateTeacherAiDocumentApi = (id, payload) =>
  api.put(`/teacher-ai/documents/${id}`, payload);

export const listTeacherAiDocumentsApi = (params) =>
  api.get("/teacher-ai/documents", { params });

export const deleteTeacherAiDocumentApi = (id) =>
  api.delete(`/teacher-ai/documents/${id}`);
