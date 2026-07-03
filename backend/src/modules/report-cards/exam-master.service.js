import ExamMaster from "./exam-master.model.js";
import Exam from "./exam.model.js";
import AppError from "../../shared/appError.js";

export const listExamMastersService = async ({ school_id }) => {
  return ExamMaster.findAll({
    where: { school_id },
    order: [["createdAt", "DESC"]],
  });
};

export const createExamMasterService = async ({ school_id, name }) => {
  const existing = await ExamMaster.findOne({
    where: { school_id, name },
  });
  if (existing) throw new AppError("Exam master with this name already exists", 409);

  return ExamMaster.create({ school_id, name });
};

export const deleteExamMasterService = async ({ id, school_id }) => {
  const master = await ExamMaster.findOne({ where: { id, school_id } });
  if (!master) throw new AppError("Exam master not found", 404);

  const usageCount = await Exam.count({
    where: { school_id, exam_master_id: id },
  });
  if (usageCount > 0) {
    throw new AppError("Exam master is already used by exams", 400);
  }

  await master.destroy();
  return master;
};
