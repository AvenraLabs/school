import api from "../../../api/axios";
import { API_BASE_URL } from "../../../api/config";

export function sendChatMessage(payload) {
  return api.post("/rag/chat", payload);
}

export async function sendChatMessageStreamApi({ question, sessionId, onChunk }) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/rag/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({ question, sessionId }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || "Failed to generate response. Please try again.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let meta = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("data: ")) {
        const jsonStr = trimmed.slice(6);
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.chunk && onChunk) {
            onChunk(parsed.chunk);
          }
          if (parsed.done && parsed.meta) {
            meta = parsed.meta;
          }
        } catch (e) {}
      }
    }
  }

  return meta;
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
