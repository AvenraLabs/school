import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import {
  submitSinglePlayerQuiz,
  startSinglePlayerQuiz,
  createMultiplayerQuiz,
  getLeaderboard,
  joinMultiplayerQuiz,
  getQuizHistory,
} from "./game.controller.js";

const router = express.Router();

router.use(protect);

// Quiz is for students only
router.post(
  "/quiz/single/start",
  allowRoles("student"),
  startSinglePlayerQuiz
);

router.post(
  "/quiz/multi/create",
  allowRoles("student"),
  createMultiplayerQuiz
);

router.post(
  "/quiz/single/submit",
  allowRoles("student"),
  submitSinglePlayerQuiz
);

router.get(
  "/quiz/:sessionId/leaderboard",
  allowRoles("student"),
  getLeaderboard
);

router.get(
  "/quiz/history",
  allowRoles("student"),
  getQuizHistory
);

router.post(
  "/quiz/multi/join",
  allowRoles("student"),
  joinMultiplayerQuiz
);

export default router;
