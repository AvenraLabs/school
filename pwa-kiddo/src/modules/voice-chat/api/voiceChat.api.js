import api from "../../../api/axios";

export function askAi(question, classLevel) {
  return api.post("/rag/ask", {
    question,
    classLevel,
  });
}
