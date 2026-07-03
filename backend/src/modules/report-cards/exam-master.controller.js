import asyncHandler from "../../shared/asyncHandler.js";
import {
  listExamMastersService,
  createExamMasterService,
  deleteExamMasterService,
} from "./exam-master.service.js";
import AppError from "../../shared/appError.js";

export const listExamMasters = asyncHandler(async (req, res) => {
  const items = await listExamMastersService({ school_id: req.user.school_id });
  res.json({ items });
});

export const createExamMaster = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) throw new AppError("Name is required", 400);

  const item = await createExamMasterService({
    school_id: req.user.school_id,
    name,
  });
  res.status(201).json(item);
});

export const deleteExamMaster = asyncHandler(async (req, res) => {
  const item = await deleteExamMasterService({
    id: req.params.id,
    school_id: req.user.school_id,
  });
  res.json({ message: "Exam master deleted successfully" });
});
