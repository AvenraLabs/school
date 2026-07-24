import asyncHandler from "../../shared/asyncHandler.js";
import {
  getLibrarySettingsService,
  updateLibrarySettingsService,
  listBooksService,
  addBookService,
  editBookService,
  archiveBookService,
  unarchiveBookService,
  issueBookService,
  returnBookService,
  cancelIssueService,
  undoReturnService,
  listIssueHistoryService,
  getStudentIssuesService,
  getTeacherIssuesService,
  getStudentIssueSummaryService,
  reportBooksService,
  reportIssuedService,
  reportOverdueService,
  reportLostService,
} from "./library.service.js";

/* Settings */
export const getLibrarySettings = asyncHandler(async (req, res) => {
  const settings = await getLibrarySettingsService(req.user.school_id);
  res.json(settings);
});

export const updateLibrarySettings = asyncHandler(async (req, res) => {
  const settings = await updateLibrarySettingsService(req.user.school_id, req.body);
  res.json(settings);
});

/* Books */
export const listBooks = asyncHandler(async (req, res) => {
  const data = await listBooksService(req.user.school_id, req.query);
  res.json(data);
});

export const addBook = asyncHandler(async (req, res) => {
  const book = await addBookService(req.user.school_id, req.user.id, req.body);
  res.status(201).json(book);
});

export const editBook = asyncHandler(async (req, res) => {
  const book = await editBookService(req.params.id, req.user.school_id, req.body);
  res.json(book);
});

export const archiveBook = asyncHandler(async (req, res) => {
  const result = await archiveBookService(req.params.id, req.user.school_id);
  res.json(result);
});

export const unarchiveBook = asyncHandler(async (req, res) => {
  const result = await unarchiveBookService(req.params.id, req.user.school_id);
  res.json(result);
});

/* Issues */
export const issueBook = asyncHandler(async (req, res) => {
  const issue = await issueBookService(req.user.school_id, req.user.id, req.body);
  res.status(201).json(issue);
});

export const returnBook = asyncHandler(async (req, res) => {
  const issue = await returnBookService(
    req.params.id,
    req.user.school_id,
    req.user.id,
    req.body
  );
  res.json(issue);
});

export const cancelIssue = asyncHandler(async (req, res) => {
  const result = await cancelIssueService(req.params.id, req.user.school_id, req.body);
  res.json(result);
});

export const undoReturn = asyncHandler(async (req, res) => {
  const result = await undoReturnService(req.params.id, req.user.school_id, req.body);
  res.json(result);
});

/* History */
export const listIssueHistory = asyncHandler(async (req, res) => {
  const data = await listIssueHistoryService(req.user.school_id, req.query);
  res.json(data);
});

/* PWA (Student or Teacher) */
export const getMyLibrary = asyncHandler(async (req, res) => {
  if (req.user.role === "teacher") {
    const Teacher = (await import("../teachers/teacher.model.js")).default;
    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id, school_id: req.user.school_id },
    });
    if (!teacher) return res.json({ active: [], history: [] });

    const data = await getTeacherIssuesService(req.user.school_id, teacher.id);
    return res.json(data);
  }

  // Student or parent
  const Student = (await import("../students/student.model.js")).default;
  const student = await Student.findOne({
    where: { user_id: req.user.id, school_id: req.user.school_id },
  });
  if (!student) return res.json({ active: [], history: [] });

  const data = await getStudentIssuesService(req.user.school_id, student.id, req.query);
  res.json(data);
});

/* Student profile summary (admin) */
export const getStudentLibrarySummary = asyncHandler(async (req, res) => {
  const data = await getStudentIssueSummaryService(req.user.school_id, req.params.studentId);
  res.json(data);
});

/* Reports */
export const reportBooks = asyncHandler(async (req, res) => {
  const data = await reportBooksService(req.user.school_id, req.query);
  res.json(data);
});

export const reportIssued = asyncHandler(async (req, res) => {
  const data = await reportIssuedService(req.user.school_id, req.query);
  res.json(data);
});

export const reportOverdue = asyncHandler(async (req, res) => {
  const data = await reportOverdueService(req.user.school_id, req.query);
  res.json(data);
});

export const reportLost = asyncHandler(async (req, res) => {
  const data = await reportLostService(req.user.school_id, req.query);
  res.json(data);
});
