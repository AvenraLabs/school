import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import ExamMark from "../report-cards/exam-mark.model.js";
import Exam from "../report-cards/exam.model.js";
import ExamSubject from "../report-cards/exam-subject.model.js";
import Subject from "../subjects/subject.model.js";
import Student from "../students/student.model.js";
import User from "../users/user.model.js";
import Attendance from "../attendance/attendance.model.js";
import TeacherAssignment from "../teacher-assignments/teacher-assignment.model.js";
import { getCurrentAcademicYearId } from "../academic-years/academic-year.helper.js";
import { Op } from "sequelize";

/* =========================
   STUDENT ANALYTICS
   ========================= */
export const getStudentAnalytics = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  let student_id = req.user.student_id;

  // If teacher or admin, they can pass student_id as query param
  if (req.user.role === "teacher" || req.user.role === "school_admin") {
    student_id = req.query.student_id ? Number(req.query.student_id) : null;
  }

  if (!student_id) {
    throw new AppError("Student ID is required", 400);
  }

  const student = await Student.findOne({
    where: { id: student_id, school_id },
    include: [{ model: User, attributes: ["name"] }],
  });
  if (!student) {
    throw new AppError("Student not found", 404);
  }

  const academic_year_id = await getCurrentAcademicYearId(school_id);

  // 1. Fetch all student marks
  const marks = await ExamMark.findAll({
    where: { student_id, school_id, academic_year_id },
    include: [
      {
        model: Subject,
        attributes: ["id", "name"],
      },
      {
        model: Exam,
        attributes: ["id", "name", "created_at"],
        include: [
          {
            model: ExamSubject,
            as: "exam_subjects",
            attributes: ["id", "subject_id", "exam_date"],
          },
        ],
      },
    ],
  });

  // 2. Fetch Attendance
  const totalAttendance = await Attendance.count({
    where: { student_id, school_id, academic_year_id },
  });
  const presentAttendance = await Attendance.count({
    where: { student_id, school_id, academic_year_id, status: "present" },
  });
  const attendancePercentage =
    totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 100;

  // 3. Compute overall academic average
  const totalObtained = marks.reduce((sum, m) => sum + m.marks_obtained, 0);
  const totalMax = marks.reduce((sum, m) => sum + (m.max_marks || 100), 0);
  const academicPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

  // 4. Calculate Exam Trends (Line Graph)
  const examGroups = {};
  marks.forEach((m) => {
    const examId = m.exam_id;
    const examName = m.exam?.name || `Exam #${examId}`;
    if (!examGroups[examId]) {
      examGroups[examId] = {
        id: examId,
        name: examName,
        obtained: 0,
        max: 0,
        date: m.exam?.created_at || m.created_at,
      };
    }
    examGroups[examId].obtained += m.marks_obtained;
    examGroups[examId].max += m.max_marks || 100;
  });

  const examTrends = Object.values(examGroups)
    .map((g) => ({
      name: g.name,
      percentage: g.max > 0 ? Math.round((g.obtained / g.max) * 100) : 0,
      obtained: g.obtained,
      max: g.max,
      date: g.date,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // 5. Calculate Subject Radar Metrics
  const subjectBuckets = {};
  marks.forEach((m) => {
    const subjectName = m.subject?.name || `Subject #${m.subject_id}`;
    if (!subjectBuckets[subjectName]) {
      subjectBuckets[subjectName] = { obtained: 0, max: 0 };
    }
    subjectBuckets[subjectName].obtained += m.marks_obtained;
    subjectBuckets[subjectName].max += m.max_marks || 100;
  });

  const subjectAverages = Object.entries(subjectBuckets).map(([subject, stats]) => ({
    subject,
    score: stats.max > 0 ? Math.round((stats.obtained / stats.max) * 100) : 0,
  }));

  const sortedSubjects = [...subjectAverages].sort((a, b) => b.score - a.score);
  const strongSubject = sortedSubjects[0] || null;
  const focusSubject = sortedSubjects[sortedSubjects.length - 1] || null;

  // 6. Calculate Class Rank
  const classmates = await Student.findAll({
    where: { class_id: student.class_id, school_id, status: "ACTIVE" },
    attributes: ["id"],
  });
  const classmateIds = classmates.map((c) => c.id);

  const classmateMarks = await ExamMark.findAll({
    where: { student_id: classmateIds, school_id, academic_year_id },
    attributes: ["student_id", "marks_obtained", "max_marks"],
  });

  const classmatePercentages = classmateIds.map((sid) => {
    const sMarks = classmateMarks.filter((m) => Number(m.student_id) === Number(sid));
    const obtained = sMarks.reduce((sum, m) => sum + m.marks_obtained, 0);
    const max = sMarks.reduce((sum, m) => sum + (m.max_marks || 100), 0);
    return {
      student_id: sid,
      percentage: max > 0 ? (obtained / max) * 100 : 0,
    };
  });

  classmatePercentages.sort((a, b) => b.percentage - a.percentage);
  const rank = classmatePercentages.findIndex((p) => Number(p.student_id) === Number(student_id)) + 1;

  res.json({
    success: true,
    data: {
      student: {
        id: student.id,
        name: student.user?.name || student.name,
        roll_no: student.roll_no,
      },
      holistic_index: Math.round((academicPercentage * 0.7) + (attendancePercentage * 0.3)),
      academic_percentage: academicPercentage,
      attendance_percentage: attendancePercentage,
      class_rank: `${rank} / ${classmates.length}`,
      trends: examTrends,
      radar: subjectAverages,
      strong_subject: strongSubject,
      focus_subject: focusSubject,
    },
  });
});

/* =========================
   TEACHER CLASS SECTION ANALYTICS
   ========================= */
export const getClassAnalytics = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const class_id = Number(req.query.class_id);
  const section_id = Number(req.query.section_id);

  if (!class_id || !section_id) {
    throw new AppError("class_id and section_id are required", 400);
  }

  const academic_year_id = await getCurrentAcademicYearId(school_id);

  // Fetch all students in section
  const students = await Student.findAll({
    where: { school_id, class_id, section_id, status: "ACTIVE" },
    include: [{ model: User, attributes: ["name"] }],
  });
  const studentIds = students.map((s) => s.id);

  if (studentIds.length === 0) {
    return res.json({
      success: true,
      data: {
        class_average: 0,
        attendance_average: 0,
        at_risk: [],
        subject_averages: [],
        distributions: { "0-35": 0, "36-50": 0, "51-70": 0, "71-90": 0, "91-100": 0 },
      },
    });
  }

  // Fetch all marks for these students
  const marks = await ExamMark.findAll({
    where: { student_id: studentIds, school_id, academic_year_id },
    include: [{ model: Subject, attributes: ["id", "name"] }],
  });

  // Fetch all exams sorted by created_at to determine latest trends
  const exams = await Exam.findAll({
    where: { school_id, class_id, academic_year_id },
    order: [["created_at", "DESC"]],
    attributes: ["id", "name"],
  });

  // Fetch all attendance counts for these students
  const attendanceLogs = await Attendance.findAll({
    where: { student_id: studentIds, school_id, academic_year_id },
    attributes: ["student_id", "status"],
  });

  // Calculate stats per student
  const studentStats = {};
  students.forEach((s) => {
    studentStats[s.id] = {
      id: s.id,
      name: s.user?.name || s.name,
      obtained: 0,
      max: 0,
      total_days: 0,
      present_days: 0,
      exam_marks: {}, // { [examId]: { obtained, max } }
    };
  });

  marks.forEach((m) => {
    if (studentStats[m.student_id]) {
      studentStats[m.student_id].obtained += m.marks_obtained;
      studentStats[m.student_id].max += m.max_marks || 100;
      
      const examId = m.exam_id;
      if (!studentStats[m.student_id].exam_marks[examId]) {
        studentStats[m.student_id].exam_marks[examId] = { obtained: 0, max: 0 };
      }
      studentStats[m.student_id].exam_marks[examId].obtained += m.marks_obtained;
      studentStats[m.student_id].exam_marks[examId].max += m.max_marks || 100;
    }
  });

  attendanceLogs.forEach((log) => {
    if (studentStats[log.student_id]) {
      studentStats[log.student_id].total_days++;
      if (log.status === "present") {
        studentStats[log.student_id].present_days++;
      }
    }
  });

  // Calculate subject averages class-wide
  const subjectBuckets = {};
  marks.forEach((m) => {
    const subjectName = m.subject?.name || `Subject #${m.subject_id}`;
    if (!subjectBuckets[subjectName]) {
      subjectBuckets[subjectName] = { obtained: 0, max: 0 };
    }
    subjectBuckets[subjectName].obtained += m.marks_obtained;
    subjectBuckets[subjectName].max += m.max_marks || 100;
  });

  const subjectAverages = Object.entries(subjectBuckets).map(([subject, stats]) => ({
    subject,
    average: stats.max > 0 ? Math.round((stats.obtained / stats.max) * 100) : 0,
  }));

  // Analyze At-Risk students & distributions
  const atRisk = [];
  const distributions = { "0-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
  let totalClassObtained = 0;
  let totalClassMax = 0;
  let totalPresentDays = 0;
  let totalAttendanceDays = 0;

  Object.values(studentStats).forEach((stats) => {
    totalClassObtained += stats.obtained;
    totalClassMax += stats.max;
    totalPresentDays += stats.present_days;
    totalAttendanceDays += stats.total_days;

    const academicPercentage = stats.max > 0 ? Math.round((stats.obtained / stats.max) * 100) : 0;
    const attendancePercentage = stats.total_days > 0 ? Math.round((stats.present_days / stats.total_days) * 100) : 100;

    // Distribute into buckets
    if (stats.max > 0) {
      if (academicPercentage >= 81) distributions["81-100"]++;
      else if (academicPercentage >= 61) distributions["61-80"]++;
      else if (academicPercentage >= 41) distributions["41-60"]++;
      else distributions["0-40"]++;
    } else {
      distributions["0-40"]++; // no marks entered is default at risk
    }

    // Determine performance drop (>15% drop between last two tests)
    let isGradeDropped = false;
    let dropMargin = 0;
    if (exams.length >= 2) {
      const latestExamId = exams[0].id;
      const prevExamId = exams[1].id;

      const latestStats = stats.exam_marks[latestExamId];
      const prevStats = stats.exam_marks[prevExamId];

      if (latestStats && prevStats && latestStats.max > 0 && prevStats.max > 0) {
        const latestPct = (latestStats.obtained / latestStats.max) * 100;
        const prevPct = (prevStats.obtained / prevStats.max) * 100;
        if (latestPct < prevPct - 15) {
          isGradeDropped = true;
          dropMargin = Math.round(prevPct - latestPct);
        }
      }
    }

    const isAttendanceLow = attendancePercentage < 75;

    if (isAttendanceLow || isGradeDropped || (stats.max > 0 && academicPercentage < 40)) {
      let reason = [];
      if (isAttendanceLow) reason.push(`Low Attendance (${attendancePercentage}%)`);
      if (isGradeDropped) reason.push(`Grade dropped by ${dropMargin}% in latest exam`);
      if (stats.max > 0 && academicPercentage < 40) reason.push(`Low Academic Score (${academicPercentage}%)`);

      atRisk.push({
        id: stats.id,
        name: stats.name,
        academic_percentage: academicPercentage,
        attendance_percentage: attendancePercentage,
        reasons: reason.join(", "),
      });
    }
  });

  const classAverage = totalClassMax > 0 ? Math.round((totalClassObtained / totalClassMax) * 100) : 0;
  const attendanceAverage = totalAttendanceDays > 0 ? Math.round((totalPresentDays / totalAttendanceDays) * 100) : 100;

  res.json({
    success: true,
    data: {
      class_average: classAverage,
      attendance_average: attendanceAverage,
      at_risk: atRisk,
      subject_averages: subjectAverages,
      distributions,
    },
  });
});
