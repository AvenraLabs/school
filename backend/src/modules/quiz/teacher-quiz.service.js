import TeacherQuiz from "./teacher-quiz.model.js";
import TeacherQuizQuestion from "./teacher-quiz-question.model.js";
import StudentQuizSubmission from "./student-quiz-submission.model.js";
import User from "../users/user.model.js";
import Student from "../students/student.model.js";
import Class from "../classes/classes.model.js";
import School from "../schools/school.model.js";
import AppError from "../../shared/appError.js";
import { getTeacherChapter } from "../rag/runtime/getTeacherChapter.js";
import { buildTeacherQuizPrompt } from "../rag/runtime/buildPrompt.js";
import { generateAnswer } from "../rag/runtime/generateAnswer.js";

/**
 * Generates AI Quiz questions from full chapter context.
 */
export async function generateTeacherQuizAI({ user, board, classId, subject, chapter, title, numQuestions = 5, difficulty = "MEDIUM" }) {
  if (user.role !== "teacher" && user.role !== "school_admin") {
    throw new AppError("Only teachers or admins can generate quizzes", 403);
  }

  const targetClass = await Class.findByPk(classId);
  if (!targetClass) throw new AppError("Class not found", 404);

  const gradeMatch = targetClass.class_name.match(/\d+/);
  const grade = gradeMatch ? gradeMatch[0] : "6";

  const school = await School.findByPk(user.school_id);
  const finalBoard = board || school?.board || "CBSE";

  // Fetch full chapter context directly from ChromaDB
  const { fullChapterText } = await getTeacherChapter({
    board: finalBoard,
    grade,
    subject,
    chapter,
  });

  if (!fullChapterText) {
    throw new AppError(`Textbook context for chapter ${chapter} not found in ChromaDB`, 404);
  }

  const prompt = buildTeacherQuizPrompt({
    chapterContext: fullChapterText,
    title: title || `${subject} Chapter ${chapter} Quiz`,
    numQuestions,
    difficulty,
  });

  const res = await generateAnswer(prompt);
  const cleaned = res.text.replace(/```json/g, "").replace(/```/g, "").trim();

  let parsed = null;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new AppError("AI generated invalid quiz JSON format", 500);
  }

  // Create Quiz in Database
  const quiz = await TeacherQuiz.create({
    school_id: user.school_id,
    teacher_id: user.id,
    class_id: classId,
    subject,
    chapter: String(chapter),
    title: parsed.title || title || `${subject} Quiz`,
    instructions: parsed.instructions || "Complete the quiz assignment.",
    difficulty,
    total_marks: (parsed.questions || []).length,
    status: "published",
  });

  const questionsToCreate = (parsed.questions || []).map((q, idx) => ({
    quiz_id: quiz.id,
    order_index: idx + 1,
    question_text: q.question_text,
    options: q.options || [],
    correct_answer: q.correct_answer,
    explanation: q.explanation || "",
    marks: q.marks || 1,
  }));

  await TeacherQuizQuestion.bulkCreate(questionsToCreate);

  return await TeacherQuiz.findByPk(quiz.id, {
    include: [{ model: TeacherQuizQuestion, as: "Questions" }],
  });
}

/**
 * Gets assigned pending quizzes for a student.
 */
export async function getPendingStudentQuizzes(userId, schoolId) {
  const student = await Student.findOne({ where: { user_id: userId } });
  if (!student) throw new AppError("Student profile not found", 404);

  // Find completed quiz IDs for this student
  const completedSubmissions = await StudentQuizSubmission.findAll({
    where: { student_id: userId },
    attributes: ["quiz_id"],
  });
  const completedQuizIds = completedSubmissions.map((s) => s.quiz_id);

  // Find published quizzes for student's class
  const where = {
    school_id: schoolId,
    class_id: student.class_id,
    status: "published",
  };

  const quizzes = await TeacherQuiz.findAll({
    where,
    order: [["created_at", "DESC"]],
  });

  return quizzes.filter((q) => !completedQuizIds.includes(q.id));
}

/**
 * Gets completed quizzes with scores for a student.
 */
export async function getCompletedStudentQuizzes(userId) {
  return await StudentQuizSubmission.findAll({
    where: { student_id: userId },
    include: [
      {
        model: TeacherQuiz,
        attributes: ["id", "title", "subject", "chapter", "total_marks", "show_correct_answers", "show_explanations"],
      },
    ],
    order: [["submitted_at", "DESC"]],
  });
}

/**
 * Get single quiz details with questions for student attempt.
 */
export async function getQuizDetails(quizId) {
  const quiz = await TeacherQuiz.findByPk(quizId, {
    include: [
      {
        model: TeacherQuizQuestion,
        as: "Questions",
        attributes: ["id", "order_index", "question_text", "options", "marks"],
      },
    ],
  });

  if (!quiz) throw new AppError("Quiz not found", 404);
  return quiz;
}

/**
 * Submits student answers for a quiz homework and auto-grades it.
 */
export async function submitStudentQuiz({ userId, quizId, answers }) {
  const quiz = await TeacherQuiz.findByPk(quizId, {
    include: [{ model: TeacherQuizQuestion, as: "Questions" }],
  });

  if (!quiz) throw new AppError("Quiz not found", 404);

  const existing = await StudentQuizSubmission.findOne({
    where: { quiz_id: quizId, student_id: userId },
  });
  if (existing) {
    throw new AppError("Quiz assignment has already been submitted", 400);
  }

  let totalScore = 0;
  let totalMarks = 0;
  const detailedBreakdown = [];

  for (const q of quiz.Questions) {
    totalMarks += Number(q.marks || 1);
    const studentAns = (answers[q.id] || answers[q.order_index] || "").trim();
    const isCorrect = studentAns.toLowerCase() === q.correct_answer.trim().toLowerCase();

    if (isCorrect) {
      totalScore += Number(q.marks || 1);
    }

    detailedBreakdown.push({
      questionId: q.id,
      questionText: q.question_text,
      studentAnswer: studentAns,
      correctAnswer: quiz.show_correct_answers ? q.correct_answer : null,
      isCorrect,
      explanation: quiz.show_explanations ? q.explanation : null,
    });
  }

  const submission = await StudentQuizSubmission.create({
    quiz_id: quizId,
    student_id: userId,
    answers,
    score: totalScore,
    total_marks: totalMarks,
    status: "submitted",
  });

  return {
    submissionId: submission.id,
    score: totalScore,
    totalMarks,
    percentage: ((totalScore / (totalMarks || 1)) * 100).toFixed(1),
    breakdown: detailedBreakdown,
  };
}
