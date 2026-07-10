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
      "https://app.avenra.org",
      "https://admin.avenra.org",
    ];

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes("*")) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
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
    if (allowedOrigins.indexOf(origin) !== -1) {
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

// teacher planning & tracking
import teacherAssignmentRoutes from "./src/modules/teacher-assignments/teacher-assignment.routes.js";
import homeworkRoutes from "./src/modules/homework/homework.routes.js";
import notificationRoutes from "./src/modules/notifications/notification.routes.js";
import groupChatRoutes from "./src/modules/group-chat/group-chat.routes.js";
import gameRoutes from "./src/modules/game/game.routes.js";
import quizRoutes from "./src/modules/quiz/quiz.routes.js";
import transportRoutes from "./src/modules/transport/transport.routes.js";
import academicYearRoutes from "./src/modules/academic-years/academic-year.routes.js";



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
app.use("/api/timetables", timetableRoutes);
app.use("/api/report-cards", reportCardRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/exam-masters", examMasterRoutes);
app.use("/api/academic-years", academicYearRoutes);

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
app.use("/api", teacherAiRoutes);
app.use("/api", aiAnalyticsRoutes);

// quiz
app.use("/api/quiz", quizRoutes);

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


async function runDbMigrations() {
  console.log("Running DB migrations...");
  try {
    // Clean up duplicate attendance data (keep only latest per student/date)
    await db.query(`
      DELETE FROM attendances a USING attendances b
      WHERE a.id < b.id AND a.student_id = b.student_id AND a.date = b.date;
    `);
  } catch (err) {
    console.log("Note: Duplicate data cleanup skipped or failed:", err.message);
  }

  try {
    // Drop legacy constraints and indexes
    await db.query(`
      ALTER TABLE attendances DROP CONSTRAINT IF EXISTS attendances_student_id_teacher_class_session_id_key;
    `);
    await db.query(`
      DROP INDEX IF EXISTS attendances_student_id_teacher_class_session_id;
    `);
  } catch (err) {
    console.log("Note: Dropping legacy unique constraints skipped or failed:", err.message);
  }

  try {
    // Alter columns to make class session optional and add audit columns
    await db.query(`
      ALTER TABLE attendances ALTER COLUMN teacher_class_session_id DROP NOT NULL;
    `);
    await db.query(`
      ALTER TABLE attendances ADD COLUMN IF NOT EXISTS created_by BIGINT REFERENCES users(id) ON DELETE SET NULL;
    `);
    await db.query(`
      ALTER TABLE attendances ADD COLUMN IF NOT EXISTS updated_by BIGINT REFERENCES users(id) ON DELETE SET NULL;
    `);
    await db.query(`
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);
    await db.query(`
      CREATE TABLE IF NOT EXISTS profile_update_requests (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
        user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50) NOT NULL,
        pending_data JSON NOT NULL,
        status VARCHAR(50) DEFAULT 'PENDING',
        rejection_reason TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.log("Note: Altering columns skipped or failed:", err.message);
  }

  /* ==========================================================================
     TEMPORARY DEVELOPMENT MIGRATION (ACADEMIC YEAR & STATUS MANAGEMENT)
     Note: This is for local development phase and should be removed/replaced
     with standard migrations prior to production deployment.
     ========================================================================== */
  try {
    console.log("Running temporary Academic Year migrations...");
    // 1. Add status column to students and teachers
    await db.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';`);
    await db.query(`ALTER TABLE teachers ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE';`);

    // 2. Add academic_year_id column to yearly tables
    await db.query(`ALTER TABLE attendances ADD COLUMN IF NOT EXISTS academic_year_id BIGINT;`);
    await db.query(`ALTER TABLE timetables ADD COLUMN IF NOT EXISTS academic_year_id BIGINT;`);
    await db.query(`ALTER TABLE exams ADD COLUMN IF NOT EXISTS academic_year_id BIGINT;`);
    await db.query(`ALTER TABLE report_cards ADD COLUMN IF NOT EXISTS academic_year_id BIGINT;`);
    await db.query(`ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS academic_year_id BIGINT;`);

    // 3. Create academic_years table if not exists (so we can insert initial values)
    await db.query(`
      CREATE TABLE IF NOT EXISTS academic_years (
        id BIGSERIAL PRIMARY KEY,
        school_id BIGINT NOT NULL,
        name VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_current BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (school_id, name)
      );
    `);

    // 4. Create student_enrollments table if not exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS student_enrollments (
        id BIGSERIAL PRIMARY KEY,
        student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        academic_year_id BIGINT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
        class_id BIGINT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        section_id BIGINT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
        roll_no INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (student_id, academic_year_id)
      );
    `);

    // 5. Get all schools and initialize default academic year and enrollments
    const [schools] = await db.query(`SELECT id FROM schools;`);
    for (const school of schools) {
      const schoolId = school.id;
      // Find or create default academic year "2026-2027"
      const [existingYears] = await db.query(
        `SELECT id FROM academic_years WHERE school_id = :schoolId AND is_current = true LIMIT 1;`,
        { replacements: { schoolId } }
      );

      let yearId;
      if (existingYears.length > 0) {
        yearId = existingYears[0].id;
      } else {
        const [result] = await db.query(
          `INSERT INTO academic_years (school_id, name, start_date, end_date, is_current)
           VALUES (:schoolId, '2026-2027', '2026-06-01', '2027-05-31', true)
           RETURNING id;`,
          { replacements: { schoolId } }
        );
        yearId = result[0].id;
      }

      // Update yearly tables to link to this yearId if null
      await db.query(`UPDATE attendances SET academic_year_id = :yearId WHERE school_id = :schoolId AND academic_year_id IS NULL;`, { replacements: { yearId, schoolId } });
      await db.query(`UPDATE timetables SET academic_year_id = :yearId WHERE school_id = :schoolId AND academic_year_id IS NULL;`, { replacements: { yearId, schoolId } });
      await db.query(`UPDATE exams SET academic_year_id = :yearId WHERE school_id = :schoolId AND academic_year_id IS NULL;`, { replacements: { yearId, schoolId } });
      await db.query(`UPDATE report_cards SET academic_year_id = :yearId WHERE school_id = :schoolId AND academic_year_id IS NULL;`, { replacements: { yearId, schoolId } });
      await db.query(`UPDATE homeworks SET academic_year_id = :yearId WHERE school_id = :schoolId AND academic_year_id IS NULL;`, { replacements: { yearId, schoolId } });

      // Create student enrollments from student placements
      const [students] = await db.query(
        `SELECT id, class_id, section_id, roll_no FROM students WHERE school_id = :schoolId AND approval_status = 'approved';`,
        { replacements: { schoolId } }
      );
      for (const student of students) {
        if (student.class_id && student.section_id) {
          // Check if enrollment exists
          const [enrollments] = await db.query(
            `SELECT id FROM student_enrollments WHERE student_id = :studentId AND academic_year_id = :yearId LIMIT 1;`,
            { replacements: { studentId: student.id, yearId } }
          );
          if (enrollments.length === 0) {
            await db.query(
              `INSERT INTO student_enrollments (student_id, academic_year_id, class_id, section_id, roll_no)
               VALUES (:studentId, :yearId, :classId, :sectionId, :rollNo)
               ON CONFLICT (student_id, academic_year_id) DO NOTHING;`,
              {
                replacements: {
                  studentId: student.id,
                  yearId,
                  classId: student.class_id,
                  sectionId: student.section_id,
                  rollNo: student.roll_no,
                },
              }
            );
          }
        }
      }
    }
    console.log("Academic Year development migrations completed successfully.");
  } catch (err) {
    console.log("Note: Temporary Academic Year migrations failed or skipped:", err.message);
  }
  console.log("DB migrations completed.");
}

// START SERVER
try {
  await db.authenticate();
  console.log("DB connected");

  await runDbMigrations();

  await db.sync({ force: false });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server + Socket running on port ${PORT}`);
  });
} catch (err) {
  console.error("DB connection failed", err);
  process.exit(1);
}
