import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff } from "@mui/icons-material";
import { Paper, InputBase, IconButton, useTheme, Fade, Box, Tooltip } from "@mui/material";

export default function ChatInput({ onSend, disabled, placeholder = "Ask anything..." }) {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript.trim()) {
          setMessage(currentTranscript);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (err) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        setMessage("");
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const handleSend = () => {
    if (disabled) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    const textToSend = message.trim();
    if (textToSend) {
      setMessage("");
      onSend(textToSend);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: "4px 8px",
        display: "flex",
        alignItems: "center",
        borderRadius: 20, // Pill shape
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${isListening ? "#ef4444" : theme.palette.divider}`,
        boxShadow: isListening ? "0 0 0 3px rgba(239, 68, 68, 0.25)" : "0 2px 10px rgba(0,0,0,0.04)",
        transition: "all 0.3s ease",
        "&:focus-within": {
          boxShadow: isListening
            ? "0 0 0 3px rgba(239, 68, 68, 0.25)"
            : `0 0 0 2px ${theme.palette.primary.main}40`,
          borderColor: isListening ? "#ef4444" : theme.palette.primary.main,
        },
      }}
    >
      {/* Speech-to-Text Mic Button */}
      <Tooltip title={isListening ? "Listening... Click to stop" : "Speak to type"}>
        <IconButton
          onClick={toggleListening}
          sx={{
            p: "10px",
            color: isListening ? "#ffffff" : theme.palette.text.secondary,
            bgcolor: isListening ? "#ef4444" : "transparent",
            animation: isListening ? "micPulse 1.2s infinite" : "none",
            "&:hover": {
              bgcolor: isListening ? "#dc2626" : "rgba(0,0,0,0.04)",
            },
          }}
        >
          {isListening ? <MicOff sx={{ fontSize: 20 }} /> : <Mic sx={{ fontSize: 20 }} />}
        </IconButton>
      </Tooltip>

      <InputBase
        inputRef={inputRef}
        sx={{ ml: 1, flex: 1, color: theme.palette.text.primary, fontSize: "14px" }}
        placeholder={isListening ? "Listening... Speak now" : placeholder}
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
          sx={{ p: "10px" }}
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          aria-label="Send message"
        >
          <Send />
        </IconButton>
      </Fade>

      <style>{`
        @keyframes micPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.6); }
          70% { transform: scale(1.08); box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </Paper>
  );
}
