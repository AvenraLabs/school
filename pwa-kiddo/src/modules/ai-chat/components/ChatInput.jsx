import { useState, useRef, useEffect } from "react";
import { Send } from "@mui/icons-material";
import { Paper, InputBase, IconButton, useTheme, Fade } from "@mui/material";

export default function ChatInput({ onSend, disabled, placeholder = "Type a message..." }) {
  const [message, setMessage] = useState("");
  const inputRef = useRef(null);
  const theme = useTheme();

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
      // Focus back on input after sending
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: 20, // Pill shape
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'box-shadow 0.3s ease',
        '&:focus-within': {
          boxShadow: `0 0 0 2px ${theme.palette.primary.main}40`, // focus ring
          borderColor: theme.palette.primary.main,
        }
      }}
    >
      <InputBase
        inputRef={inputRef}
        sx={{ ml: 2, flex: 1, color: theme.palette.text.primary }}
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        disabled={disabled}
        multiline
        maxRows={4}
      />

      <Fade in={!!message.trim()}>
        <IconButton
          color="primary"
          sx={{ p: '10px' }}
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          aria-label="Send message"
        >
          <Send />
        </IconButton>
      </Fade>
    </Paper>
  );
}
