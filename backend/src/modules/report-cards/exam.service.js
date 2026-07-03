import Exam from "./exam.model.js";
import ExamMaster from "./exam-master.model.js";
import ExamSubject from "./exam-subject.model.js";
import Subject from "../subjects/subject.model.js";
import Class from "../classes/classes.model.js";
import AppError from "../../shared/appError.js";
import { getPagination } from "../../shared/utils/pagination.js";
import db from "../../config/db.js";

/* =========================
   CREATE EXAM with subjects
   Body: { class_id, name, subjects?: [{ subject_id, exam_date, syllabus }] }
========================= */
export const createExamService = async ({
  school_id,
  class_id,
  name,
  subjects = [],
}) => {
  const normalizedName = name?.trim();
  if (!normalizedName) throw new AppError("EXAM_NAME_REQUIRED", 400);

  const cls = await Class.findOne({
    where: { id: class_id, school_id },
  });
  if (!cls) throw new AppError("CLASS_NOT_FOUND", 404);

  return db.transaction(async (t) => {
    const [exam, created] = await Exam.findOrCreate({
      where: { school_id, class_id, name: normalizedName },
      defaults: { school_id, class_id, name: normalizedName },
      transaction: t,
    });

    if (!created && subjects.length === 0) {
      throw new AppError("EXAM_EXISTS", 409);
    }

    if (exam.is_locked) throw new AppError("EXAM_LOCKED", 400);
    if (subjects.length > 0) {
      await assertSubjectsBelongToSchool(subjects.map((s) => s.subject_id), school_id, t);

      for (const subject of subjects) {
        await ExamSubject.upsert(
          {
            exam_id: exam.id,
            subject_id: subject.subject_id,
            exam_date: subject.exam_date,
            syllabus: subject.syllabus || null,
          },
          { transaction: t }
        );
      }
    }

    return getExamById(exam.id, t);
  });
};

/* =========================
   ADD / UPDATE SUBJECTS on existing exam
========================= */
export const upsertExamSubjectService = async ({
  exam_id,
  school_id,
  subject_id,
  exam_date,
  syllabus,
}) => {
  const exam = await Exam.findOne({ where: { id: exam_id, school_id } });
  if (!exam) throw new AppError("EXAM_NOT_FOUND", 404);
  if (exam.is_locked) throw new AppError("EXAM_LOCKED", 400);

  await assertSubjectsBelongToSchool([subject_id], school_id);

  const [row] = await ExamSubject.upsert({
    exam_id,
    subject_id,
    exam_date,
    syllabus: syllabus || null,
  });

  return row;
};

/* =========================
   REMOVE SUBJECT from exam
========================= */
export const removeExamSubjectService = async ({
  exam_id,
  subject_id,
  school_id,
}) => {
  const exam = await Exam.findOne({ where: { id: exam_id, school_id } });
  if (!exam) throw new AppError("EXAM_NOT_FOUND", 404);
  if (exam.is_locked) throw new AppError("EXAM_LOCKED", 400);

  await ExamSubject.destroy({ where: { exam_id, subject_id } });
  return true;
};

/* =========================
   LOCK / UNLOCK
========================= */
export const lockExamService = async ({ exam_id, school_id, is_locked }) => {
  const exam = await Exam.findOne({
    where: { id: exam_id, school_id },
  });
  if (!exam) throw new AppError("EXAM_NOT_FOUND", 404);

  exam.is_locked = is_locked;
  await exam.save();

  return exam;
};

/* =========================
   LIST EXAMS BY CLASS
========================= */
export const listExamsByClassService = async ({
  school_id,
  class_id,
  query,
}) => {
  const { limit, offset } = getPagination(query || {});

  return Exam.findAndCountAll({
    where: { school_id, class_id },
    include: [
      { model: ExamMaster, as: "master", attributes: ["id", "name"] },
      {
        model: ExamSubject,
        as: "exam_subjects",
        include: [{ model: Subject, attributes: ["id", "name"] }],
      },
    ],
    order: [
      ["createdAt", "DESC"],
      [{ model: ExamSubject, as: "exam_subjects" }, "exam_date", "ASC"],
    ],
    limit,
    offset,
  });
};

const getExamById = (id, transaction) => {
  return Exam.findByPk(id, {
    include: [
      { model: ExamMaster, as: "master", attributes: ["id", "name"] },
      {
        model: ExamSubject,
        as: "exam_subjects",
        include: [{ model: Subject, attributes: ["id", "name"] }],
      },
    ],
    transaction,
  });
};

const assertSubjectsBelongToSchool = async (subjectIds, school_id, transaction) => {
  const uniqueSubjectIds = [...new Set(subjectIds.map(Number).filter(Boolean))];
  if (uniqueSubjectIds.length === 0) return;

  const count = await Subject.count({
    where: { id: uniqueSubjectIds, school_id },
    transaction,
  });

  if (count !== uniqueSubjectIds.length) {
    throw new AppError("SUBJECT_NOT_FOUND", 404);
  }
};
