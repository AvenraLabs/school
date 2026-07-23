import { useEffect, useState, useCallback } from "react";
import { connectQuizSocket, disconnectQuizSocket } from "../socket/quiz.socket";
import { useAuth } from "../../../auth/AuthProvider";

export function useQuizSession(sessionId) {
    const { token } = useAuth();
    const [status, setStatus] = useState("WAITING");
    const [player, setPlayer] = useState(null);
    const [isHost, setIsHost] = useState(false);
    const [time, setTime] = useState(null);
    const [players, setPlayers] = useState([]);
    const [error, setError] = useState(null);
    const [cancelled, setCancelled] = useState(false);

    useEffect(() => {
        if (!sessionId || !token) return;

        const socket = connectQuizSocket(token);

        socket.emit("quiz:join", { sessionId });

        // ── Joined confirmation ───────────────────────────────────────────────
        socket.on("quiz:joined", (data) => {
            setPlayer(data);
            setError(null);
            if (data.isHost) setIsHost(true);
        });

        // ── Full player list snapshot on join ─────────────────────────────────
        socket.on("quiz:players_list", (data) => {
            setPlayers(data.players || []);
        });

        // ── New player joined ─────────────────────────────────────────────────
        socket.on("quiz:player_joined", (data) => {
            setPlayers((prev) => {
                if (prev.some((p) => p.userId === data.userId)) return prev;
                return [...prev, data];
            });
        });

        // ── Player left (disconnected) ────────────────────────────────────────
        socket.on("quiz:player_left", (data) => {
            setPlayers((prev) => prev.filter((p) => p.userId !== data.userId));
        });

        // ── Quiz started ──────────────────────────────────────────────────────
        socket.on("quiz:generating", () => {
            setStatus("GENERATING");
        });

        socket.on("quiz:started", (data) => {
            setStatus("IN_PROGRESS");
            setTime(data.totalTimeMs);
        });

        // ── Quiz finished (normal end, force-end, all-answered) ───────────────
        socket.on("quiz:finished", () => {
            setStatus("FINISHED");
        });

        socket.on("quiz:all_finished", () => {
            setStatus("FINISHED");
        });

        socket.on("quiz:time_up", () => {
            setStatus("FINISHED");
        });

        // ── Session cancelled (host left lobby) ───────────────────────────────
        socket.on("quiz:cancelled", (data) => {
            setCancelled(true);
            setStatus("CANCELLED");
            setError(data?.message || "The host has left. Room closed.");
        });

        // ── Errors ────────────────────────────────────────────────────────────
        socket.on("quiz:error", (data) => {
            setError(data.message || "An error occurred");
            setStatus((prev) => (prev === "GENERATING" ? "WAITING" : prev));
        });

        return () => {
            socket.off("quiz:joined");
            socket.off("quiz:players_list");
            socket.off("quiz:player_joined");
            socket.off("quiz:player_left");
            socket.off("quiz:generating");
            socket.off("quiz:started");
            socket.off("quiz:finished");
            socket.off("quiz:all_finished");
            socket.off("quiz:time_up");
            socket.off("quiz:cancelled");
            socket.off("quiz:error");
            disconnectQuizSocket();
        };
    }, [sessionId, token]);

    const startQuiz = useCallback(() => {
        const socket = connectQuizSocket(token);
        socket.emit("quiz:start", { sessionId });
    }, [token, sessionId]);

    const forceEnd = useCallback(() => {
        const socket = connectQuizSocket(token);
        socket.emit("quiz:force_end", { sessionId });
    }, [token, sessionId]);

    const finishQuiz = useCallback(() => {
        const socket = connectQuizSocket(token);
        socket.emit("quiz:finished", { sessionId });
    }, [token, sessionId]);

    return {
        status,
        player,
        time,
        isHost,
        players,
        error,
        cancelled,
        startQuiz,
        forceEnd,
        finishQuiz,
    };
}
