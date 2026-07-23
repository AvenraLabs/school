import api from "../../../api/axios";

export function askAiQuestion(payload) {
  return api.post("/rag/ask", payload);
}
