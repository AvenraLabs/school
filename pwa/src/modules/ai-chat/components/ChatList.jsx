import { Box } from "@mui/material";
import MessageBubble from "./MessageBubble";
import { useEffect, useRef } from "react";

export default function ChatList({ messages, userAvatar }) {
  const bottomRef = useRef(null);
  const didInitialLoad = useRef(false);

  useEffect(() => {
    if (!didInitialLoad.current) {
      if (messages.length) {
        didInitialLoad.current = true;
      }
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", p: 2 }}>
      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} userAvatar={userAvatar} />
      ))}
      <div ref={bottomRef} />
    </Box>
  );
}
