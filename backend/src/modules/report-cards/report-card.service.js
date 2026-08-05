import ExamMark from "./exam-mark.model.js";
import GradingScale from "./grading-scale.model.js";
import Exam from "./exam.model.js";
import ExamMaster from "./exam-master.model.js";
import ExamSubject from "./exam-subject.model.js";
import Student from "../students/student.model.js";
import TeacherAssignment from "../teacher-assignments/teacher-assignment.model.js";
import db from "../../config/db.js";
import AppError from "../../shared/appError.js";
import User from "../users/user.model.js";
import Subject from "../subjects/subject.model.js";
import { getCurrentAcademicYearId } from "../academic-years/academic-year.helper.js";

/* =========================
   NO-OP STUBS FOR BACKWARD COMPATIBILITY
   ========================= */
export const createReportCardService = async () => {
  return { success: true };
};

export const saveReportCardMarksService = async ({ report_card_id, marks, remarks, user }) => {
  // Not used in the new flow but kept as stub to avoid router errors
  return true;
};

export const publishReportCardService = async () => {
  return true;
};

export const bulkPublishReportCardsService = async () => {
  return true;
};

/* =========================
   GET ACADEMIC REPORT CARDS FOR TEACHER/ADMIN
   ========================= */
export const getAcademicReportCardsService = async ({ school_id, class_id, exam_id }) => {
  const marks = await ExamMark.findAll({
    where: { school_id, exam_id },
    include: [
      {
        model: Student,
        where: { class_id },
        include: [{ model: User, attributes: ["name"] }],
      },
      {
        model: Subject,
        attributes: ["id", "name"],
      },
    ],
  });

  const studentGroups = {};
  marks.forEach((m) => {
    const stud = m.student || m.Student;
    const studId = m.student_id;
    if (!studentGroups[studId]) {
      studentGroups[studId] = {
        id: `${studId}-${m.exam_id}`,
        student_id: studId,
        exam_id: m.exam_id,
        remarks: m.remarks,
        student: stud,
        report_card_marks: [],
      };
    }
    studentGroups[studId].report_card_marks.push({
      id: m.id,
      subject_id: m.subject_id,
      marks_obtained: m.marks_obtained,
      max_marks: m.max_marks,
      remarks: m.remarks,
      Subject: m.subject || m.Subject,
      subject: m.subject || m.Subject,
    });
  });

  return Object.values(studentGroups);
};

/* =========================
   GET SINGLE EXAM MARKS FOR STUDENT/PARENT VIEW
   ========================= */
export const getReportCardService = async ({ student_id, exam_id, school_id }) => {
  const exam = await Exam.findByPk(exam_id, {
    include: [
      { model: ExamMaster, as: "master", attributes: ["id", "name"] },
      {
        model: ExamSubject,
        as: "exam_subjects",
        include: [{ model: Subject, attributes: ["id", "name"] }],
      },
    ],
  });
  if (!exam) return null;

  const student = await Student.findByPk(student_id, {
    include: [{ model: User, attributes: ["id", "name", "username"] }],
  });

  const marks = await ExamMark.findAll({
    where: { student_id, exam_id, school_id },
    include: [{ model: Subject, attributes: ["id", "name"] }],
  });

  // Extract overall remarks from the marks rows if any exist
  const remarks = marks.find((m) => m.remarks)?.remarks || "";

  return {
    id: exam_id,
    student_id,
    exam_id,
    remarks,
    published_at: exam.createdAt || new Date(), // treat all marks as visible/published
    exam,
    student,
    report_card_marks: marks.map((m) => {
      const sub = m.subject || m.Subject;
      return {
        id: m.id,
        subject_id: m.subject_id,
        marks_obtained: m.marks_obtained,
        max_marks: m.max_marks,
        remarks: m.remarks,
        Subject: sub,
        subject: sub,
      };
    }),
  };
};

/* =========================
   LIST ALL REPORT CARDS FOR STUDENT/PARENT
   ========================= */
export const listReportCardsService = async ({ student_id, school_id }) => {
  const marks = await ExamMark.findAll({
    where: { student_id, school_id },
    include: [
      {
        model: Exam,
        include: [
          { model: ExamMaster, as: "master", attributes: ["id", "name"] },
          {
            model: ExamSubject,
            as: "exam_subjects",
            include: [{ model: Subject, attributes: ["id", "name"] }],
          },
        ],
      },
      {
        model: Subject,
        attributes: ["id", "name"],
      },
    ],
  });

  // Group marks by exam_id
  const examGroups = {};
  marks.forEach((m) => {
    const examId = m.exam_id;
    if (!examGroups[examId]) {
      examGroups[examId] = {
        id: examId,
        student_id,
        exam_id: examId,
        remarks: m.remarks,
        published_at: m.exam?.createdAt || new Date(),
        exam: m.exam || m.Exam,
        report_card_marks: [],
      };
    }
    examGroups[examId].report_card_marks.push({
      id: m.id,
      subject_id: m.subject_id,
      marks_obtained: m.marks_obtained,
      max_marks: m.max_marks,
      remarks: m.remarks,
      Subject: m.subject || m.Subject,
      subject: m.subject || m.Subject,
    });
  });

  const rows = Object.values(examGroups);
  return { count: rows.length, rows };
};

/* =========================
   BULK SAVE MARKS (WITH SUBJECT TEACHER VERIFICATION)
   ========================= */
export const bulkSaveReportCardMarksService = async ({
  class_id,
  section_id,
  exam_id,
  report_cards,
  school_id,
  user,
}) => {
  const exam = await Exam.findOne({
    where: { id: exam_id, school_id, class_id },
  });
  if (!exam) throw new AppError("EXAM_NOT_FOUND", 404);

  const academicYearId = await getCurrentAcademicYearId(school_id);

  return db.transaction(async (t) => {
    for (const rcData of report_cards) {
      const { student_id, marks = [], remarks } = rcData;

      // Verify student is active in this class-section
      const student = await Student.findOne({
        where: { id: student_id, school_id, class_id, section_id },
        transaction: t,
      });
      if (!student) continue;

      for (const m of marks) {
        const subjectId = Number(m.subject_id);

        // Permissions check for teachers: must have an active assignment for this class/section/subject
        if (user.role === "teacher") {
          const assignment = await TeacherAssignment.findOne({
            where: {
              teacher_id: user.teacher_id,
              section_id,
              subject_id: subjectId,
              school_id,
              is_active: true,
            },
            transaction: t,
          });
          if (!assignment) {
            throw new AppError(
              `FORBIDDEN: You are not assigned to teach subject ${subjectId} in this section`,
              403
            );
          }
        }

        // Upsert the specific mark record
        await ExamMark.upsert(
          {
            school_id,
            academic_year_id: academicYearId,
            exam_id,
            subject_id: subjectId,
            student_id,
            marks_obtained: Number(m.marks_obtained),
            max_marks: Number(m.max_marks || 100),
            remarks: remarks || null,
            entered_by: user.id,
          },
          { transaction: t }
        );
      }
    }
    return true;
  });
};

/* =========================
   GRADING SCALES CONFIGURATION SERVICES
   ========================= */
export const getGradingScalesService = async ({ school_id }) => {
  return GradingScale.findAll({
    where: { school_id },
    order: [["min_percentage", "DESC"]],
  });
};

export const saveGradingScalesService = async ({ school_id, scales }) => {
  return db.transaction(async (t) => {
    // Delete old scales for this school
    await GradingScale.destroy({
      where: { school_id },
      transaction: t,
    });

    // Insert new scales
    const insertData = scales.map((scale) => ({
      school_id,
      grade_name: scale.grade_name.trim(),
      min_percentage: Number(scale.min_percentage),
      is_pass: scale.is_pass !== false,
      color_code: scale.color_code || "#10b981",
    }));

    await GradingScale.bulkCreate(insertData, { transaction: t });
    return true;
  });
};
