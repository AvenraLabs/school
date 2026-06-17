import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import Parent from "./parent.model.js";
import Student from "../students/student.model.js";
import User from "../users/user.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import Attendance from "../attendance/attendance.model.js";
import ReportCard from "../report-cards/report-card.model.js";
import ReportCardMark from "../report-cards/report-card-mark.model.js";
import Exam from "../report-cards/exam.model.js";
import Subject from "../subjects/subject.model.js";
import HomeworkSubmission from "../homework/homework-submission.model.js";
import Homework from "../homework/homework.model.js";

export const getStudentAnalytics = asyncHandler(async (req, res) => {
  const { student_id } = req.params;
  const parent_user_id = req.user.id;
  const school_id = req.user.school_id;

  // 1. Verify parent owns this student
  const parent = await Parent.findOne({
    where: {
      user_id: parent_user_id,
      student_id: Number(student_id),
      approval_status: "approved"
    }
  });

  if (!parent) {
    throw new AppError("Student not found or parent is not approved to view this student", 403);
  }

  // 2. Fetch Student Profile with User, Class, Section details
  const student = await Student.findOne({
    where: { id: student_id, school_id, approval_status: "approved" },
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "email", "phone", "avatar_url", "is_active"]
      },
      {
        model: Class,
        attributes: ["id", "class_name"]
      },
      {
        model: Section,
        attributes: ["id", "name"]
      }
    ]
  });

  if (!student) {
    throw new AppError("Student not found", 404);
  }

  // 3. Fetch Attendance statistics
  const attendances = await Attendance.findAll({
    where: { student_id, school_id },
    order: [["date", "DESC"]]
  });

  const totalDays = attendances.length;
  const presentDays = attendances.filter(a => a.status === 'present').length;
  const absentDays = attendances.filter(a => a.status === 'absent').length;
  const leaveDays = attendances.filter(a => a.status === 'leave').length;
  const onDutyDays = attendances.filter(a => a.status === 'on_duty').length;
  const attendancePercentage = totalDays ? Number(((presentDays / totalDays) * 100).toFixed(2)) : 0;

  // Monthly trends for attendance
  const monthlyMap = {};
  attendances.forEach(a => {
    const monthYear = new Date(a.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!monthlyMap[monthYear]) {
      monthlyMap[monthYear] = { month: monthYear, total: 0, present: 0 };
    }
    monthlyMap[monthYear].total += 1;
    if (a.status === 'present' || a.status === 'on_duty') {
      monthlyMap[monthYear].present += 1;
    }
  });
  const monthlyAttendance = Object.values(monthlyMap);

  // 4. Fetch all Report Cards
  const reportCards = await ReportCard.findAll({
    where: { student_id, school_id },
    include: [
      {
        model: Exam,
        attributes: ["id", "name", "start_date", "end_date"]
      },
      {
        model: ReportCardMark,
        include: [
          {
            model: Subject,
            attributes: ["id", "name"]
          }
        ]
      }
    ],
    order: [[Exam, "start_date", "DESC"]]
  });

  // 5. Fetch recent Homework Submissions
  const homeworkSubmissions = await HomeworkSubmission.findAll({
    where: { student_id },
    include: [
      {
        model: Homework,
        attributes: ["id", "description", "due_date", "homework_date"],
        include: [
          {
            model: Subject,
            attributes: ["name"]
          }
        ]
      }
    ],
    order: [["created_at", "DESC"]],
    limit: 10
  });

  res.json({
    success: true,
    data: {
      student,
      attendance: {
        total_days: totalDays,
        present_days: presentDays,
        absent_days: absentDays,
        leave_days: leaveDays,
        on_duty_days: onDutyDays,
        percentage: attendancePercentage,
        monthly: monthlyAttendance,
        history: attendances.slice(0, 30) // Recent 30 history entries to keep response light
      },
      report_cards: reportCards,
      homework_submissions: homeworkSubmissions
    }
  });
});
