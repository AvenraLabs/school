import { useState, useEffect } from "react";
import { askAiQuestion } from "../api/aiChat.api";

const SESSION_KEY = "schooliq_ai_chat_messages";

export function useAiChat({ classLevel }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Failed to sync chat messages to session cache:", e);
    }
  }, [messages]);

  async function sendMessage(text) {
    const userMsg = {
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await askAiQuestion({
        question: text,
        classLevel,
      });

      const aiMsg = {
        role: "ai",
        text: res.data.answer,
        sources: res.data.sources || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      return aiMsg.text; // IMPORTANT: for voice mode
    } finally {
      setLoading(false);
    }
  }

  const clearChat = () => {
    setMessages([]);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  };

  return {
    messages,
    loading,
    sendMessage,
    clearChat,
  };
}
