import api from "../../../api/axios";

// Single player
export const startSingleQuiz = (data) =>
  api.post("/game/quiz/single/start", data);

export const submitSingleQuiz = (payload) =>
  api.post("/game/quiz/single/submit", payload);

export const getQuizLeaderboard = (sessionId) =>
  api.get(`/game/quiz/${sessionId}/leaderboard`);

export const getQuizHistory = (params) =>
  api.get("/game/quiz/history", { params });

// Multiplayer join (host or participant)
export const joinQuizRoom = ({ roomCode }) =>
  api.post("/game/quiz/multi/join", { roomCode });

// Multiplayer create
export const createMultiplayerQuiz = (payload) =>
  api.post("/game/quiz/multi/create", payload);

// Backward compatibility for existing hooks/components
export const createQuizSession = (data) =>
  joinQuizRoom({ roomCode: data?.roomCode || data?.topic || data });
export const joinQuizSession = (sessionId) =>
  joinQuizRoom({ roomCode: sessionId });

// AI generated quiz (topic -> questions)
export const generateQuiz = (payload) =>
  api.post("/quiz/generate", payload);

// Optional: legacy hook support
export const getQuizQuestions = (params) => {
  if (!params?.topic) {
    return Promise.reject(new Error("Quiz topic is required"));
  }
  return generateQuiz(params);
};
