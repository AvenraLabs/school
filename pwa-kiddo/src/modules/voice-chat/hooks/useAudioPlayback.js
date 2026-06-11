import { useRef, useState } from "react";

export function useAudioPlayback() {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  function play(buffer) {
    const blob = new Blob([buffer], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onplay = () => setPlaying(true);
    audio.onended = () => setPlaying(false);

    audio.play();
  }

  return {
    play,
    playing,
  };
}
