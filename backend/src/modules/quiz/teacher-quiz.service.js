import { Op } from "sequelize";
import TeacherQuiz from "./teacher-quiz.model.js";
import TeacherQuizQuestion from "./teacher-quiz-question.model.js";
import StudentQuizSubmission from "./student-quiz-submission.model.js";
import User from "../users/user.model.js";
import Student from "../students/student.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
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

  // Find published quizzes for student's class & section
  const where = {
    school_id: schoolId,
    class_id: student.class_id,
    status: "published",
  };

  if (student.section_id) {
    where[Op.or] = [
      { section_id: student.section_id },
      { section_id: null },
    ];
  }

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

/**
 * Gets all quizzes created by a teacher with submission statistics.
 */
export async function getTeacherQuizzesService(teacherUserId, schoolId) {
  const quizzes = await TeacherQuiz.findAll({
    where: {
      school_id: schoolId,
      teacher_id: teacherUserId,
    },
    include: [
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
    ],
    order: [["created_at", "DESC"]],
  });

  const quizIds = quizzes.map((q) => q.id);
  const submissions = await StudentQuizSubmission.findAll({
    where: { quiz_id: quizIds },
    attributes: ["quiz_id", "score", "total_marks"],
  });

  return quizzes.map((q) => {
    const qSubs = submissions.filter((s) => String(s.quiz_id) === String(q.id));
    const clsName = q.Class?.class_name ? String(q.Class.class_name).replace(/^Class\s+/i, "") : "";
    const secName = q.Section?.name || "";
    const targetDisplay = clsName 
      ? `Class ${clsName}${secName ? `-${secName}` : ""}`
      : "Class 6-A";

    return {
      id: q.id,
      title: q.title,
      subject: q.subject,
      total_marks: q.total_marks,
      created_at: q.created_at,
      target_class: targetDisplay,
      submissions_count: qSubs.length,
    };
  });
}

/**
 * Gets detailed student submission list for a specific quiz (who completed & who pending).
 */
export async function getTeacherQuizSubmissionsService(quizId, teacherUserId) {
  const quiz = await TeacherQuiz.findByPk(quizId, {
    include: [
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
    ],
  });

  if (!quiz) throw new AppError("Quiz assignment not found", 404);

  // Fetch all students in target class (and section if specified)
  const studentWhere = { school_id: quiz.school_id, class_id: quiz.class_id };
  if (quiz.section_id) {
    studentWhere.section_id = quiz.section_id;
  }

  const students = await Student.findAll({
    where: studentWhere,
    include: [{ model: User, attributes: ["id", "name", "avatar_url", "email"] }],
    order: [["roll_no", "ASC"], ["id", "ASC"]],
  });

  const submissions = await StudentQuizSubmission.findAll({
    where: { quiz_id: quizId },
  });

  const submissionMap = new Map();
  submissions.forEach((s) => {
    submissionMap.set(String(s.student_id), s);
  });

  const studentList = students.map((st) => {
    const sub = submissionMap.get(String(st.user_id));
    return {
      student_id: st.id,
      user_id: st.user_id,
      name: st.User?.name || `Student #${st.roll_no || st.id}`,
      avatar_url: st.User?.avatar_url || null,
      roll_number: st.roll_no,
      status: sub ? "completed" : "pending",
      score: sub ? sub.score : null,
      total_marks: sub ? sub.total_marks : quiz.total_marks,
      percentage: sub ? ((sub.score / (sub.total_marks || 1)) * 100).toFixed(1) : null,
      submitted_at: sub ? sub.submitted_at : null,
    };
  });

  return {
    quiz: {
      id: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      chapter: quiz.chapter,
      class_name: quiz.Class?.class_name,
      section_name: quiz.Section?.name,
      total_marks: quiz.total_marks,
      created_at: quiz.created_at,
    },
    students: studentList,
    total_students: studentList.length,
    completed_count: studentList.filter((s) => s.status === "completed").length,
    pending_count: studentList.filter((s) => s.status === "pending").length,
  };
}
