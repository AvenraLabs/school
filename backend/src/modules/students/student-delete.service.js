import db from "../../config/db.js";
import User from "../users/user.model.js";
import Student from "./student.model.js";
import HomeworkSubmission from "../homework/homework-submission.model.js";
import StudentTransport from "../transport/student-transport.model.js";
import TransportRequest from "../transport/transport-request.model.js";
import StudentEnrollment from "./student-enrollment.model.js";
import ExamMark from "../report-cards/exam-mark.model.js";
import Attendance from "../attendance/attendance.model.js";
import GameSessionPlayer from "../game/game-session-player.model.js";
import PlayerAnswer from "../game/player-answer.model.js";
import TokenTransaction from "../tokens/token-transaction.model.js";
import TokenAccount from "../tokens/token-account.model.js";
import NotificationAck from "../notifications/notification-ack.model.js";
import GroupChatMember from "../group-chat/group-chat-member.model.js";
import GroupChatMessage from "../group-chat/group-chat-message.model.js";
import Feedback from "../feedback/feedback.model.js";
import ProfileUpdateRequest from "../approvals/profile-update-request.model.js";
import AiChatLog from "../ai-chat-logs/ai-chat-log.model.js";
import BookIssue from "../library/book-issue.model.js";
import AppError from "../../shared/appError.js";


/**
 * Clean up all associated student and user data in a transaction
 */
export const deleteStudentData = async (studentId, userId, transaction) => {
  // 1. Delete player answers by finding the player session IDs first
  const playerSessions = await GameSessionPlayer.findAll({
    where: { user_id: userId },
    attributes: ["id"],
    transaction,
  });
  const sessionPlayerIds = playerSessions.map((p) => p.id);
  if (sessionPlayerIds.length > 0) {
    await PlayerAnswer.destroy({
      where: { session_player_id: sessionPlayerIds },
      transaction,
    });
  }

  // 2. Delete game session players
  await GameSessionPlayer.destroy({
    where: { user_id: userId },
    transaction,
  });

  // 3. Delete other student-level related content
  await HomeworkSubmission.destroy({ where: { student_id: studentId }, transaction });
  await StudentTransport.destroy({ where: { student_id: studentId }, transaction });
  await TransportRequest.destroy({ where: { student_id: studentId }, transaction });
  await StudentEnrollment.destroy({ where: { student_id: studentId }, transaction });
  await ExamMark.destroy({ where: { student_id: studentId }, transaction });
  await Attendance.destroy({ where: { student_id: studentId }, transaction });

  // Delete Fee data
  if (db.models.fee_payment) {
    await db.models.fee_payment.destroy({ where: { student_id: studentId }, transaction });
  }
  if (db.models.student_fee_ledger) {
    await db.models.student_fee_ledger.destroy({ where: { student_id: studentId }, transaction });
  }

  // 4. Delete user-level related content
  await TokenTransaction.destroy({ where: { user_id: userId }, transaction });
  await TokenAccount.destroy({ where: { user_id: userId }, transaction });
  await NotificationAck.destroy({ where: { user_id: userId }, transaction });
  await GroupChatMember.destroy({ where: { user_id: userId }, transaction });
  await GroupChatMessage.destroy({ where: { sender_user_id: userId }, transaction });
  await Feedback.destroy({ where: { user_id: userId }, transaction });
  await ProfileUpdateRequest.destroy({ where: { user_id: userId }, transaction });
  await AiChatLog.destroy({ where: { user_id: userId }, transaction });

  // Library — remove all issue records
  await BookIssue.destroy({ where: { student_id: studentId }, transaction });

  // 5. Delete student and user accounts
  await Student.destroy({ where: { id: studentId }, transaction });
  await User.destroy({ where: { id: userId }, transaction });

};

/**
 * Delete a single student and all their contents fully
 */
export const deleteSingleStudentService = async (studentId) => {
  const student = await Student.findByPk(studentId);
  if (!student) {
    throw new AppError("Student not found", 404);
  }

  // Check for pending library books before deletion
  const pendingBooks = await BookIssue.count({
    where: { student_id: studentId, status: "issued" },
  });
  if (pendingBooks > 0) {
    throw new AppError(
      `Student has ${pendingBooks} library book(s) still issued. Please collect and return them before deleting the student.`,
      400
    );
  }

  const t = await db.transaction();
  try {
    await deleteStudentData(student.id, student.user_id, t);
    await t.commit();
    return { success: true, message: "Student and all related records deleted successfully" };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};


/**
 * Delete all students in a section and all their contents fully
 */
export const deleteSectionStudentsService = async (sectionId) => {
  const students = await Student.findAll({
    where: { section_id: sectionId },
    attributes: ["id", "user_id"],
  });

  if (!students.length) {
    throw new AppError("No students found in this section", 404);
  }

  const t = await db.transaction();
  try {
    for (const student of students) {
      await deleteStudentData(student.id, student.user_id, t);
    }
    await t.commit();
    return {
      success: true,
      message: `Successfully deleted ${students.length} student(s) and all related records`,
    };
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
