import { useState, useEffect, useCallback, useRef } from "react";
import {
  sendChatMessage,
  sendChatMessageStreamApi,
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
  const activeSessionIdRef = useRef(activeSessionId);
  const isSendingRef = useRef(false);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

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
    activeSessionIdRef.current = sessionId;
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

  // Send message in current active session with real-time token streaming
  async function sendMessage(text) {
    if (!text || !text.trim() || isSendingRef.current) return;
    
    isSendingRef.current = true;
    const userMsg = {
      role: "user",
      text,
      timestamp: new Date(),
    };

    const aiMsg = {
      role: "ai",
      text: "",
      sources: [],
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setLoading(true);

    let streamText = "";

    try {
      const currentSessionId = activeSessionIdRef.current;
      const meta = await sendChatMessageStreamApi({
        question: text,
        sessionId: currentSessionId,
        onChunk: (chunk) => {
          streamText += chunk;
          setMessages((prev) => {
            const copy = [...prev];
            if (copy.length > 0 && copy[copy.length - 1].role === "ai") {
              copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                text: streamText,
              };
            }
            return copy;
          });
        },
      });

      if (meta) {
        setMessages((prev) => {
          const copy = [...prev];
          if (copy.length > 0 && copy[copy.length - 1].role === "ai") {
            copy[copy.length - 1] = {
              ...copy[copy.length - 1],
              text: meta.answer || streamText,
              sources: meta.sources || [],
            };
          }
          return copy;
        });

        if (meta.sessionId) {
          activeSessionIdRef.current = meta.sessionId;
          if (activeSessionId !== meta.sessionId) {
            setActiveSessionId(meta.sessionId);
          }
          await loadSessions();
        }
      }

      return streamText;
    } catch (e) {
      console.error("Error sending AI chat message:", e);
      setMessages((prev) => {
        const copy = [...prev];
        if (copy.length > 0 && copy[copy.length - 1].role === "ai" && !copy[copy.length - 1].text) {
          copy[copy.length - 1] = {
            ...copy[copy.length - 1],
            text: e.message || "I'm sorry, I encountered a temporary connection issue while answering your question. Please try again in a few moments!",
          };
        }
        return copy;
      });
    } finally {
      setLoading(false);
      isSendingRef.current = false;
    }
  }

  // Create new conversation
  const startNewChat = () => {
    activeSessionIdRef.current = null;
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
