import asyncHandler from "../../shared/asyncHandler.js";
import {
  generateTeacherAiService,
  saveTeacherAiDocumentService,
  updateTeacherAiDocumentService,
  listTeacherAiDocumentsService,
  getTeacherAiDocumentService,
  deleteTeacherAiDocumentService,
} from "./teacher-ai.service.js";

// Generate Content (Question Paper, Lesson Plan, Lesson Summary, Quiz Homework)
export const generateTeacherAiContent = asyncHandler(async (req, res) => {
  const result = await generateTeacherAiService({
    user: req.user,
    ...req.body,
  });
  res.json(result);
});

// Save Draft Document
export const saveTeacherAiDocument = asyncHandler(async (req, res) => {
  const doc = await saveTeacherAiDocumentService({
    user: req.user,
    ...req.body,
  });
  res.status(201).json(doc);
});

// Update Saved Draft Document
export const updateTeacherAiDocument = asyncHandler(async (req, res) => {
  const doc = await updateTeacherAiDocumentService(req.params.id, req.user.id, req.body);
  res.json(doc);
});

// List Saved Documents
export const listTeacherAiDocuments = asyncHandler(async (req, res) => {
  const docs = await listTeacherAiDocumentsService(req.user.id, req.query);
  res.json({ documents: docs });
});

// Get Single Saved Document
export const getTeacherAiDocument = asyncHandler(async (req, res) => {
  const doc = await getTeacherAiDocumentService(req.params.id, req.user.id);
  res.json(doc);
});

// Delete Saved Document
export const deleteTeacherAiDocument = asyncHandler(async (req, res) => {
  const result = await deleteTeacherAiDocumentService(req.params.id, req.user.id);
  res.json(result);
});
