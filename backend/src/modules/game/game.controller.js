import { Op } from "sequelize";
import User from "../users/user.model.js";
import GameSession from "./game-session.model.js";
import GameSessionPlayer from "./game-session-player.model.js";
import PlayerAnswer from "./player-answer.model.js";
import Quiz from "../quiz/quiz.model.js";
import QuizQuestion from "../quiz/quiz-question.model.js";
import { generateQuizFromAi } from "../quiz/quiz-rag.service.js";
import { isTimeOver } from "./game.utils.js";
import AppError from "../../shared/appError.js";
import asyncHandler from "../../shared/asyncHandler.js";
import db from "../../config/db.js";


// Curated charset: uppercase letters + digits, minus visually confusing chars (0/O, 1/I, 8/B, 2/Z)
const ROOM_CODE_CHARSET = "ACDEFGHJKLMNPQRSTUVWXY3456789";

function generateRoomCode(length = 4) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ROOM_CODE_CHARSET[Math.floor(Math.random() * ROOM_CODE_CHARSET.length)];
  }
  return code;
}


export const submitSinglePlayerQuiz = asyncHandler(async (req, res) => {
  const { playerId, answers } = req.body;

  if (!playerId || !Array.isArray(answers)) {
    throw new AppError("playerId and answers are required", 400);
  }

  const player = await GameSessionPlayer.findByPk(playerId, {
    include: [{ model: GameSession }],
  });

  if (!player) {
    throw new AppError("Player not found", 404);
  }

  const session =
    player.GameSession ||
    player.game_session ||
    (await GameSession.findByPk(player.session_id));

  if (!session) {
    throw new AppError("Game session not found", 404);
  }

  if (player.status === "FINISHED") {
    const total = await PlayerAnswer.count({
      where: { session_player_id: player.id },
    });

    return res.json({
      score: player.score ?? 0,
      total: total || answers.length,
      alreadySubmitted: true,
    });
  }

  if (isTimeOver(session)) {
    if (session.status !== "FINISHED") {
      await session.update({ status: "FINISHED", ended_at: new Date() });
    }
    throw new AppError("Time is over", 403);
  }

  let score = 0;

  const playerIdNum = Number(playerId);

  await db.transaction(async (t) => {
    await PlayerAnswer.destroy({
      where: { session_player_id: playerIdNum },
      transaction: t,
    });

    for (const ans of answers) {
      const question = await QuizQuestion.findByPk(ans.questionId, {
        transaction: t,
      });

      if (!question) {
        throw new AppError("QUESTION_NOT_FOUND", 400);
      }

      const isCorrect =
        Number(question.correct_option_index) === Number(ans.selectedIndex);

      if (isCorrect) score++;

      await PlayerAnswer.create(
        {
          session_player_id: playerIdNum,
          question_id: ans.questionId,
          selected_option_index: ans.selectedIndex,
          is_correct: isCorrect,
        },
        { transaction: t }
      );
    }

    await player.update(
      {
        score,
        status: "FINISHED",
        finished_at: new Date(),
      },
      { transaction: t }
    );

    await session.update(
      {
        status: "FINISHED",
        ended_at: new Date(),
      },
      { transaction: t }
    );
  });

  res.json({ score, total: answers.length });
});

export const startSinglePlayerQuiz = asyncHandler(async (req, res) => {
  const { quizId, timeLimitMinutes, topic, numQuestions } = req.body;

  const session = await GameSession.create({
    quiz_id: quizId,
    mode: "SINGLE",
    host_user_id: req.user.id,
    total_time_ms: (timeLimitMinutes || 5) * 60 * 1000,
    status: "IN_PROGRESS",
    started_at: new Date(),
    settings: {
      topic: topic || "Quiz",
      numQuestions: numQuestions || 5,
    },
  });

  const player = await GameSessionPlayer.create({
    session_id: session.id,
    user_id: req.user.id,
    is_host: true,
    status: "PLAYING",
  });

  res.json({ sessionId: session.id, playerId: player.id });
});

export const createMultiplayerQuiz = asyncHandler(async (req, res) => {
  const {
    topic,
    classLevel,
    difficulty,
    numQuestions,
    maxPlayers,
    timeLimitMinutes,
  } = req.body;

  if (!topic) {
    throw new AppError("Topic required", 400);
  }

  const perQuestionMs = 30000;
  const totalQuestions = numQuestions || 5;
  const totalTimeMs = timeLimitMinutes
    ? timeLimitMinutes * 60 * 1000
    : totalQuestions * perQuestionMs;

  let session = null;
  const MAX_RETRIES = 10;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const candidateCode = generateRoomCode(4);
    try {
      session = await GameSession.create({
        quiz_id: null,
        mode: "MULTI",
        room_code: candidateCode,
        host_user_id: req.user.id,
        max_players: maxPlayers ?? null,
        total_time_ms: totalTimeMs,
        status: "LOBBY",
        settings: {
          topic,
          classLevel,
          difficulty,
          numQuestions,
          timeLimitMinutes,
        },
      });
      break; // Success — exit loop
    } catch (err) {
      if (err.name === "SequelizeUniqueConstraintError") {
        continue;
      }
      throw err;
    }
  }

  if (!session) {
    throw new AppError("Unable to allocate a unique room code. Please try again.", 500);
  }

  res.json({
    sessionId: session.id,
    roomCode: session.room_code,
    quizId: null,
  });
});


export const getLeaderboard = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;

  const session = await GameSession.findByPk(sessionId);

  const leaderboard = await GameSessionPlayer.findAll({
    where: { session_id: sessionId },
    order: [["score", "DESC"], ["finished_at", "ASC"]],
    include: [{ model: User, attributes: ["id", "name", "avatar_url"] }],
    attributes: ["score", "finished_at", "user_id"],
  });

  const topic = session?.settings?.topic || "Quiz";
  const totalQuestions =
    session?.settings?.numQuestions ||
    session?.settings?.totalQuestions ||
    session?.settings?.total_questions ||
    5;

  let answersReview = [];
  if (session?.quiz_id && req.user?.id) {
    const myPlayer = await GameSessionPlayer.findOne({
      where: { session_id: sessionId, user_id: req.user.id },
    });
    if (myPlayer) {
      const [questions, myAnswers] = await Promise.all([
        QuizQuestion.findAll({
          where: { quiz_id: session.quiz_id },
          order: [["order_index", "ASC"]],
        }),
        PlayerAnswer.findAll({
          where: { session_player_id: myPlayer.id },
        }),
      ]);

      const answerMap = new Map();
      for (const ans of myAnswers) {
        answerMap.set(String(ans.question_id), ans);
      }

      answersReview = questions.map((q, idx) => {
        const playerAns = answerMap.get(String(q.id));
        return {
          id: q.id,
          order_index: q.order_index ?? (idx + 1),
          question_text: q.question_text,
          options: q.options,
          correct_option_index: q.correct_option_index,
          selected_option_index: playerAns ? playerAns.selected_option_index : null,
          is_correct: playerAns ? playerAns.is_correct : false,
          answered: !!playerAns,
          time_taken_ms: playerAns?.time_taken_ms || null,
        };
      });
    }
  }

  res.json({
    topic,
    totalQuestions,
    leaderboard,
    answersReview,
  });
});

export const joinMultiplayerQuiz = asyncHandler(async (req, res) => {
  const { roomCode } = req.body;
  const normalizedCode = roomCode ? String(roomCode).toUpperCase() : "";

  const session = await GameSession.findOne({
    where: { room_code: normalizedCode, status: { [Op.notIn]: ["FINISHED", "CANCELLED"] } },
  });

  if (!session) {
    throw new AppError("Room not found. Check the code and try again.", 404);
  }

  if (session.status === "FINISHED") {
    throw new AppError("Quiz already finished", 403);
  }

  if (isTimeOver(session)) {
    await session.update({ status: "FINISHED" });
    throw new AppError("Quiz time is over", 403);
  }

  // If the student already has a record in this session, return it
  const existing = await GameSessionPlayer.findOne({
    where: {
      session_id: session.id,
      user_id: req.user.id,
    },
  });

  if (existing) {
    return res.json({
      sessionId: session.id,
      playerId: existing.id,
      isHost: existing.is_host,
    });
  }

  const count = await GameSessionPlayer.count({
    where: { session_id: session.id },
  });

  if (session.max_players && count >= session.max_players) {
    throw new AppError("Room is full", 403);
  }

  const player = await GameSessionPlayer.create({
    session_id: session.id,
    user_id: req.user.id,
    is_host: session.host_user_id === req.user.id,
    status: "JOINED",
  });

  res.json({
    sessionId: session.id,
    playerId: player.id,
    isHost: player.is_host,
  });
});


// Quiz history for current user (single + multiplayer)
export const getQuizHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 100);
  const offset = Number(req.query.offset) || 0;

  // Step 1: Get all session IDs this user participated in
  const myPlayers = await GameSessionPlayer.findAll({
    where: { user_id: req.user.id },
    attributes: ["session_id", "score", "status", "user_id"],
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  const playerSessionIds = myPlayers.map((p) => p.session_id);
  const playerScoreMap = {};
  myPlayers.forEach((p) => {
    playerScoreMap[p.session_id] = p.score ?? 0;
  });

  // Step 2: Also get sessions hosted by the user (may not overlap fully)
  const hostedSessionIds = playerSessionIds.length
    ? []
    : await GameSession.findAll({
        where: { host_user_id: req.user.id },
        attributes: ["id"],
        order: [["created_at", "DESC"]],
        limit,
        offset,
      }).then((rows) => rows.map((s) => s.id));

  const sessionIds = [...new Set([...playerSessionIds, ...hostedSessionIds])];

  if (!sessionIds.length) {
    return res.json({ success: true, items: [] });
  }

  // Step 3: Fetch full GameSession rows directly — this guarantees all fields
  const sessions = await GameSession.findAll({
    where: { id: sessionIds },
    attributes: [
      "id",
      "quiz_id",
      "mode",
      "room_code",
      "settings",
      "status",
      "started_at",
      "ended_at",
      "host_user_id",
    ],
    include: [{ model: Quiz, attributes: ["id", "title", "topic"] }],
  });
  const sessionMap = {};
  sessions.forEach((s) => {
    sessionMap[s.id] = s;
  });

  // Step 4: Fetch all players for these sessions
  const allPlayers = await GameSessionPlayer.findAll({
    where: { session_id: sessionIds },
    include: [{ model: User, attributes: ["id", "name", "avatar_url"] }],
    attributes: ["session_id", "score", "status", "user_id", "is_host"],
  });

  const playersBySession = {};
  const myScoreBySession = {};
  for (const p of allPlayers) {
    if (!playersBySession[p.session_id]) playersBySession[p.session_id] = [];
    const u = p.user || p.User;
    playersBySession[p.session_id].push({
      user_id: p.user_id,
      name: u?.name || "Player",
      avatar_url: u?.avatar_url || null,
      score: p.score ?? 0,
      status: p.status,
    });
    // Track my own score from any session (covers both player + host roles)
    if (String(p.user_id) === String(req.user.id)) {
      myScoreBySession[p.session_id] = p.score ?? 0;
    }
  }

  // Step 5: Build response items
  const items = sessions.map((s) => {
    const settingsTopic = s.settings?.topic || null;
    const quizTitle = s.Quiz?.title || s.Quiz?.topic || null;
    const title = settingsTopic || quizTitle || "Quiz";
    const topic = settingsTopic || s.Quiz?.topic || null;

    return {
      session_id: s.id,
      mode: s.mode || "SINGLE",
      room_code: s.room_code || null,
      status: s.status || null,
      started_at: s.started_at || null,
      ended_at: s.ended_at || null,
      quiz: {
        id: s.Quiz?.id || null,
        title,
        topic,
      },
      my_score: myScoreBySession[s.id] ?? 0,
      players: playersBySession[s.id] || [],
    };
  }).sort(
    (a, b) =>
      new Date(b.started_at || b.ended_at || b.session_id || 0) -
      new Date(a.started_at || a.ended_at || a.session_id || 0)
  );

  res.json({ success: true, items });
});
