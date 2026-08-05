import { fn, col, literal } from "sequelize";
import asyncHandler from "../../shared/asyncHandler.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import Student from "../students/student.model.js";
import Teacher from "../teachers/teacher.model.js";
import User from "../users/user.model.js";
import Attendance from "../attendance/attendance.model.js";
import ExamMark from "../report-cards/exam-mark.model.js";
import Exam from "../report-cards/exam.model.js";
import ExamMaster from "../report-cards/exam-master.model.js";
import ExamSubject from "../report-cards/exam-subject.model.js";
import Subject from "../subjects/subject.model.js";
import TeacherAssignment from "../teacher-assignments/teacher-assignment.model.js";
import { getCurrentAcademicYearId } from "../academic-years/academic-year.helper.js";
import { calculateSubjectAttendanceService } from "../attendance/attendance.analytics.service.js";

// 1. Optimized Main Init Endpoint (Structure & Teachers list only)
export const getSchoolDirectory = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;

  // Fetch all Classes and Sections in this school
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

  // Calculate Student Count per Class & Section
  const studentCounts = await Student.scope("active").findAll({
    where: { school_id },
    attributes: [
      "class_id",
      "section_id",
      [fn("COUNT", col("id")), "count"]
    ],
    group: ["class_id", "section_id"],
    raw: true
  });

  const classCounts = {};
  const sectionCounts = {};
  studentCounts.forEach(row => {
    const cid = String(row.class_id);
    const sid = String(row.section_id);
    const count = Number(row.count);
    
    classCounts[cid] = (classCounts[cid] || 0) + count;
    sectionCounts[sid] = count;
  });

  const classesData = classes.map(c => {
    const cJson = c.toJSON();
    cJson.student_count = classCounts[String(c.id)] || 0;
    cJson.sections = (cJson.sections || []).map(sec => ({
      ...sec,
      student_count: sectionCounts[String(sec.id)] || 0
    }));
    return cJson;
  });

  // Fetch all Teachers, profiles, and assignments
  const teachers = await Teacher.scope("active").findAll({
    where: { school_id },
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "email", "phone", "avatar_url", "is_active"]
      },
      {
        model: TeacherAssignment,
        where: { is_active: true },
        required: false,
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

  const teachersData = teachers.map(t => {
    const tJson = t.toJSON();
    tJson.total_sessions = 0;
    return tJson;
  });

  const totalStudentsCount = await Student.scope("active").count({
    where: { school_id }
  });

  res.json({
    success: true,
    data: {
      classes: classesData,
      teachers: teachersData,
      total_students_count: totalStudentsCount,
    }
  });
});

// 2. Fetch Section Students (Roster list, overall attendance stats, and report cards)
export const getSectionRoster = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const { sectionId } = req.params;

  const students = await Student.scope("active").findAll({
    where: { school_id, section_id: sectionId },
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "email", "phone", "avatar_url", "is_active"]
      }
    ]
  });

  const studentIds = students.map(s => s.id);
  const academicYearId = await getCurrentAcademicYearId(school_id);

  // Overall Attendance stats
  const attendanceStats = studentIds.length ? await Attendance.findAll({
    where: { school_id, student_id: studentIds, academic_year_id: academicYearId },
    attributes: [
      "student_id",
      [fn("COUNT", col("id")), "total_days"],
      [fn("SUM", literal(`CASE WHEN status = 'present' THEN 1 ELSE 0 END`)), "present_days"],
      [fn("SUM", literal(`CASE WHEN status = 'absent' THEN 1 ELSE 0 END`)), "absent_days"],
    ],
    group: ["student_id"]
  }) : [];

  const attendanceMap = {};
  attendanceStats.forEach(row => {
    const total = Number(row.get("total_days"));
    const present = Number(row.get("present_days"));
    const sid = row.student_id;
    attendanceMap[sid] = {
      total_days: total,
      present_days: present,
      absent_days: Number(row.get("absent_days")),
      percentage: total ? Number(((present / total) * 100).toFixed(2)) : 0,
      logs: [], // lazy-loaded on request
      subject_stats: {}
    };
  });

  // Since subject-wise attendance is removed, subject_stats is empty
  Object.keys(attendanceMap).forEach(sid => {
    attendanceMap[sid].subject_stats = {};
  });

  // Report Cards
  const marks = studentIds.length ? await ExamMark.findAll({
    where: { school_id, student_id: studentIds },
    include: [
      {
        model: Subject,
        attributes: ["id", "name"]
      },
      {
        model: Exam,
        attributes: ["id", "name", "createdAt"],
        include: [
          { model: ExamMaster, as: "master", attributes: ["id", "name"] },
          {
            model: ExamSubject,
            as: "exam_subjects",
            include: [{ model: Subject, attributes: ["id", "name"] }],
          },
        ],
      }
    ],
    order: [[Exam, "createdAt", "DESC"]]
  }) : [];

  // Group marks by (student_id, exam_id)
  const studentExamGroups = {};
  marks.forEach(m => {
    const key = `${m.student_id}-${m.exam_id}`;
    const exam = m.exam || m.Exam;
    if (!studentExamGroups[key]) {
      studentExamGroups[key] = {
        id: m.exam_id,
        student_id: m.student_id,
        exam_id: m.exam_id,
        remarks: m.remarks,
        createdAt: exam?.createdAt || m.createdAt,
        exam,
        report_card_marks: []
      };
    }
    studentExamGroups[key].report_card_marks.push({
      id: m.id,
      subject_id: m.subject_id,
      marks_obtained: m.marks_obtained,
      max_marks: m.max_marks,
      remarks: m.remarks,
      subject: m.subject || m.Subject,
      Subject: m.subject || m.Subject
    });
  });

  const reportCardMap = {};
  Object.values(studentExamGroups).forEach(rc => {
    if (!reportCardMap[rc.student_id]) {
      reportCardMap[rc.student_id] = [];
    }
    reportCardMap[rc.student_id].push(rc);
  });

  res.json({
    success: true,
    data: {
      students: students.map(s => {
        const sJson = s.toJSON();
        return {
          ...sJson,
          attendance: attendanceMap[s.id] || { total_days: 0, present_days: 0, percentage: 0, logs: [], subject_stats: {} },
          report_cards: reportCardMap[s.id] || []
        };
      })
    }
  });
});


// 4. Fetch Single Student Profile (drawer cross-linking)
export const getStudentProfile = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const { studentId } = req.params;

  const student = await Student.findOne({
    where: { school_id, id: studentId },
    include: [
      {
        model: User,
        attributes: ["id", "name", "username", "email", "phone", "avatar_url", "is_active"]
      }
    ]
  });

  if (!student) {
    return res.status(404).json({ success: false, message: "Student profile not found." });
  }

  const academicYearId = await getCurrentAcademicYearId(school_id);

  const attendanceStats = await Attendance.findAll({
    where: { school_id, student_id: studentId, academic_year_id: academicYearId },
    attributes: [
      "student_id",
      [fn("COUNT", col("id")), "total_days"],
      [fn("SUM", literal(`CASE WHEN status = 'present' THEN 1 ELSE 0 END`)), "present_days"],
      [fn("SUM", literal(`CASE WHEN status = 'absent' THEN 1 ELSE 0 END`)), "absent_days"],
    ],
    group: ["student_id"]
  });

  const attendanceMap = {
    total_days: 0,
    present_days: 0,
    absent_days: 0,
    percentage: 0,
    logs: [],
    subject_stats: {}
  };

  if (attendanceStats.length) {
    const row = attendanceStats[0];
    const total = Number(row.get("total_days"));
    const present = Number(row.get("present_days"));
    attendanceMap.total_days = total;
    attendanceMap.present_days = present;
    attendanceMap.absent_days = Number(row.get("absent_days"));
    attendanceMap.percentage = total ? Number(((present / total) * 100).toFixed(2)) : 0;

    attendanceMap.subject_stats = {};
    const studentObj = await Student.findByPk(studentId, { attributes: ["class_id", "section_id"] });
    if (studentObj && studentObj.class_id && studentObj.section_id) {
      attendanceMap.subject_stats = await calculateSubjectAttendanceService({
        school_id,
        class_id: studentObj.class_id,
        section_id: studentObj.section_id,
        student_id: studentId,
        academic_year_id: academicYearId,
      });
    }
  }

  const marks = await ExamMark.findAll({
    where: { school_id, student_id: studentId },
    include: [
      {
        model: Subject,
        attributes: ["id", "name"]
      },
      {
        model: Exam,
        attributes: ["id", "name", "createdAt"],
        include: [
          { model: ExamMaster, as: "master", attributes: ["id", "name"] },
          {
            model: ExamSubject,
            as: "exam_subjects",
            include: [{ model: Subject, attributes: ["id", "name"] }],
          },
        ],
      }
    ],
    order: [[Exam, "createdAt", "DESC"]]
  });

  const examGroups = {};
  marks.forEach(m => {
    const examId = m.exam_id;
    const exam = m.exam || m.Exam;
    if (!examGroups[examId]) {
      examGroups[examId] = {
        id: examId,
        student_id: studentId,
        exam_id: examId,
        remarks: m.remarks,
        createdAt: exam?.createdAt || m.createdAt,
        exam,
        report_card_marks: []
      };
    }
    examGroups[examId].report_card_marks.push({
      id: m.id,
      subject_id: m.subject_id,
      marks_obtained: m.marks_obtained,
      max_marks: m.max_marks,
      remarks: m.remarks,
      subject: m.subject || m.Subject,
      Subject: m.subject || m.Subject
    });
  });

  const reportCards = Object.values(examGroups);

  res.json({
    success: true,
    data: {
      ...student.toJSON(),
      attendance: attendanceMap,
      report_cards: reportCards
    }
  });
});

// 5. Fetch Student Raw Attendance Logs (On-demand calendar view)
export const getStudentAttendanceLogs = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const { studentId } = req.params;

  const academicYearId = await getCurrentAcademicYearId(school_id);

  const attendanceLogs = await Attendance.findAll({
    where: { school_id, student_id: studentId, academic_year_id: academicYearId },
    attributes: ["student_id", "date", "status"],
    order: [["date", "ASC"]],
  });

  const logs = attendanceLogs.map(row => {
    let dateStr = row.date;
    if (dateStr instanceof Date) {
      dateStr = dateStr.toISOString().split("T")[0];
    } else if (typeof dateStr === "string") {
      dateStr = dateStr.substring(0, 10);
    }
    return { date: dateStr, status: row.status };
  });

  res.json({
    success: true,
    data: { logs }
  });
});

// 6. Get Dashboard Stats (Counts of active, inactive, approved, and pending statuses)
export const getDashboardStats = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;

  // 1. Classes
  const classesActive = await Class.count({ where: { school_id, is_active: true } });
  const classesInactive = await Class.count({ where: { school_id, is_active: false } });

  // 2. Sections
  const sectionsActive = await Section.count({ where: { school_id, is_active: true } });
  const sectionsInactive = await Section.count({ where: { school_id, is_active: false } });

  // 3. Teachers
  const teachersActive = await Teacher.count({ where: { school_id, is_active: true, approval_status: "approved" } });
  const teachersInactive = await Teacher.count({ where: { school_id, is_active: false, approval_status: "approved" } });
  const teachersApproved = await Teacher.count({ where: { school_id, approval_status: "approved" } });
  const teachersPending = await Teacher.count({ where: { school_id, approval_status: "pending" } });

  // 4. Students
  const studentsActive = await Student.count({ where: { school_id, is_active: true, approval_status: "approved" } });
  const studentsInactive = await Student.count({ where: { school_id, is_active: false, approval_status: "approved" } });
  const studentsApproved = await Student.count({ where: { school_id, approval_status: "approved" } });
  const studentsPending = await Student.count({ where: { school_id, approval_status: "pending" } });

  res.json({
    success: true,
    data: {
      classes: {
        active: classesActive,
        inactive: classesInactive,
        total: classesActive + classesInactive
      },
      sections: {
        active: sectionsActive,
        inactive: sectionsInactive,
        total: sectionsActive + sectionsInactive
      },
      teachers: {
        active: teachersActive,
        inactive: teachersInactive,
        approved: teachersApproved,
        pending: teachersPending,
        total: teachersApproved + teachersPending
      },
      students: {
        active: studentsActive,
        inactive: studentsInactive,
        approved: studentsApproved,
        pending: studentsPending,
        total: studentsApproved + studentsPending
      }
    }
  });
});
