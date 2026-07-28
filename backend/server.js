import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

import db from "./src/config/db.js";
import errorHandler from "./src/shared/errorHandler.js";
import "./src/models/initModels.js";
import uploadRoutes from "./src/modules/upload/upload.routes.js";
import { startLibraryCron } from "./src/modules/library/library.cron.js";
import { startFeeCron } from "./src/modules/fees/fee.cron.js";

// socket
import { createServer } from "http";
import { Server } from "socket.io";
import { initGameSocket } from "./src/socket/game.socket.js";
import { initGroupChatSocket } from "./src/socket/group-chat.socket.js";
import { initNotificationSocket } from "./src/socket/notification.socket.js";
import { initTransportSocket } from "./src/socket/transport.socket.js";


const app = express();
const PORT = process.env.PORT || 3002;


// HTTP + SOCKET SERVER

const httpServer = createServer(app);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost",
      "https://localhost",
      "capacitor://localhost",
      "https://app.avenra.org",
      "https://admin.avenra.org",
    ];

const io = new Server(httpServer, {
  path: "/api/socket.io",
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*")) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.startsWith("http://localhost") ||
        origin.startsWith("https://localhost") ||
        origin.startsWith("capacitor://")
      ) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

initGameSocket(io);
initGroupChatSocket(io);
initNotificationSocket(io);
initTransportSocket(io);

// MIDDLEWARES
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes("*")) return callback(null, true);
    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      origin.startsWith("http://localhost") ||
      origin.startsWith("https://localhost") ||
      origin.startsWith("capacitor://")
    ) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan("dev"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/storage", express.static(path.join(__dirname, "storage")));
app.use("/api/storage", express.static(path.join(__dirname, "storage")));


// HEALTH CHECK
app.get("/", (req, res) => {
  res.json({ message: "server is running ;)" });
});


// ROUTES
import authRoutes from "./src/modules/auth/auth.routes.js";
import schoolRoutes from "./src/modules/schools/school.routes.js";
import lostFoundRoutes from "./src/modules/lost-found/lost-found.routes.js";
import feedbackRoutes from "./src/modules/feedback/feedback.routes.js";
import studentRoutes from "./src/modules/students/student.routes.js";
import teacherRoutes from "./src/modules/teachers/teacher.routes.js";

import sectionRoutes from "./src/modules/sections/section.routes.js";
import subjectRoutes from "./src/modules/subjects/subject.routes.js";
import classRoutes from "./src/modules/classes/classes.routes.js";
import timetableRoutes from "./src/modules/timetables/timetable.routes.js";
import timetableSubstitutionRoutes from "./src/modules/timetables/timetable-substitution.routes.js";
import reportCardRoutes from "./src/modules/report-cards/report-card.routes.js";
import examRoutes from "./src/modules/report-cards/exam.routes.js";
import examMasterRoutes from "./src/modules/report-cards/exam-master.routes.js";
import teacherDashboardRoutes from "./src/modules/teachers/teacher-dashboard.routes.js";

import approvalRoutes from "./src/modules/approvals/approval.routes.js";
import teacherApprovalRoutes from "./src/modules/teachers/teacher.approval.routes.js";
import studentApprovalRoutes from "./src/modules/students/student.approval.routes.js";

import studentDashboardRoutes from "./src/modules/students/student.dashboard.routes.js";
import auditRoutes from "./src/modules/audit/audit.routes.js";


import teacherBulkRoutes from "./src/modules/teachers/teacher.bulk.routes.js";
import studentBulkRoutes from "./src/modules/students/student.bulk.routes.js";
import bulkRoutes from "./src/modules/bulk/bulk.routes.js";

import attendanceSummaryRoutes from "./src/modules/attendance/attendance.summary.routes.js";
import attendanceAnalyticsRoutes from "./src/modules/attendance/attendance.analytics.routes.js";

import ragRoutes from "./src/modules/rag/rag.routes.js";
import teacherAiRoutes from "./src/modules/teacher-ai/teacher-ai.routes.js";
import aiAnalyticsRoutes from "./src/modules/ai-analytics/ai-analytics.routes.js";
import tokenRoutes from "./src/modules/tokens/token.routes.js";
import videoRoutes from "./src/modules/ai-video/video-generation.routes.js";

// teacher planning & tracking
import teacherAssignmentRoutes from "./src/modules/teacher-assignments/teacher-assignment.routes.js";
import homeworkRoutes from "./src/modules/homework/homework.routes.js";
import notificationRoutes from "./src/modules/notifications/notification.routes.js";
import groupChatRoutes from "./src/modules/group-chat/group-chat.routes.js";
import gameRoutes from "./src/modules/game/game.routes.js";
import quizRoutes from "./src/modules/quiz/quiz.routes.js";
import teacherQuizRoutes from "./src/modules/quiz/teacher-quiz.routes.js";
import transportRoutes from "./src/modules/transport/transport.routes.js";
import academicYearRoutes from "./src/modules/academic-years/academic-year.routes.js";
import analyticsRoutes from "./src/modules/analytics/analytics.routes.js";
import feeRoutes from "./src/modules/fees/fee.routes.js";
import expenseRoutes from "./src/modules/expenses/expense.routes.js";
import libraryRoutes from "./src/modules/library/library.routes.js";




// auth
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api", transportRoutes);

// attendance (MOVED UP to prevent teacherRoutes masking)
app.use("/api", attendanceSummaryRoutes);
app.use("/api", attendanceAnalyticsRoutes);
// backward-compatible prefix for attendance routes
app.use("/api/attendance", attendanceSummaryRoutes);
app.use("/api/attendance", attendanceAnalyticsRoutes);

// core
  app.use("/api/schools", schoolRoutes);
  app.use("/api/students", studentDashboardRoutes);
  app.use("/api/students", studentRoutes);
  app.use("/api/teachers", teacherDashboardRoutes);
  app.use("/api/teachers", teacherRoutes);
  app.use("/api/lost-found", lostFoundRoutes);
  app.use("/api/feedback", feedbackRoutes);

app.use("/api/sections", sectionRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/timetables/substitutions", timetableSubstitutionRoutes);
app.use("/api/timetables", timetableRoutes);
app.use("/api/report-cards", reportCardRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/exam-masters", examMasterRoutes);
app.use("/api/academic-years", academicYearRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/library", libraryRoutes);



// approvals
app.use("/api", approvalRoutes);
app.use("/api", teacherApprovalRoutes);
app.use("/api", studentApprovalRoutes);

app.use("/api", auditRoutes);

// bulk

app.use("/api", teacherBulkRoutes);
app.use("/api", studentBulkRoutes);


// mount admin bulk endpoints (for admin panel)
app.use("/api/bulk", bulkRoutes);

// tokens (super admin)
app.use("/api", tokenRoutes);

// AI
app.use("/api/rag", ragRoutes);
app.use("/api/teacher-ai", teacherAiRoutes);
app.use("/api/ai/videos", videoRoutes);
app.use("/api", aiAnalyticsRoutes);
app.use("/api/analytics", analyticsRoutes);

// quiz
app.use("/api/quiz", quizRoutes);
app.use("/api/quizzes", teacherQuizRoutes);

// teacher planning & tracking
app.use("/api/teacher-assignments", teacherAssignmentRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/group-chat", groupChatRoutes);
app.use("/api/game", gameRoutes);


// 404 + ERROR HANDLER
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use(errorHandler);


// START SERVER
try {
  await db.authenticate();
  console.log("DB connected");

  await db.sync({ force: false });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server + Socket running on port ${PORT}`);
    startLibraryCron();
    startFeeCron();
  });

} catch (err) {
  console.error("DB connection failed", err);
  process.exit(1);
}
