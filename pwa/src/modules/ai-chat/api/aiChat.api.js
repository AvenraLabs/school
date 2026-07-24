import api from "../../../api/axios";

export function sendChatMessage(payload) {
  return api.post("/rag/chat", payload);
}

export function fetchChatSessions() {
  return api.get("/rag/chat/sessions");
}

export function fetchSessionMessages(sessionId) {
  return api.get(`/rag/chat/sessions/${sessionId}`);
}

export function deleteChatSession(sessionId) {
  return api.delete(`/rag/chat/sessions/${sessionId}`);
}
