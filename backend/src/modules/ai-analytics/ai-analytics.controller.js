import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import asyncHandler from "../../shared/asyncHandler.js";
import {
  getSchoolAnalytics,
  getSchoolUserUsage,
  getSchoolClassUsage,
  getTeacherAnalytics,
  getStudentDailyUsage,
} from "./ai-analytics.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ===================== SCHOOL ===================== */
export const schoolAiAnalytics = asyncHandler(async (req, res) => {
  const schoolId =
    req.user.role === "super_admin" && req.query.school_id
      ? Number(req.query.school_id)
      : req.user.school_id;

  const data = await getSchoolAnalytics(schoolId);
  res.json(data);
});

export const schoolUserUsage = asyncHandler(async (req, res) => {
  const schoolId =
    req.user.role === "super_admin" && req.query.school_id
      ? Number(req.query.school_id)
      : req.user.school_id;
  const role = req.query.role || "student";

  const data = await getSchoolUserUsage(schoolId, role);
  res.json(data);
});

export const schoolClassUsage = asyncHandler(async (req, res) => {
  const schoolId =
    req.user.role === "super_admin" && req.query.school_id
      ? Number(req.query.school_id)
      : req.user.school_id;

  const data = await getSchoolClassUsage(schoolId);
  res.json(data);
});

/* ===================== TEACHER ===================== */
export const teacherAiAnalytics = asyncHandler(async (req, res) => {
  const teacherUserId = req.user.id;

  const data = await getTeacherAnalytics(teacherUserId);
  res.json(data);
});

/* ===================== STUDENT ===================== */
export const studentAiAnalytics = asyncHandler(async (req, res) => {
  const studentUserId = req.user.id;

  const data = await getStudentDailyUsage(studentUserId);
  res.json(data);
});

/* ===================== SUPER ADMIN INTEGRATION LOGS ===================== */
export const getIntegrationLogs = asyncHandler(async (req, res) => {
  const dateStr = req.query.date || new Date().toISOString().split("T")[0];
  const filterIntegration = req.query.integration || null; // gemini | veo | whatsapp | maps
  const filterStatus = req.query.status || null; // success | failure

  const logDir = path.join(__dirname, "../../storage/logs");
  const logFile = path.join(logDir, `integrations-${dateStr}.log`);

  let logs = [];
  if (fs.existsSync(logFile)) {
    const lines = fs.readFileSync(logFile, "utf-8").split("\n").filter(Boolean);
    logs = lines
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    if (filterIntegration) {
      logs = logs.filter((l) => l.integration === filterIntegration);
    }
    if (filterStatus) {
      logs = logs.filter((l) => l.status === filterStatus);
    }
  }

  res.json({
    success: true,
    date: dateStr,
    count: logs.length,
    logs: logs.reverse().slice(0, 200), // Return latest 200 logs
  });
});
