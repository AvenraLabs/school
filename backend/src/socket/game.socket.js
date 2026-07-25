import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import GameSession from "../modules/game/game-session.model.js";
import GameSessionPlayer from "../modules/game/game-session-player.model.js";
import { isTimeOver } from "../modules/game/game.utils.js";
import PlayerAnswer from "../modules/game/player-answer.model.js";
import QuizQuestion from "../modules/quiz/quiz-question.model.js";
import { generateQuizFromAi } from "../modules/quiz/quiz-rag.service.js";
import User from "../modules/users/user.model.js";
import db from "../config/db.js";

const sessionState = new Map();
const lobbyDisconnectTimers = new Map();

function sanitizeQuestion(question) {
  return {
    id: question.id,
    question_text: question.question_text,
    options: question.options,
  };
}

export function initGameSocket(io) {

  // ─── JWT Auth Middleware ──────────────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = {
        id: decoded.id,
        role: decoded.role,
        school_id: decoded.school_id,
      };
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  // ─── End Session (used by timer, all-finished, force-end, auto-end) ───────
  const endSession = async (sessionId, reason = "finished") => {
    // Clear in-memory timer
    const state = sessionState.get(sessionId);
    if (state?.timerId) clearTimeout(state.timerId);
    sessionState.delete(sessionId);

    // Mark finished in DB
    const session = await GameSession.findByPk(sessionId);
    if (session && session.status !== "FINISHED" && session.status !== "CANCELLED") {
      await session.update({ status: "FINISHED", ended_at: new Date() });
    }

    // Notify all clients
    io.to(`quiz:${sessionId}`).emit("quiz:finished", { reason });
    io.to(`quiz:${sessionId}`).emit("quiz:all_finished", { reason });
  };

  // ─── Cancel Session (host left lobby before starting) ────────────────────
  const cancelSession = async (sessionId) => {
    const state = sessionState.get(sessionId);
    if (state?.timerId) clearTimeout(state.timerId);
    sessionState.delete(sessionId);

    const session = await GameSession.findByPk(sessionId);
    if (session && session.status === "LOBBY") {
      await session.update({ status: "CANCELLED", ended_at: new Date() });
    }

    io.to(`quiz:${sessionId}`).emit("quiz:cancelled", {
      message: "The host has left. Room closed.",
    });
  };

  // ─── Emit next question ───────────────────────────────────────────────────
  const emitQuestion = (sessionId) => {
    const state = sessionState.get(sessionId);
    if (!state) return;

    const { questions, currentIndex, perQuestionMs } = state;
    if (currentIndex >= questions.length) {
      endSession(sessionId, "all_questions_done");
      return;
    }

    state.questionSentAt = Date.now();
    sessionState.set(sessionId, state);

    io.to(`quiz:${sessionId}`).emit("quiz:question", {
      question: sanitizeQuestion(questions[currentIndex]),
      questionIndex: currentIndex,
      totalQuestions: questions.length,
      timeLimit: perQuestionMs,
    });

    state.timerId = setTimeout(() => {
      const nextState = sessionState.get(sessionId);
      if (!nextState) return;
      nextState.currentIndex += 1;
      sessionState.set(sessionId, nextState);
      emitQuestion(sessionId);
    }, perQuestionMs);
  };

  const startQuestionFlow = (sessionId, questions, perQuestionMs) => {
    sessionState.set(sessionId, {
      questions,
      perQuestionMs,
      currentIndex: 0,
      questionSentAt: Date.now(),
      timerId: null,
    });
    emitQuestion(sessionId);
  };

  // ─── Check if all active players are gone (all disconnected/finished) ─────
  const checkAndAutoEnd = async (sessionId) => {
    try {
      const session = await GameSession.findByPk(sessionId);
      if (!session || session.status === "FINISHED" || session.status === "CANCELLED") return;

      const activePlayers = await GameSessionPlayer.count({
        where: {
          session_id: sessionId,
          status: { [Op.notIn]: ["DISCONNECTED", "FINISHED"] },
        },
      });

      if (activePlayers === 0) {
        // Everyone left / finished — end the session
        if (session.status === "LOBBY") {
          await cancelSession(sessionId);
        } else {
          await endSession(sessionId, "all_players_left");
        }
      }
    } catch (err) {
      console.error("[quiz] checkAndAutoEnd error:", err.message);
    }
  };

  io.on("connection", (socket) => {

    // ─── JOIN QUIZ ROOM ─────────────────────────────────────────────────────
    socket.on("quiz:join", async ({ sessionId }) => {
      const session = await GameSession.findByPk(sessionId);

      if (!session) {
        socket.emit("quiz:error", { message: "Session not found." });
        return;
      }

      if (session.status === "CANCELLED") {
        socket.emit("quiz:error", { message: "This room has been cancelled." });
        return;
      }

      if (session.status === "FINISHED") {
        socket.emit("quiz:error", { message: "This quiz has already ended." });
        return;
      }

      const isHostUser = String(session.host_user_id) === String(socket.user.id);

      let player = await GameSessionPlayer.findOne({
        where: { session_id: sessionId, user_id: socket.user.id },
      });

      if (!player) {
        try {
          player = await GameSessionPlayer.create({
            session_id: sessionId,
            user_id: socket.user.id,
            is_host: isHostUser,
            status: "JOINED",
          });
        } catch (createErr) {
          // Race condition: another socket beat us — re-fetch the existing record
          if (createErr.name === "SequelizeUniqueConstraintError") {
            player = await GameSessionPlayer.findOne({
              where: { session_id: sessionId, user_id: socket.user.id },
            });
            if (!player) {
              socket.emit("quiz:error", { message: "Could not join session. Please try again." });
              return;
            }
          } else {
            throw createErr;
          }
        }
      }

      // Ensure is_host boolean is synced accurately
      if (player && Boolean(player.is_host) !== isHostUser) {
        await player.update({ is_host: isHostUser });
      }

      // Prevent multi-join from different tab/device
      if (
        player.socket_id &&
        player.socket_id !== socket.id &&
        player.status !== "DISCONNECTED"
      ) {
        socket.emit("quiz:error", {
          message: "Already joined from another device or tab.",
        });
        return;
      }

      // If a lobby disconnect grace period timer exists for this session, clear it on reconnect
      if (lobbyDisconnectTimers.has(sessionId)) {
        clearTimeout(lobbyDisconnectTimers.get(sessionId));
        lobbyDisconnectTimers.delete(sessionId);
      }

      await player.update({
        socket_id: socket.id,
        status: "JOINED",
      });

      socket.join(`quiz:${sessionId}`);

      // Send joined confirmation with room details
      socket.emit("quiz:joined", {
        sessionId,
        roomCode: session.room_code,
        topic: session.settings?.topic || null,
        playerId: player.id,
        status: player.status,
        isHost: Boolean(player.is_host || isHostUser),
      });

      // Fetch current full player list (snapshot for this joiner)
      const allActivePlayers = await GameSessionPlayer.findAll({
        where: {
          session_id: sessionId,
          status: { [Op.ne]: "DISCONNECTED" },
        },
        include: [{ model: User, attributes: ["id", "name", "avatar_url"] }],
        attributes: ["id", "is_host", "user_id"],
      });

      socket.emit("quiz:players_list", {
        players: allActivePlayers.map((p) => ({
          userId: p.user_id,
          name: p.User?.name || "Player",
          avatar_url: p.User?.avatar_url || null,
          isHost: Boolean(p.is_host),
        })),
      });

      // Broadcast new joiner to everyone else in room
      const joiningUser = await User.findByPk(socket.user.id, {
        attributes: ["id", "name", "avatar_url"],
      });
      socket.to(`quiz:${sessionId}`).emit("quiz:player_joined", {
        userId: socket.user.id,
        name: joiningUser?.name || "Player",
        avatar_url: joiningUser?.avatar_url || null,
        isHost: Boolean(player.is_host || isHostUser),
      });

      // If session already in progress, send current question to late-joiner
      const state = sessionState.get(sessionId);
      if (session.status === "IN_PROGRESS" && state?.questions?.length) {
        const timeLeft = Math.max(
          0,
          state.perQuestionMs - (Date.now() - state.questionSentAt)
        );
        socket.emit("quiz:question", {
          question: sanitizeQuestion(state.questions[state.currentIndex]),
          questionIndex: state.currentIndex,
          totalQuestions: state.questions.length,
          timeLimit: timeLeft,
        });
      }
    });

    // ─── HOST STARTS QUIZ ───────────────────────────────────────────────────
    socket.on("quiz:start", async ({ sessionId }) => {
      const session = await GameSession.findByPk(sessionId);
      if (!session) return;
      if (session.host_user_id !== socket.user.id) return;
      if (session.started_at) return; // prevent restart

      let quizId = session.quiz_id;
      if (!quizId) {
        if (!session.settings || !session.settings.topic) {
          socket.emit("quiz:error", {
            message: "Missing topic or settings for this game session.",
          });
          return;
        }

        try {
          // Notify the room that AI is generating the quiz
          io.to(`quiz:${sessionId}`).emit("quiz:generating");

          const quizResult = await generateQuizFromAi({
            user: socket.user,
            topic: session.settings.topic,
            classLevel: session.settings.classLevel,
            difficulty: session.settings.difficulty,
            numQuestions: session.settings.numQuestions,
          });

          quizId = quizResult.quizId;

          const perQuestionMs = 30000;
          const totalQuestions = quizResult.questions?.length || session.settings.numQuestions || 5;
          const totalTimeMs = session.settings.timeLimitMinutes
            ? session.settings.timeLimitMinutes * 60 * 1000
            : totalQuestions * perQuestionMs;

          await session.update({
            quiz_id: quizId,
            total_time_ms: totalTimeMs,
          });
        } catch (err) {
          console.error("AI quiz generation failed on game start:", err);
          io.to(`quiz:${sessionId}`).emit("quiz:error", {
            message: "AI failed to generate quiz questions. Please try starting again.",
          });
          return;
        }
      }

      await session.update({ status: "IN_PROGRESS", started_at: new Date() });

      await GameSessionPlayer.update(
        { status: "PLAYING" },
        {
          where: {
            session_id: sessionId,
            status: { [Op.ne]: "FINISHED" },
          },
        }
      );

      io.to(`quiz:${sessionId}`).emit("quiz:started", {
        startedAt: session.started_at,
        totalTimeMs: session.total_time_ms,
      });

      const questions = await QuizQuestion.findAll({
        where: { quiz_id: quizId },
        order: [["order_index", "ASC"]],
      });

      if (!questions.length) {
        io.to(`quiz:${sessionId}`).emit("quiz:error", {
          message: "No questions found for this quiz.",
        });
        return;
      }

      const perQuestionMs = Math.max(
        5000,
        Math.floor((session.total_time_ms || 0) / questions.length) || 30000
      );

      startQuestionFlow(sessionId, questions, perQuestionMs);
    });

    // ─── HOST FORCE-ENDS QUIZ ───────────────────────────────────────────────
    socket.on("quiz:force_end", async ({ sessionId }) => {
      const session = await GameSession.findByPk(sessionId);
      if (!session) return;

      // Only the host can force-end
      if (session.host_user_id !== socket.user.id) {
        socket.emit("quiz:error", { message: "Only the host can end the quiz." });
        return;
      }

      await endSession(sessionId, "host_ended");
    });

    // ─── PLAYER FINISHES QUIZ ───────────────────────────────────────────────
    socket.on("quiz:finished", async ({ sessionId }) => {
      const player = await GameSessionPlayer.findOne({
        where: { session_id: sessionId, user_id: socket.user.id },
      });

      if (!player || player.status === "FINISHED") return;

      const session = await GameSession.findByPk(sessionId);
      if (!session) return;

      if (isTimeOver(session)) {
        if (session.status !== "FINISHED") {
          await session.update({ status: "FINISHED" });
          io.to(`quiz:${sessionId}`).emit("quiz:time_up");
        }
        await endSession(sessionId, "time_up");
        return;
      }

      await player.update({ status: "FINISHED", finished_at: new Date() });

      // Count non-finished, non-disconnected players still active
      const remaining = await GameSessionPlayer.count({
        where: {
          session_id: sessionId,
          status: { [Op.notIn]: ["FINISHED", "DISCONNECTED"] },
        },
      });

      if (remaining === 0) {
        await endSession(sessionId, "all_finished");
      } else {
        io.to(`quiz:${sessionId}`).emit("quiz:waiting");
      }
    });

    // ─── PLAYER SUBMITS ANSWER ──────────────────────────────────────────────
    socket.on("quiz:answer", async ({ sessionId, questionId, selectedIndex }) => {
      const player = await GameSessionPlayer.findOne({
        where: { session_id: sessionId, user_id: socket.user.id },
      });

      if (!player || player.status === "FINISHED") return;

      const session = await GameSession.findByPk(sessionId);
      if (!session) return;

      if (!session.started_at) {
        socket.emit("quiz:error", { message: "Quiz has not started yet." });
        return;
      }

      if (isTimeOver(session)) {
        if (session.status !== "FINISHED") {
          await session.update({ status: "FINISHED" });
          io.to(`quiz:${sessionId}`).emit("quiz:time_up");
        }
        await endSession(sessionId, "time_up");
        return;
      }

      // Prevent double-answer for same question
      const existingAnswer = await PlayerAnswer.findOne({
        where: { session_player_id: player.id, question_id: questionId },
      });
      if (existingAnswer) {
        socket.emit("quiz:error", { message: "Already answered this question." });
        return;
      }

      const question = await QuizQuestion.findByPk(questionId);
      if (!question) return;

      const isCorrect = Number(question.correct_option_index) === Number(selectedIndex);

      await db.transaction(async (t) => {
        await PlayerAnswer.create(
          {
            session_player_id: player.id,
            question_id: questionId,
            selected_option_index: selectedIndex,
            is_correct: isCorrect,
          },
          { transaction: t }
        );
        if (isCorrect) {
          await player.increment("score", { by: 1, transaction: t });
        }
      });

      socket.emit("quiz:answer_ack", { questionId, isCorrect });

      // Early advance: if all active players answered this question, skip timer
      try {
        const state = sessionState.get(sessionId);
        if (state && state.questions?.[state.currentIndex]?.id == questionId) {
          const activePlayers = await GameSessionPlayer.findAll({
            where: {
              session_id: sessionId,
              status: { [Op.notIn]: ["FINISHED", "DISCONNECTED"] },
            },
            attributes: ["id"],
          });
          const activeIds = activePlayers.map((p) => p.id);

          if (activeIds.length > 0) {
            const answeredCount = await PlayerAnswer.count({
              where: {
                question_id: questionId,
                session_player_id: { [Op.in]: activeIds },
              },
            });

            if (answeredCount >= activeIds.length) {
              if (state.timerId) clearTimeout(state.timerId);
              state.currentIndex += 1;
              sessionState.set(sessionId, state);
              emitQuestion(sessionId);
            }
          }
        }
      } catch {
        // ignore early-advance errors — timer will handle it
      }
    });

    // ─── HANDLE DISCONNECT ──────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      try {
        // Find all player records for this socket
        const players = await GameSessionPlayer.findAll({
          where: { socket_id: socket.id },
          attributes: ["id", "session_id", "user_id", "is_host"],
        });

        for (const player of players) {
          await player.update({ status: "DISCONNECTED" });

          const session = await GameSession.findByPk(player.session_id);
          if (!session || session.status === "FINISHED" || session.status === "CANCELLED") continue;

          // Notify room that this player left
          io.to(`quiz:${player.session_id}`).emit("quiz:player_left", {
            userId: player.user_id,
          });

          // If host disconnects while in LOBBY, start a 10s grace period timer to allow page refreshes
          if (player.is_host && session.status === "LOBBY") {
            const sid = player.session_id;
            if (!lobbyDisconnectTimers.has(sid)) {
              const timer = setTimeout(async () => {
                lobbyDisconnectTimers.delete(sid);
                const currentSession = await GameSession.findByPk(sid);
                if (currentSession && currentSession.status === "LOBBY") {
                  await cancelSession(sid);
                }
              }, 10000);
              lobbyDisconnectTimers.set(sid, timer);
            }
            continue;
          }

          // If host disconnects while game IN_PROGRESS, end the session for everyone
          if (player.is_host && session.status === "IN_PROGRESS") {
            await endSession(player.session_id, "host_disconnected");
            continue;
          }

          // Check if all remaining players are gone → auto-end
          await checkAndAutoEnd(player.session_id);
        }
      } catch (err) {
        console.error("[quiz] disconnect handler error:", err.message);
      }
    });

  });
}
