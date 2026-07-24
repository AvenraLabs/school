import { Router } from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import {
  generateQuizAI,
  getPendingQuizzes,
  getCompletedQuizzes,
  getQuizById,
  submitQuiz,
  getTeacherQuizzes,
  getTeacherQuizSubmissions,
} from "./teacher-quiz.controller.js";

const router = Router();

router.use(protect);

// Teacher AI Quiz Creation & Histories
router.post("/teacher/generate", allowRoles("teacher", "school_admin"), generateQuizAI);
router.get("/teacher/my-quizzes", allowRoles("teacher", "school_admin"), getTeacherQuizzes);
router.get("/teacher/:quizId/submissions", allowRoles("teacher", "school_admin"), getTeacherQuizSubmissions);

// Student Homework Quizzes
router.get("/student/pending", allowRoles("student"), getPendingQuizzes);
router.get("/student/completed", allowRoles("student"), getCompletedQuizzes);
router.get("/:quizId", getQuizById);
router.post("/:quizId/submit", allowRoles("student"), submitQuiz);

export default router;
