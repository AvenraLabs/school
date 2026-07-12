import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import ExamMark from "../report-cards/exam-mark.model.js";
import Exam from "../report-cards/exam.model.js";
import ExamSubject from "../report-cards/exam-subject.model.js";
import Subject from "../subjects/subject.model.js";
import Student from "../students/student.model.js";
import User from "../users/user.model.js";
import Attendance from "../attendance/attendance.model.js";
import Section from "../sections/section.model.js";
import Class from "../classes/classes.model.js";
import { getCurrentAcademicYearId } from "../academic-years/academic-year.helper.js";
import { Op } from "sequelize";

/**
 * Build ranking data for a set of student IDs.
 * Returns sorted array of { student_id, name, percentage, rank }.
 */
async function buildRanking(studentIds, school_id, academic_year_id) {
  if (studentIds.length === 0) return [];

  const students = await Student.findAll({
    where: { id: studentIds, school_id },
    include: [{ model: User, attributes: ["name"] }],
    attributes: ["id", "user_id"],
  });
  const nameMap = new Map(
    students.map((s) => [Number(s.id), s.user?.name || "Unknown"])
  );

  const allMarks = await ExamMark.findAll({
    where: { student_id: studentIds, school_id, academic_year_id },
    attributes: ["student_id", "marks_obtained", "max_marks"],
  });

  const percentages = studentIds.map((sid) => {
    const sMarks = allMarks.filter(
      (m) => Number(m.student_id) === Number(sid)
    );
    const obtained = sMarks.reduce((sum, m) => sum + m.marks_obtained, 0);
    const max = sMarks.reduce((sum, m) => sum + (m.max_marks || 100), 0);
    return {
      student_id: sid,
      name: nameMap.get(Number(sid)) || "Unknown",
      percentage: max > 0 ? Math.round((obtained / max) * 100) : 0,
    };
  });

  percentages.sort((a, b) => b.percentage - a.percentage);
  percentages.forEach((p, i) => {
    p.rank = i + 1;
  });

  return percentages;
}

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

  // scope=section (default) or scope=class
  const scope = req.query.scope === "class" ? "class" : "section";

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
    totalAttendance > 0
      ? Math.round((presentAttendance / totalAttendance) * 100)
      : 100;

  // 3. Compute overall academic average
  const totalObtained = marks.reduce((sum, m) => sum + m.marks_obtained, 0);
  const totalMax = marks.reduce((sum, m) => sum + (m.max_marks || 100), 0);
  const academicPercentage =
    totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

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

  // 5. Improvement indicator (compare last two exams)
  let improvement = null;
  if (examTrends.length >= 2) {
    const latest = examTrends[examTrends.length - 1];
    const previous = examTrends[examTrends.length - 2];
    improvement = {
      current: latest.percentage,
      previous: previous.percentage,
      change: latest.percentage - previous.percentage,
      current_exam: latest.name,
      previous_exam: previous.name,
    };
  }

  // 6. Per-subject improvement (latest vs previous exam per subject)
  const subjectByExam = {};
  marks.forEach((m) => {
    const subjectName = m.subject?.name || `Subject #${m.subject_id}`;
    const examId = m.exam_id;
    if (!subjectByExam[subjectName]) {
      subjectByExam[subjectName] = {};
    }
    if (!subjectByExam[subjectName][examId]) {
      subjectByExam[subjectName][examId] = { obtained: 0, max: 0, date: m.exam?.created_at || m.created_at };
    }
    subjectByExam[subjectName][examId].obtained += m.marks_obtained;
    subjectByExam[subjectName][examId].max += m.max_marks || 100;
  });

  const perSubjectImprovement = {};
  Object.entries(subjectByExam).forEach(([subject, examsMap]) => {
    const sorted = Object.entries(examsMap)
      .map(([examId, stats]) => ({
        examId,
        percentage: stats.max > 0 ? Math.round((stats.obtained / stats.max) * 100) : 0,
        date: stats.date,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (sorted.length >= 2) {
      const latest = sorted[sorted.length - 1];
      const prev = sorted[sorted.length - 2];
      perSubjectImprovement[subject] = latest.percentage - prev.percentage;
    }
  });

  // 7. Calculate Subject Radar Metrics
  const subjectBuckets = {};
  marks.forEach((m) => {
    const subjectName = m.subject?.name || `Subject #${m.subject_id}`;
    if (!subjectBuckets[subjectName]) {
      subjectBuckets[subjectName] = { obtained: 0, max: 0 };
    }
    subjectBuckets[subjectName].obtained += m.marks_obtained;
    subjectBuckets[subjectName].max += m.max_marks || 100;
  });

  const subjectAverages = Object.entries(subjectBuckets).map(
    ([subject, stats]) => ({
      subject,
      score: stats.max > 0 ? Math.round((stats.obtained / stats.max) * 100) : 0,
      change: perSubjectImprovement[subject] ?? null,
    })
  );

  const sortedSubjects = [...subjectAverages].sort((a, b) => b.score - a.score);
  const strongSubject = sortedSubjects[0] || null;
  const focusSubject =
    sortedSubjects.length > 1
      ? sortedSubjects[sortedSubjects.length - 1]
      : null;

  // 8. Build ranking (section or class-wide based on scope)
  const rankFilter = { school_id, status: "ACTIVE" };
  if (scope === "section") {
    rankFilter.class_id = student.class_id;
    if (student.section_id) {
      rankFilter.section_id = student.section_id;
    }
  } else {
    rankFilter.class_id = student.class_id;
  }

  const peers = await Student.findAll({
    where: rankFilter,
    attributes: ["id"],
  });
  const peerIds = peers.map((p) => p.id);

  const ranking = await buildRanking(peerIds, school_id, academic_year_id);
  const myEntry = ranking.find(
    (r) => Number(r.student_id) === Number(student_id)
  );
  const myRank = myEntry?.rank || 0;
  const totalStudents = ranking.length;

  // Top 5 leaderboard
  const leaderboard = ranking.slice(0, 5).map((r) => ({
    rank: r.rank,
    name: r.name,
    percentage: r.percentage,
    is_me: Number(r.student_id) === Number(student_id),
  }));

  // If student not in top 5, append their entry
  if (myRank > 5 && myEntry) {
    leaderboard.push({
      rank: myEntry.rank,
      name: myEntry.name,
      percentage: myEntry.percentage,
      is_me: true,
    });
  }

  res.json({
    success: true,
    data: {
      student: {
        id: student.id,
        name: student.user?.name || student.name,
        roll_no: student.roll_no,
      },
      academic_percentage: academicPercentage,
      attendance_percentage: attendancePercentage,
      rank: myRank,
      total_students: totalStudents,
      scope,
      improvement,
      trends: examTrends,
      radar: subjectAverages,
      strong_subject: strongSubject,
      focus_subject: focusSubject,
      leaderboard,
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
        top_performers: [],
        subject_averages: [],
        distributions: { "0-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 },
        pass_count: 0,
        fail_count: 0,
        total_students: 0,
        hardest_subject: null,
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
      exam_marks: {},
    };
  });

  marks.forEach((m) => {
    if (studentStats[m.student_id]) {
      studentStats[m.student_id].obtained += m.marks_obtained;
      studentStats[m.student_id].max += m.max_marks || 100;

      const examId = m.exam_id;
      if (!studentStats[m.student_id].exam_marks[examId]) {
        studentStats[m.student_id].exam_marks[examId] = {
          obtained: 0,
          max: 0,
        };
      }
      studentStats[m.student_id].exam_marks[examId].obtained +=
        m.marks_obtained;
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

  const subjectAverages = Object.entries(subjectBuckets)
    .map(([subject, stats]) => ({
      subject,
      average: stats.max > 0 ? Math.round((stats.obtained / stats.max) * 100) : 0,
    }))
    .sort((a, b) => a.average - b.average);

  const hardestSubject = subjectAverages.length > 0 ? subjectAverages[0] : null;

  // Analyze students - rankings, at-risk, distributions
  const atRisk = [];
  const distributions = { "0-40": 0, "41-60": 0, "61-80": 0, "81-100": 0 };
  let totalClassObtained = 0;
  let totalClassMax = 0;
  let totalPresentDays = 0;
  let totalAttendanceDays = 0;
  let passCount = 0;
  let failCount = 0;

  const studentPerformance = [];

  Object.values(studentStats).forEach((stats) => {
    totalClassObtained += stats.obtained;
    totalClassMax += stats.max;
    totalPresentDays += stats.present_days;
    totalAttendanceDays += stats.total_days;

    const academicPercentage =
      stats.max > 0 ? Math.round((stats.obtained / stats.max) * 100) : 0;
    const attendancePercentage =
      stats.total_days > 0
        ? Math.round((stats.present_days / stats.total_days) * 100)
        : 100;

    // Track for top performers
    studentPerformance.push({
      id: stats.id,
      name: stats.name,
      percentage: academicPercentage,
      attendance: attendancePercentage,
    });

    // Pass/fail (40% cutoff)
    if (stats.max > 0) {
      if (academicPercentage >= 40) passCount++;
      else failCount++;
    }

    // Distribute into buckets
    if (stats.max > 0) {
      if (academicPercentage >= 81) distributions["81-100"]++;
      else if (academicPercentage >= 61) distributions["61-80"]++;
      else if (academicPercentage >= 41) distributions["41-60"]++;
      else distributions["0-40"]++;
    } else {
      distributions["0-40"]++;
    }

    // Determine performance drop (>15% drop between last two tests)
    let isGradeDropped = false;
    let dropMargin = 0;
    if (exams.length >= 2) {
      const latestExamId = exams[0].id;
      const prevExamId = exams[1].id;

      const latestStats = stats.exam_marks[latestExamId];
      const prevStats = stats.exam_marks[prevExamId];

      if (
        latestStats &&
        prevStats &&
        latestStats.max > 0 &&
        prevStats.max > 0
      ) {
        const latestPct = (latestStats.obtained / latestStats.max) * 100;
        const prevPct = (prevStats.obtained / prevStats.max) * 100;
        if (latestPct < prevPct - 15) {
          isGradeDropped = true;
          dropMargin = Math.round(prevPct - latestPct);
        }
      }
    }

    const isAttendanceLow = attendancePercentage < 75;

    if (
      isAttendanceLow ||
      isGradeDropped ||
      (stats.max > 0 && academicPercentage < 40)
    ) {
      const reason = [];
      if (isAttendanceLow)
        reason.push(`Low Attendance (${attendancePercentage}%)`);
      if (isGradeDropped)
        reason.push(`Grade dropped by ${dropMargin}% in latest exam`);
      if (stats.max > 0 && academicPercentage < 40)
        reason.push(`Low Academic Score (${academicPercentage}%)`);

      atRisk.push({
        id: stats.id,
        name: stats.name,
        academic_percentage: academicPercentage,
        attendance_percentage: attendancePercentage,
        reasons: reason.join(", "),
      });
    }
  });

  // Sort for top performers
  studentPerformance.sort((a, b) => b.percentage - a.percentage);
  const topPerformers = studentPerformance.slice(0, 5).map((s, i) => ({
    rank: i + 1,
    ...s,
  }));

  const classAverage =
    totalClassMax > 0
      ? Math.round((totalClassObtained / totalClassMax) * 100)
      : 0;
  const attendanceAverage =
    totalAttendanceDays > 0
      ? Math.round((totalPresentDays / totalAttendanceDays) * 100)
      : 100;

  res.json({
    success: true,
    data: {
      class_average: classAverage,
      attendance_average: attendanceAverage,
      total_students: studentIds.length,
      pass_count: passCount,
      fail_count: failCount,
      at_risk: atRisk,
      top_performers: topPerformers,
      subject_averages: subjectAverages,
      hardest_subject: hardestSubject,
      distributions,
    },
  });
});

/* =========================
   SCHOOL-WIDE ANALYTICS (Admin)
   ========================= */
export const getSchoolAnalytics = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const academic_year_id = await getCurrentAcademicYearId(school_id);

  // 1. Get all active classes and sections
  const classes = await Class.findAll({
    where: { school_id, is_active: true },
    attributes: ["id", "class_name"],
    order: [["class_name", "ASC"]],
  });

  const sections = await Section.findAll({
    where: { school_id, is_active: true },
    attributes: ["id", "class_id", "name"],
  });

  // 2. Get all active students
  const students = await Student.findAll({
    where: { school_id, status: "ACTIVE" },
    attributes: ["id", "class_id", "section_id"],
  });
  const studentIds = students.map((s) => s.id);

  if (studentIds.length === 0) {
    return res.json({
      success: true,
      data: {
        section_comparison: [],
        subject_difficulty: [],
        school_pass_fail: { pass: 0, fail: 0, total: 0 },
        at_risk_by_class: [],
      },
    });
  }

  // 3. Get all marks
  const allMarks = await ExamMark.findAll({
    where: { student_id: studentIds, school_id, academic_year_id },
    attributes: ["student_id", "subject_id", "marks_obtained", "max_marks"],
    include: [{ model: Subject, attributes: ["id", "name"] }],
  });

  // 4. Get all attendance
  const allAttendance = await Attendance.findAll({
    where: { student_id: studentIds, school_id, academic_year_id },
    attributes: ["student_id", "status"],
  });

  // Build student-to-section map
  const studentSectionMap = new Map();
  const studentClassMap = new Map();
  students.forEach((s) => {
    studentSectionMap.set(Number(s.id), Number(s.section_id));
    studentClassMap.set(Number(s.id), Number(s.class_id));
  });

  // Build class name map
  const classNameMap = new Map(
    classes.map((c) => [Number(c.id), c.class_name])
  );

  // Build section name map: section_id -> "ClassName - SectionName"
  const sectionLabelMap = new Map();
  sections.forEach((s) => {
    const className = classNameMap.get(Number(s.class_id)) || `Class #${s.class_id}`;
    sectionLabelMap.set(Number(s.id), `${className} - ${s.name}`);
  });

  // --- Section Comparison ---
  const sectionBuckets = {};
  allMarks.forEach((m) => {
    const sectionId = studentSectionMap.get(Number(m.student_id));
    if (!sectionId) return;
    if (!sectionBuckets[sectionId]) {
      sectionBuckets[sectionId] = { obtained: 0, max: 0 };
    }
    sectionBuckets[sectionId].obtained += m.marks_obtained;
    sectionBuckets[sectionId].max += m.max_marks || 100;
  });

  const sectionComparison = Object.entries(sectionBuckets)
    .map(([sectionId, stats]) => ({
      section_id: Number(sectionId),
      label: sectionLabelMap.get(Number(sectionId)) || `Section #${sectionId}`,
      average: stats.max > 0 ? Math.round((stats.obtained / stats.max) * 100) : 0,
    }))
    .sort((a, b) => b.average - a.average);

  // --- Subject Difficulty ---
  const subjectBuckets = {};
  allMarks.forEach((m) => {
    const subjectName = m.subject?.name || `Subject #${m.subject_id}`;
    if (!subjectBuckets[subjectName]) {
      subjectBuckets[subjectName] = { obtained: 0, max: 0 };
    }
    subjectBuckets[subjectName].obtained += m.marks_obtained;
    subjectBuckets[subjectName].max += m.max_marks || 100;
  });

  const subjectDifficulty = Object.entries(subjectBuckets)
    .map(([subject, stats]) => ({
      subject,
      average: stats.max > 0 ? Math.round((stats.obtained / stats.max) * 100) : 0,
    }))
    .sort((a, b) => a.average - b.average);

  // --- School-wide Pass/Fail ---
  const studentTotals = {};
  allMarks.forEach((m) => {
    const sid = Number(m.student_id);
    if (!studentTotals[sid]) {
      studentTotals[sid] = { obtained: 0, max: 0 };
    }
    studentTotals[sid].obtained += m.marks_obtained;
    studentTotals[sid].max += m.max_marks || 100;
  });

  let schoolPass = 0;
  let schoolFail = 0;
  Object.values(studentTotals).forEach((t) => {
    const pct = t.max > 0 ? Math.round((t.obtained / t.max) * 100) : 0;
    if (pct >= 40) schoolPass++;
    else schoolFail++;
  });

  // --- At-Risk by Class ---
  // Count attendance-low or marks-low students per class
  const attendanceBySid = {};
  allAttendance.forEach((a) => {
    const sid = Number(a.student_id);
    if (!attendanceBySid[sid]) {
      attendanceBySid[sid] = { total: 0, present: 0 };
    }
    attendanceBySid[sid].total++;
    if (a.status === "present") attendanceBySid[sid].present++;
  });

  const atRiskByClassBuckets = {};
  students.forEach((s) => {
    const sid = Number(s.id);
    const classId = Number(s.class_id);
    const className = classNameMap.get(classId) || `Class #${classId}`;

    if (!atRiskByClassBuckets[classId]) {
      atRiskByClassBuckets[classId] = { class_name: className, count: 0, total: 0 };
    }
    atRiskByClassBuckets[classId].total++;

    const marks = studentTotals[sid];
    const att = attendanceBySid[sid];
    const marksPct = marks && marks.max > 0 ? (marks.obtained / marks.max) * 100 : null;
    const attPct = att && att.total > 0 ? (att.present / att.total) * 100 : null;

    if ((marksPct !== null && marksPct < 40) || (attPct !== null && attPct < 75)) {
      atRiskByClassBuckets[classId].count++;
    }
  });

  const atRiskByClass = Object.values(atRiskByClassBuckets)
    .filter((c) => c.total > 0)
    .sort((a, b) => b.count - a.count);

  res.json({
    success: true,
    data: {
      section_comparison: sectionComparison,
      subject_difficulty: subjectDifficulty,
      school_pass_fail: {
        pass: schoolPass,
        fail: schoolFail,
        total: schoolPass + schoolFail,
      },
      at_risk_by_class: atRiskByClass,
    },
  });
});
