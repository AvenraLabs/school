import { useState, useEffect, useCallback } from "react";
import {
  sendChatMessage,
  fetchChatSessions,
  fetchSessionMessages,
  deleteChatSession,
} from "../api/aiChat.api";

export function useAiChat() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Fetch all chat sessions for the student
  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await fetchChatSessions();
      const list = res.data?.sessions || [];
      setSessions(list);
    } catch (e) {
      console.error("Failed to load chat sessions:", e);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Load messages for the selected session
  const selectSession = useCallback(async (sessionId) => {
    if (!sessionId) {
      setActiveSessionId(null);
      setMessages([]);
      return;
    }
    setActiveSessionId(sessionId);
    setLoading(true);
    try {
      const res = await fetchSessionMessages(sessionId);
      const fetchedMsgs = (res.data?.messages || []).map((m) => ({
        role: m.sender === "user" ? "user" : "ai",
        text: m.content,
        sources: m.sources || [],
        timestamp: m.createdAt,
      }));
      setMessages(fetchedMsgs);
    } catch (e) {
      console.error("Failed to load session messages:", e);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send message in current active session or auto-create a new one
  async function sendMessage(text) {
    const userMsg = {
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await sendChatMessage({
        question: text,
        sessionId: activeSessionId,
      });

      const { sessionId, answer, sources } = res.data;

      const aiMsg = {
        role: "ai",
        text: answer,
        sources: sources || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (!activeSessionId && sessionId) {
        setActiveSessionId(sessionId);
        await loadSessions();
      }

      return aiMsg.text;
    } catch (e) {
      console.error("Error sending AI chat message:", e);
    } finally {
      setLoading(false);
    }
  }

  // Create new conversation
  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  // Delete a session
  const removeSession = async (sessionId) => {
    try {
      await deleteChatSession(sessionId);
      if (activeSessionId === sessionId) {
        startNewChat();
      }
      await loadSessions();
    } catch (e) {
      console.error("Failed to delete chat session:", e);
    }
  };

  return {
    sessions,
    activeSessionId,
    messages,
    loading,
    sessionsLoading,
    sendMessage,
    selectSession,
    startNewChat,
    removeSession,
    refreshSessions: loadSessions,
  };
}
