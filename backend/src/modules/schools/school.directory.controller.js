import { fn, col, literal } from "sequelize";
import asyncHandler from "../../shared/asyncHandler.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import Student from "../students/student.model.js";
import Teacher from "../teachers/teacher.model.js";
import Parent from "../parents/parent.model.js";
import User from "../users/user.model.js";
import Attendance from "../attendance/attendance.model.js";
import ReportCard from "../report-cards/report-card.model.js";
import ReportCardMark from "../report-cards/report-card-mark.model.js";
import Exam from "../report-cards/exam.model.js";
import Subject from "../subjects/subject.model.js";
import TeacherAssignment from "../teacher-assignments/teacher-assignment.model.js";
import TeacherClassSession from "../teacher-class-sessions/teacher-class-session.model.js";

export const getSchoolDirectory = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;

  // 1. Fetch all Classes and their Sections in this school
  const classes = await Class.findAll({
    where: { school_id },
    include: [
      {
        model: Section,
        attributes: ["id", "name"]
      },
      {
        model: Teacher,
        include: [{ model: User, attributes: ["name", "username", "avatar_url"] }]
      }
    ],
    order: [["class_name", "ASC"]]
  });

  // 2. Fetch all approved Students, their Users, linked Parents, Class/Section ids
  const students = await Student.findAll({
    where: { school_id, approval_status: "approved" },
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "email", "phone", "avatar_url", "is_active"]
      },
      {
        model: Parent,
        include: [
          {
            model: User,
            attributes: ["id", "name", "username", "email", "phone", "avatar_url"]
          }
        ]
      }
    ]
  });

  // 3. Aggregate Attendance statistics for all students in school
  const attendanceStats = await Attendance.findAll({
    where: { school_id },
    attributes: [
      "student_id",
      [fn("COUNT", col("id")), "total_days"],
      [fn("SUM", literal(`CASE WHEN status = 'present' THEN 1 ELSE 0 END`)), "present_days"],
      [fn("SUM", literal(`CASE WHEN status = 'absent' THEN 1 ELSE 0 END`)), "absent_days"],
      [fn("SUM", literal(`CASE WHEN status = 'leave' THEN 1 ELSE 0 END`)), "leave_days"]
    ],
    group: ["student_id"]
  });

  const attendanceMap = {};
  attendanceStats.forEach(row => {
    const total = Number(row.get("total_days"));
    const present = Number(row.get("present_days"));
    attendanceMap[row.student_id] = {
      total_days: total,
      present_days: present,
      absent_days: Number(row.get("absent_days")),
      leave_days: Number(row.get("leave_days")),
      percentage: total ? Number(((present / total) * 100).toFixed(2)) : 0
    };
  });

  // 4. Fetch all Report Cards and their Marks for all students in school
  const reportCards = await ReportCard.findAll({
    where: { school_id },
    include: [
      {
        model: Exam,
        attributes: ["id", "name", "start_date"]
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

  const reportCardMap = {};
  reportCards.forEach(rc => {
    if (!reportCardMap[rc.student_id]) {
      reportCardMap[rc.student_id] = [];
    }
    reportCardMap[rc.student_id].push(rc);
  });

  // 5. Fetch all Teachers, their user profiles, and assignments
  const teachers = await Teacher.findAll({
    where: { school_id },
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "email", "phone", "avatar_url", "is_active"]
      },
      {
        model: TeacherAssignment,
        include: [
          {
            model: Subject,
            attributes: ["id", "name"]
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
      }
    ]
  });

  // 6. Aggregate sessions taken by teachers in this school
  const sessionStats = await TeacherClassSession.findAll({
    where: { school_id },
    attributes: [
      "teacher_id",
      [fn("COUNT", col("id")), "total_sessions"]
    ],
    group: ["teacher_id"]
  });

  const sessionsMap = {};
  sessionStats.forEach(row => {
    sessionsMap[row.teacher_id] = Number(row.get("total_sessions"));
  });

  // 7. Fetch all Parents with User profile and their child lists
  const parents = await Parent.findAll({
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "email", "phone", "avatar_url", "is_active"]
      },
      {
        model: Student,
        where: { school_id, approval_status: "approved" },
        include: [
          { model: User, attributes: ["name"] },
          { model: Class, attributes: ["class_name"] },
          { model: Section, attributes: ["name"] }
        ]
      }
    ]
  });

  // Assemble full directory payload
  res.json({
    success: true,
    data: {
      classes,
      students: students.map(s => {
        const sJson = s.toJSON();
        return {
          ...sJson,
          attendance: attendanceMap[s.id] || { total_days: 0, present_days: 0, percentage: 0 },
          report_cards: reportCardMap[s.id] || []
        };
      }),
      teachers: teachers.map(t => {
        const tJson = t.toJSON();
        return {
          ...tJson,
          total_sessions: sessionsMap[t.id] || 0
        };
      }),
      parents: parents.filter(p => p.student !== null) // Filter out parents without approved linked child in school
    }
  });
});
