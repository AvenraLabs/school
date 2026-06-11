import api from "../../../api/axios";

export function askAi(question, classLevel) {
  return api.post("/rag/ask", {
    question,
    classLevel,
  });
}

export function askAiVoice(question, classLevel) {
  return api.post(
    "/rag/ask?voice=true",
    { question, classLevel },
    { responseType: "arraybuffer" }
  );
}

export function speakText(text) {
  return api.post(
    "/rag/speak",
    { text },
    { responseType: "arraybuffer" }
  );
}
