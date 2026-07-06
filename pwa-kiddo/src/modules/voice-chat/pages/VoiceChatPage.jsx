import { useState, useEffect, Suspense } from "react";
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Fade,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import ChatInput from "../../ai-chat/components/ChatInput";
import { askAi } from "../api/voiceChat.api";
import { useAuth } from "../../../auth/AuthProvider";
import { useSpeechSynthesis } from "../../../speech/useSpeechSynthesis";

export default function VoiceChatPage() {
  const { user } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const { speak, stop, isPlaying } = useSpeechSynthesis();

  useEffect(() => {
    const introTimer = setTimeout(() => setShowIntro(false), 1800);
    return () => {
      clearTimeout(introTimer);
      stop();
    };
  }, [stop]);

  const handleVoiceQuery = async (text) => {
    if (!text || loading) return;
    setLoading(true);
    stop(); // Stop any currently playing audio

    try {
      const res = await askAi(text, user?.class_level);
      const answer =
        res?.data?.answer ??
        res?.data?.data?.answer ??
        "I could not find an answer in the textbook.";
      
      speak(answer);
    } catch (err) {
      console.error("Voice chat failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const gifState = showIntro
    ? "hi"
    : loading
    ? "thinking"
    : isPlaying
    ? "speaking"
    : "listening";

  const gifSrcMap = {
    hi: "/gif/Hi.gif",
    listening: "/gif/Listining.gif",
    thinking: "/gif/thinking.gif",
    speaking: "/gif/Speaking.gif",
  };

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: "flex",
        bgcolor: theme.palette.background.default,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/*
      <Canvas
        camera={{ position: [0, 1.4, 3.2], fov: 45 }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.6} />
        <spotLight position={[5, 10, 5]} angle={0.25} penumbra={1} intensity={1} />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color={theme.palette.primary.main} />
        <Suspense fallback={<Loader />}>
          <RobotModel speaking={speaking} position={[0, -1.3, 0]} scale={0.12} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2.6}
          maxPolarAngle={Math.PI / 1.7}
        />
      </Canvas>
      */}

      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          bgcolor: theme.palette.background.paper,
          boxShadow: 1,
          zIndex: 2,
        }}
      >
        <ArrowBack />
      </IconButton>

      <Box
        sx={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "calc(env(safe-area-inset-bottom) + 72px)",
          px: 2,
          zIndex: 2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
          <Box
            component="img"
            src={gifSrcMap[gifState]}
            alt={gifState}
            sx={{ height: 140, width: "auto" }}
          />
        </Box>

        <Box
          sx={{
            pb: 2,
          }}
        >
          <ChatInput
            onSend={(text) => handleVoiceQuery(text)}
            disabled={loading}
            placeholder="Type a question..."
          />
        </Box>
      </Box>
    </Box>
  );
}
