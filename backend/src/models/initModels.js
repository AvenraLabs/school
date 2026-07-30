// src/models/initModels.js
import db from "../config/db.js";

/* ===================== CORE ===================== */
import School from "../modules/schools/school.model.js";
import User from "../modules/users/user.model.js";
import LostFoundItem from "../modules/lost-found/lost-found.model.js";
import Feedback from "../modules/feedback/feedback.model.js";

/* ===================== PEOPLE ===================== */
import Teacher from "../modules/teachers/teacher.model.js";
import Student from "../modules/students/student.model.js";
import TeacherAssignment from "../modules/teacher-assignments/teacher-assignment.model.js";


/* ===================== ACADEMICS ===================== */
import Class from "../modules/classes/classes.model.js";
import Subject from "../modules/subjects/subject.model.js";
import Timetable from "../modules/timetables/timetable.model.js";
import TimetableSubstitution from "../modules/timetables/timetable-substitution.model.js";
import Section from "../modules/sections/section.model.js";

//homework
import Homework from "../modules/homework/homework.model.js";
import HomeworkSubmission from "../modules/homework/homework-submission.model.js";


/* ===================== ACTIVITY ===================== */
import Attendance from "../modules/attendance/attendance.model.js";

/* ===================== QUIZ / GAME ===================== */
import Quiz from "../modules/quiz/quiz.model.js";
import QuizQuestion from "../modules/quiz/quiz-question.model.js";
import GameSession from "../modules/game/game-session.model.js";
import GameSessionPlayer from "../modules/game/game-session-player.model.js";
import PlayerAnswer from "../modules/game/player-answer.model.js";

/* ===================== AI / LOGS / CHAT ===================== */
import AiChatLog from "../modules/ai-chat-logs/ai-chat-log.model.js";
import AuditLog from "../modules/audit/audit-log.model.js";
import StudentChatSession from "../modules/rag/models/student-chat-session.model.js";
import StudentChatMessage from "../modules/rag/models/student-chat-message.model.js";
import TextbookChapter from "../modules/rag/models/textbook-chapter.model.js";
import VideoGeneration from "../modules/ai-video/video-generation.model.js";

/* ===================== QUIZZES / HOMEWORK ===================== */
import TeacherQuiz from "../modules/quiz/teacher-quiz.model.js";
import TeacherQuizQuestion from "../modules/quiz/teacher-quiz-question.model.js";
import StudentQuizSubmission from "../modules/quiz/student-quiz-submission.model.js";

/* ===================== TOKENS / BILLING ===================== */
import TokenAccount from "../modules/tokens/token-account.model.js";
import TokenTransaction from "../modules/tokens/token-transaction.model.js";
import TokenPolicy from "../modules/tokens/token-policy.model.js";

/* ===================== REPORT CARDS ===================== */
import ExamMaster from "../modules/report-cards/exam-master.model.js";
import Exam from "../modules/report-cards/exam.model.js";
import ExamSubject from "../modules/report-cards/exam-subject.model.js";
import ExamMark from "../modules/report-cards/exam-mark.model.js";
import GradingScale from "../modules/report-cards/grading-scale.model.js";

/* ===================== MISC ===================== */
import Notification from "../modules/notifications/notification.model.js";
import NotificationAck from "../modules/notifications/notification-ack.model.js";
import WhatsappLog from "../modules/whatsapp/whatsapp-log.model.js";
import ProfileUpdateRequest from "../modules/approvals/profile-update-request.model.js";

/* ===================== GROUP CHAT ===================== */
import GroupChat from "../modules/group-chat/group-chat.model.js";

import GroupChatMember from "../modules/group-chat/group-chat-member.model.js";
import GroupChatMessage from "../modules/group-chat/group-chat-message.model.js";

/* ===================== TRANSPORT ===================== */
import Driver from "../modules/transport/driver.model.js";
import Vehicle from "../modules/transport/vehicle.model.js";
import StudentTransport from "../modules/transport/student-transport.model.js";
import Trip from "../modules/transport/trip.model.js";
import TripLocation from "../modules/transport/trip-location.model.js";
import TransportRequest from "../modules/transport/transport-request.model.js";

/* ===================== ACADEMIC YEARS & STATUS ===================== */
import AcademicYear from "../modules/academic-years/academic-year.model.js";
import StudentEnrollment from "../modules/students/student-enrollment.model.js";

/* ===================== FEES & EXPENSES ===================== */
import FeeCategory from "../modules/fees/fee-category.model.js";
import FeeDefinition from "../modules/fees/fee-definition.model.js";
import StudentFee from "../modules/fees/student-fee.model.js";
import FeePayment from "../modules/fees/fee-payment.model.js";
import ExpenseCategory from "../modules/expenses/expense-category.model.js";
import Expense from "../modules/expenses/expense.model.js";

/* ===================== LIBRARY ===================== */
import Book from "../modules/library/book.model.js";
import BookIssue from "../modules/library/book-issue.model.js";



const initAssociations = () => {
  /* ==================== SCHOOL ==================== */
  School.hasMany(User, { foreignKey: "school_id" });
  School.hasMany(Class, { foreignKey: "school_id" });
  School.hasMany(Teacher, { foreignKey: "school_id" });
  School.hasMany(Student, { foreignKey: "school_id" });
  School.hasMany(Section, { foreignKey: "school_id" });

  User.belongsTo(School, { foreignKey: "school_id" });
  Section.belongsTo(School, { foreignKey: "school_id" });

  /* ==================== LOST & FOUND ==================== */
  School.hasMany(LostFoundItem, { foreignKey: "school_id", onDelete: "CASCADE" });
  LostFoundItem.belongsTo(School, { foreignKey: "school_id" });

  User.hasMany(LostFoundItem, { foreignKey: "created_by", onDelete: "CASCADE" });
  LostFoundItem.belongsTo(User, { as: "Creator", foreignKey: "created_by" });

  /* ==================== FEEDBACK ==================== */
  School.hasMany(Feedback, { foreignKey: "school_id", onDelete: "SET NULL" });
  Feedback.belongsTo(School, { foreignKey: "school_id" });

  User.hasMany(Feedback, { foreignKey: "user_id", onDelete: "CASCADE" });
  Feedback.belongsTo(User, { foreignKey: "user_id" });

  /* ==================== PROFILE UPDATE REQUESTS ==================== */
  School.hasMany(ProfileUpdateRequest, { foreignKey: "school_id", onDelete: "CASCADE" });
  ProfileUpdateRequest.belongsTo(School, { foreignKey: "school_id" });
  User.hasMany(ProfileUpdateRequest, { foreignKey: "user_id", onDelete: "CASCADE" });
  ProfileUpdateRequest.belongsTo(User, { foreignKey: "user_id" });

  /* ==================== USER PROFILES ==================== */
  User.hasOne(Student, { foreignKey: "user_id" });
  Student.belongsTo(User, { foreignKey: "user_id" });

  User.hasOne(Teacher, { foreignKey: "user_id" });
  Teacher.belongsTo(User, { foreignKey: "user_id" });

  /* ==================== STUDENT (LEGACY – KEEP) ==================== */
  Student.belongsTo(School, { foreignKey: "school_id" });
  Student.belongsTo(Class, { foreignKey: "class_id" });
  Student.belongsTo(Section, { foreignKey: "section_id" });

  Class.hasMany(Student, { foreignKey: "class_id" });
  Section.hasMany(Student, { foreignKey: "section_id" });

  Student.hasMany(Attendance, { foreignKey: "student_id" });

  /* ==================== REPORT CARDS ==================== */
  ExamMaster.belongsTo(School, { foreignKey: "school_id" });

  Exam.belongsTo(School, { foreignKey: "school_id" });
  Exam.belongsTo(Class, { foreignKey: "class_id" });
  Exam.belongsTo(Section, { foreignKey: "section_id", as: "section" });
  Exam.belongsTo(ExamMaster, { foreignKey: "exam_master_id", as: "master" });

  ExamMaster.hasMany(Exam, { foreignKey: "exam_master_id" });

  Exam.hasMany(ExamSubject, { foreignKey: "exam_id", as: "exam_subjects", onDelete: "CASCADE" });
  ExamSubject.belongsTo(Exam, { foreignKey: "exam_id" });
  ExamSubject.belongsTo(Subject, { foreignKey: "subject_id" });

  Exam.hasMany(ExamMark, { foreignKey: "exam_id", onDelete: "CASCADE" });
  ExamMark.belongsTo(Exam, { foreignKey: "exam_id" });
  ExamMark.belongsTo(School, { foreignKey: "school_id" });
  ExamMark.belongsTo(Student, { foreignKey: "student_id" });
  ExamMark.belongsTo(Subject, { foreignKey: "subject_id" });
  Student.hasMany(ExamMark, { foreignKey: "student_id", onDelete: "CASCADE" });






  /* ==================== TEACHER ==================== */
  Teacher.belongsTo(School, { foreignKey: "school_id" });
  Teacher.belongsTo(User, { foreignKey: "user_id" });
  Teacher.hasMany(Class, { foreignKey: "class_teacher_id" });
  Teacher.hasMany(TeacherAssignment, { foreignKey: "teacher_id" });


  /* ==================== ATTENDANCE ==================== */
  Attendance.belongsTo(School, { foreignKey: "school_id" });
  Attendance.belongsTo(Class, { foreignKey: "class_id" });
  Attendance.belongsTo(Section, { foreignKey: "section_id" });
  Attendance.belongsTo(Student, { foreignKey: "student_id" });
  Attendance.belongsTo(User, { foreignKey: "marked_by" });
  Attendance.belongsTo(User, { as: "Creator", foreignKey: "created_by" });
  Attendance.belongsTo(User, { as: "Updater", foreignKey: "updated_by" });

  // Reverse associations
  Student.hasMany(Attendance, { foreignKey: "student_id" });

  /* ==================== CLASS ==================== */
  Class.belongsTo(School, { foreignKey: "school_id" });
  Class.belongsTo(Teacher, { foreignKey: "class_teacher_id" });
  Class.hasMany(Attendance, { foreignKey: "class_id" });
  Class.hasMany(Section, { foreignKey: "class_id" });
  Class.hasMany(Timetable, { foreignKey: "class_id" });

  /* ==================== SUBJECT ==================== */
  Subject.belongsTo(School, { foreignKey: "school_id" });

  /* ==================== SECTION ==================== */
  Section.hasMany(Timetable, { foreignKey: "section_id" });
  Section.hasMany(Attendance, { foreignKey: "section_id" });

  /* ==================== TEACHER ASSIGNMENTS ==================== */
  TeacherAssignment.belongsTo(Teacher, { foreignKey: "teacher_id" });
  TeacherAssignment.belongsTo(Class, { foreignKey: "class_id" });
  TeacherAssignment.belongsTo(Section, { foreignKey: "section_id" });
  TeacherAssignment.belongsTo(Subject, { foreignKey: "subject_id" });
  TeacherAssignment.hasMany(Timetable, {
    foreignKey: "teacher_assignment_id",
  });

  /* ==================== TIMETABLE ==================== */
  Timetable.belongsTo(Class, { foreignKey: "class_id" });
  Timetable.belongsTo(Section, { foreignKey: "section_id" });
  Timetable.belongsTo(TeacherAssignment, { foreignKey: "teacher_assignment_id" });
  Timetable.hasMany(TimetableSubstitution, { foreignKey: "timetable_id" });

  TimetableSubstitution.belongsTo(Timetable, { foreignKey: "timetable_id" });
  TimetableSubstitution.belongsTo(Class, { foreignKey: "class_id" });
  TimetableSubstitution.belongsTo(Section, { foreignKey: "section_id" });
  TimetableSubstitution.belongsTo(Teacher, { as: "OriginalTeacher", foreignKey: "original_teacher_id" });
  TimetableSubstitution.belongsTo(Teacher, { as: "SubstituteTeacher", foreignKey: "substitute_teacher_id" });


  /* ==================== CHAPTER / TOPIC (REMOVED - UNUSED) ==================== */

  /* ==================== QUIZ / GAME ==================== */
  Quiz.belongsTo(User, { foreignKey: "owner_user_id" });
  Quiz.hasMany(QuizQuestion, { foreignKey: "quiz_id" });

  QuizQuestion.belongsTo(Quiz, { foreignKey: "quiz_id" });

  GameSession.belongsTo(Quiz, { foreignKey: "quiz_id" });
  GameSession.belongsTo(User, { foreignKey: "host_user_id" });
  GameSession.hasMany(GameSessionPlayer, { foreignKey: "session_id" });

  GameSessionPlayer.belongsTo(GameSession, { foreignKey: "session_id" });
  GameSessionPlayer.belongsTo(User, { foreignKey: "user_id" });
  GameSessionPlayer.hasMany(PlayerAnswer, {
    foreignKey: "session_player_id",
  });

  PlayerAnswer.belongsTo(GameSessionPlayer, {
    foreignKey: "session_player_id",
  });
  PlayerAnswer.belongsTo(QuizQuestion, { foreignKey: "question_id" });

  /* ==================== AI / LOGS ==================== */
  AiChatLog.belongsTo(User, { foreignKey: "user_id" });
  AuditLog.belongsTo(User, { foreignKey: "performed_by" });
  User.hasMany(AuditLog, { foreignKey: "performed_by" });


  /* ==================== HOMEWORK ==================== */
  Homework.belongsTo(Class, { foreignKey: "class_id" });
  Homework.belongsTo(Section, { foreignKey: "section_id" });
  Homework.belongsTo(Subject, { foreignKey: "subject_id" });
  Homework.belongsTo(TeacherAssignment, { foreignKey: "teacher_assignment_id" });
  Homework.belongsTo(User, { foreignKey: "created_by" });
  Homework.hasMany(HomeworkSubmission, { foreignKey: "homework_id" });

  // Reverse associations
  Class.hasMany(Homework, { foreignKey: "class_id" });
  Section.hasMany(Homework, { foreignKey: "section_id" });
  TeacherAssignment.hasMany(Homework, { foreignKey: "teacher_assignment_id" });
  HomeworkSubmission.belongsTo(Homework, { foreignKey: "homework_id" });
  HomeworkSubmission.belongsTo(Student, { foreignKey: "student_id" });

  Homework.hasMany(HomeworkSubmission, {
    foreignKey: "homework_id",
    onDelete: "CASCADE",
  });


  /* ==================== TOKENS ==================== */
  TokenAccount.belongsTo(User, { foreignKey: "user_id" });
  TokenTransaction.belongsTo(User, { foreignKey: "user_id" });
  TokenPolicy.belongsTo(User, { foreignKey: "updated_by" });

  /* ==================== NOTIFICATIONS ==================== */
  Notification.belongsTo(User, { foreignKey: "sender_user_id" });
  Notification.belongsTo(School, { foreignKey: "school_id" });
  Notification.belongsTo(Class, { foreignKey: "class_id" });
  NotificationAck.belongsTo(Notification, {
    foreignKey: "notification_id",
    onDelete: "CASCADE",
  });
  NotificationAck.belongsTo(User, {
    foreignKey: "user_id",
    onDelete: "CASCADE",
  });

  Notification.hasMany(NotificationAck, {
    foreignKey: "notification_id",
  });

  /* ==================== WHATSAPP LOGS ==================== */
  School.hasMany(WhatsappLog, { foreignKey: "school_id" });
  WhatsappLog.belongsTo(School, { foreignKey: "school_id" });

  /* ==================== GROUP CHAT ==================== */
  GroupChat.hasMany(GroupChatMember, { foreignKey: "group_chat_id" });
  GroupChatMember.belongsTo(GroupChat, { foreignKey: "group_chat_id" });

  GroupChatMember.belongsTo(User, { foreignKey: "user_id" });

  GroupChat.belongsTo(User, { foreignKey: "teacher_id", as: "Teacher" });
  GroupChat.belongsTo(Subject, { foreignKey: "subject_id" });
  GroupChat.belongsTo(Class, { foreignKey: "class_id" });
  GroupChat.belongsTo(Section, { foreignKey: "section_id" });

  GroupChat.hasMany(GroupChatMessage, { foreignKey: "group_chat_id" });
  GroupChatMessage.belongsTo(GroupChat, { foreignKey: "group_chat_id" });
  GroupChatMessage.belongsTo(User, { foreignKey: "sender_user_id", as: "Sender" });

  /* ==================== TRANSPORT ==================== */
  School.hasMany(Driver, { foreignKey: "school_id" });
  Driver.belongsTo(School, { foreignKey: "school_id" });

  User.hasOne(Driver, { foreignKey: "user_id" });
  Driver.belongsTo(User, { foreignKey: "user_id" });

  School.hasMany(Vehicle, { foreignKey: "school_id" });
  Vehicle.belongsTo(School, { foreignKey: "school_id" });

  Driver.hasOne(Vehicle, { foreignKey: "driver_id" });
  Vehicle.belongsTo(Driver, { foreignKey: "driver_id", onDelete: "SET NULL" });

  Student.hasOne(StudentTransport, { foreignKey: "student_id" });
  StudentTransport.belongsTo(Student, { foreignKey: "student_id" });

  Vehicle.hasMany(StudentTransport, { foreignKey: "vehicle_id" });
  StudentTransport.belongsTo(Vehicle, { foreignKey: "vehicle_id" });

  School.hasMany(StudentTransport, { foreignKey: "school_id" });
  StudentTransport.belongsTo(School, { foreignKey: "school_id" });

  School.hasMany(Trip, { foreignKey: "school_id" });
  Trip.belongsTo(School, { foreignKey: "school_id" });

  Driver.hasMany(Trip, { foreignKey: "driver_id" });
  Trip.belongsTo(Driver, { foreignKey: "driver_id" });

  Vehicle.hasMany(Trip, { foreignKey: "vehicle_id" });
  Trip.belongsTo(Vehicle, { foreignKey: "vehicle_id" });

  Trip.hasMany(TripLocation, { foreignKey: "trip_id", onDelete: "CASCADE" });
  TripLocation.belongsTo(Trip, { foreignKey: "trip_id" });

  School.hasMany(TransportRequest, { foreignKey: "school_id" });
  TransportRequest.belongsTo(School, { foreignKey: "school_id" });

  Student.hasMany(TransportRequest, { foreignKey: "student_id" });
  TransportRequest.belongsTo(Student, { foreignKey: "student_id" });

  Vehicle.hasMany(TransportRequest, { foreignKey: "current_vehicle_id" });
  TransportRequest.belongsTo(Vehicle, { as: "CurrentVehicle", foreignKey: "current_vehicle_id" });

  Vehicle.hasMany(TransportRequest, { foreignKey: "requested_vehicle_id" });
  TransportRequest.belongsTo(Vehicle, { as: "RequestedVehicle", foreignKey: "requested_vehicle_id" });

  /* ==================== ACADEMIC YEARS & ENROLLMENTS ==================== */
  School.hasMany(AcademicYear, { foreignKey: "school_id", onDelete: "CASCADE" });
  AcademicYear.belongsTo(School, { foreignKey: "school_id" });

  School.hasMany(GradingScale, { foreignKey: "school_id", onDelete: "CASCADE" });
  GradingScale.belongsTo(School, { foreignKey: "school_id" });

  Student.hasMany(StudentEnrollment, { foreignKey: "student_id", onDelete: "CASCADE" });
  StudentEnrollment.belongsTo(Student, { foreignKey: "student_id" });

  AcademicYear.hasMany(StudentEnrollment, { foreignKey: "academic_year_id", onDelete: "CASCADE" });
  StudentEnrollment.belongsTo(AcademicYear, { foreignKey: "academic_year_id" });

  Class.hasMany(StudentEnrollment, { foreignKey: "class_id", onDelete: "CASCADE" });
  StudentEnrollment.belongsTo(Class, { foreignKey: "class_id" });

  Section.hasMany(StudentEnrollment, { foreignKey: "section_id", onDelete: "CASCADE" });
  StudentEnrollment.belongsTo(Section, { foreignKey: "section_id" });

  /* ==================== FEES ==================== */
  School.hasMany(FeeCategory, { foreignKey: "school_id", onDelete: "CASCADE" });
  FeeCategory.belongsTo(School, { foreignKey: "school_id" });

  School.hasMany(FeeDefinition, { foreignKey: "school_id", onDelete: "CASCADE" });
  FeeDefinition.belongsTo(School, { foreignKey: "school_id" });

  FeeDefinition.belongsTo(Class, { foreignKey: "class_id", onDelete: "CASCADE" });
  Class.hasMany(FeeDefinition, { foreignKey: "class_id" });

  FeeDefinition.belongsTo(AcademicYear, { foreignKey: "academic_year_id", onDelete: "CASCADE" });
  AcademicYear.hasMany(FeeDefinition, { foreignKey: "academic_year_id" });

  Student.hasMany(StudentFee, { foreignKey: "student_id", onDelete: "CASCADE" });
  StudentFee.belongsTo(Student, { foreignKey: "student_id" });

  StudentFee.belongsTo(FeeDefinition, { foreignKey: "fee_definition_id", onDelete: "CASCADE" });
  FeeDefinition.hasMany(StudentFee, { foreignKey: "fee_definition_id" });

  StudentFee.belongsTo(AcademicYear, { foreignKey: "academic_year_id" });
  AcademicYear.hasMany(StudentFee, { foreignKey: "academic_year_id" });

  Student.hasMany(FeePayment, { foreignKey: "student_id", onDelete: "CASCADE" });
  FeePayment.belongsTo(Student, { foreignKey: "student_id" });

  StudentFee.hasMany(FeePayment, { foreignKey: "student_fee_id", onDelete: "CASCADE" });
  FeePayment.belongsTo(StudentFee, { foreignKey: "student_fee_id" });

  FeePayment.belongsTo(User, { as: "VoidedBy", foreignKey: "voided_by" });

  /* ==================== EXPENSES ==================== */
  School.hasMany(ExpenseCategory, { foreignKey: "school_id", onDelete: "CASCADE" });
  ExpenseCategory.belongsTo(School, { foreignKey: "school_id" });

  School.hasMany(Expense, { foreignKey: "school_id", onDelete: "CASCADE" });
  Expense.belongsTo(School, { foreignKey: "school_id" });

  ExpenseCategory.hasMany(Expense, { foreignKey: "category_id", onDelete: "CASCADE" });
  Expense.belongsTo(ExpenseCategory, { as: "category", foreignKey: "category_id" });

  Expense.belongsTo(AcademicYear, { foreignKey: "academic_year_id" });
  Expense.belongsTo(User, { as: "Creator", foreignKey: "created_by" });
  Expense.belongsTo(User, { as: "Canceller", foreignKey: "cancelled_by" });

  /* ==================== LIBRARY ==================== */
  School.hasMany(Book, { foreignKey: "school_id", onDelete: "CASCADE" });
  Book.belongsTo(School, { foreignKey: "school_id" });

  Book.belongsTo(User, { as: "Creator", foreignKey: "created_by" });

  School.hasMany(BookIssue, { foreignKey: "school_id", onDelete: "CASCADE" });
  BookIssue.belongsTo(School, { foreignKey: "school_id" });

  Book.hasMany(BookIssue, { foreignKey: "book_id", onDelete: "CASCADE" });
  BookIssue.belongsTo(Book, { as: "Book", foreignKey: "book_id" });

  Student.hasMany(BookIssue, { foreignKey: "student_id", onDelete: "CASCADE" });
  BookIssue.belongsTo(Student, { as: "Student", foreignKey: "student_id" });

  Teacher.hasMany(BookIssue, { foreignKey: "teacher_id", onDelete: "CASCADE" });
  BookIssue.belongsTo(Teacher, { as: "Teacher", foreignKey: "teacher_id" });

  BookIssue.belongsTo(User, { as: "IssuedBy", foreignKey: "issued_by" });
  BookIssue.belongsTo(User, { as: "ReturnedBy", foreignKey: "returned_by" });

  /* ==================== CHAT HISTORY ==================== */
  User.hasMany(StudentChatSession, { foreignKey: "student_id", onDelete: "CASCADE" });
  StudentChatSession.belongsTo(User, { foreignKey: "student_id" });

  StudentChatSession.hasMany(StudentChatMessage, { foreignKey: "session_id", onDelete: "CASCADE" });
  StudentChatMessage.belongsTo(StudentChatSession, { foreignKey: "session_id" });

  /* ==================== TEACHER QUIZZES / HOMEWORK ==================== */
  TeacherQuiz.hasMany(TeacherQuizQuestion, { foreignKey: "quiz_id", onDelete: "CASCADE", as: "Questions" });
  TeacherQuizQuestion.belongsTo(TeacherQuiz, { foreignKey: "quiz_id" });

  TeacherQuiz.belongsTo(Class, { foreignKey: "class_id" });
  TeacherQuiz.belongsTo(Section, { foreignKey: "section_id" });

  TeacherQuiz.hasMany(StudentQuizSubmission, { foreignKey: "quiz_id", onDelete: "CASCADE", as: "Submissions" });
  StudentQuizSubmission.belongsTo(TeacherQuiz, { foreignKey: "quiz_id" });

  /* ==================== VIDEO GENERATIONS ==================== */
  Teacher.hasMany(VideoGeneration, { foreignKey: "teacher_id", onDelete: "SET NULL" });
  VideoGeneration.belongsTo(Teacher, { foreignKey: "teacher_id" });
  VideoGeneration.belongsTo(Class, { foreignKey: "class_id" });
  VideoGeneration.belongsTo(Section, { foreignKey: "section_id" });
  VideoGeneration.belongsTo(School, { foreignKey: "school_id" });
};

initAssociations();

// Ensure notifications table has target_user_id column & schools table has whatsapp quota columns & token_policies has annual_video_seconds
db.query(`
  ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_user_id BIGINT;
  CREATE INDEX IF NOT EXISTS idx_notifications_target_user ON notifications(target_user_id);
  ALTER TABLE schools ADD COLUMN IF NOT EXISTS whatsapp_annual_limit INTEGER DEFAULT 10000;
  ALTER TABLE schools ADD COLUMN IF NOT EXISTS whatsapp_sent_count INTEGER DEFAULT 0;
  ALTER TABLE token_policies ADD COLUMN IF NOT EXISTS annual_video_seconds INTEGER DEFAULT 0;
`).catch((err) => console.error("[InitModels] Schema patch error:", err.message));

export default db;
