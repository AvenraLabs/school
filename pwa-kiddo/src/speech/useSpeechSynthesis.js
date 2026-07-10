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

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[*#`_\-]/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    const containsTamil = /[\u0B80-\u0BFF]/.test(cleanText);
    const voices = window.speechSynthesis.getVoices();

    if (containsTamil) {
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

    utterance.rate = containsTamil ? 0.85 : 0.95;
    utterance.pitch = 1.0;

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

    window.speechSynthesis.speak(utterance);
  }, [supported]);

  return {
    speak,
    stop,
    isPlaying,
    supported,
  };
}
