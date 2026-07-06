import { useState, useEffect, useCallback, useRef } from "react";

export function useSpeechSynthesis() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSupported(true);
    }
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, [supported]);

  const speak = useCallback((text, onStart, onEnd) => {
    if (!supported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text by removing markdown notation (like *, #, etc.) to make TTS read smoothly
    const cleanText = text
      .replace(/[*#`_\-]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Simplify markdown links to just their text
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Detect if text contains Tamil characters (Unicode range: \u0B80 to \u0BFF)
    const containsTamil = /[\u0B80-\u0BFF]/.test(cleanText);

    // Get all available voices
    const voices = window.speechSynthesis.getVoices();

    if (containsTamil) {
      // Find Tamil voice (case-insensitive, supporting ta-in, ta_in, ta-lk, and ta)
      const tamilVoice = voices.find((voice) => {
        const langLower = voice.lang.toLowerCase().replace("_", "-");
        return (
          langLower === "ta-in" ||
          langLower === "ta-lk" ||
          langLower === "ta" ||
          langLower.startsWith("ta-")
        );
      });
      if (tamilVoice) {
        utterance.voice = tamilVoice;
      }
      utterance.lang = "ta-IN";
    } else {
      // Find an English voice (prefer Indian/US English if available)
      const englishVoice = voices.find((voice) => {
        const langLower = voice.lang.toLowerCase().replace("_", "-");
        return (
          langLower === "en-in" ||
          langLower === "en-us" ||
          langLower === "en-gb" ||
          langLower.startsWith("en-")
        );
      });
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      utterance.lang = "en-US";
    }

    // Set rate and pitch for standard clear school instructions
    utterance.rate = containsTamil ? 0.85 : 0.95; // Slightly slower for Tamil to be more distinct
    utterance.pitch = 1.0;

    // Handle events
    utterance.onstart = () => {
      setIsPlaying(true);
      if (onStart) onStart();
    };

    utterance.onend = () => {
      setIsPlaying(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = (event) => {
      console.error("SpeechSynthesis error:", event);
      setIsPlaying(false);
      if (onEnd) onEnd();
    };

    // Speak
    window.speechSynthesis.speak(utterance);
  }, [supported]);

  return {
    speak,
    stop,
    isPlaying,
    supported,
  };
}
