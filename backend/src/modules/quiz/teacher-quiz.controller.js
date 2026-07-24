import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import {
  generateTeacherQuizAI,
  getPendingStudentQuizzes,
  getCompletedStudentQuizzes,
  getQuizDetails,
  submitStudentQuiz,
  getTeacherQuizzesService,
  getTeacherQuizSubmissionsService,
} from "./teacher-quiz.service.js";

// Generate AI Quiz (Teacher)
export const generateQuizAI = asyncHandler(async (req, res) => {
  const { board, classId, subject, chapter, title, numQuestions, difficulty } = req.body;

  if (!classId || !subject || !chapter) {
    throw new AppError("classId, subject, and chapter are required", 400);
  }

  const quiz = await generateTeacherQuizAI({
    user: req.user,
    board,
    classId,
    subject,
    chapter,
    title,
    numQuestions,
    difficulty,
  });

  res.json({ message: "Quiz homework generated successfully", quiz });
});

// Student Pending Quizzes
export const getPendingQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await getPendingStudentQuizzes(req.user.id, req.user.school_id);
  res.json({ quizzes });
});

// Student Completed Quizzes
export const getCompletedQuizzes = asyncHandler(async (req, res) => {
  const submissions = await getCompletedStudentQuizzes(req.user.id);
  res.json({ submissions });
});

// View Quiz Details
export const getQuizById = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const quiz = await getQuizDetails(quizId);
  res.json({ quiz });
});

// Submit Student Quiz
export const submitQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;

  if (!answers || typeof answers !== "object") {
    throw new AppError("Answers object is required", 400);
  }

  const result = await submitStudentQuiz({
    userId: req.user.id,
    quizId,
    answers,
  });

  res.json(result);
});

// Teacher Quiz History List
export const getTeacherQuizzes = asyncHandler(async (req, res) => {
  const quizzes = await getTeacherQuizzesService(req.user.id, req.user.school_id);
  res.json({ quizzes });
});

// Teacher Quiz Submissions Detail (Who finished & who pending)
export const getTeacherQuizSubmissions = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const data = await getTeacherQuizSubmissionsService(quizId, req.user.id);
  res.json(data);
});
