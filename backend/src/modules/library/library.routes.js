import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { requireModuleEnabled } from "../../shared/middlewares/requireModule.js";
import { validate } from "../../shared/middlewares/validate.js";

import {
  addBookSchema,
  editBookSchema,
  issueBookSchema,
  returnBookSchema,
  cancelIssueSchema,
  undoReturnSchema,
  updateLibrarySettingsSchema,
} from "./library.schema.js";

import {
  getLibrarySettings,
  updateLibrarySettings,
  listBooks,
  addBook,
  editBook,
  archiveBook,
  unarchiveBook,
  issueBook,
  returnBook,
  cancelIssue,
  undoReturn,
  listIssueHistory,
  getMyLibrary,
  getStudentLibrarySummary,
  reportBooks,
  reportIssued,
  reportOverdue,
  reportLost,
} from "./library.controller.js";

const router = express.Router();

router.use(protect);
router.use(requireModuleEnabled("library"));

/* ── Student / Teacher PWA route ── */
router.get("/my-library", allowRoles("student", "parent", "teacher"), getMyLibrary);

/* ── Admin routes only below ── */
router.use(allowRoles("school_admin", "super_admin"));

/* Settings */
router.get("/settings", getLibrarySettings);
router.patch("/settings", validate(updateLibrarySettingsSchema), updateLibrarySettings);

/* Books */
router.get("/books", listBooks);
router.post("/books", validate(addBookSchema), addBook);
router.patch("/books/:id", validate(editBookSchema), editBook);
router.patch("/books/:id/archive", archiveBook);
router.patch("/books/:id/unarchive", unarchiveBook);

/* Issues */
router.post("/issues", validate(issueBookSchema), issueBook);
router.patch("/issues/:id/return", validate(returnBookSchema), returnBook);
router.patch("/issues/:id/cancel", validate(cancelIssueSchema), cancelIssue);
router.patch("/issues/:id/undo-return", validate(undoReturnSchema), undoReturn);

/* History */
router.get("/issues", listIssueHistory);

/* Student profile summary */
router.get("/students/:studentId/summary", getStudentLibrarySummary);

/* Reports */
router.get("/reports/books", reportBooks);
router.get("/reports/issued", reportIssued);
router.get("/reports/overdue", reportOverdue);
router.get("/reports/lost", reportLost);

export default router;
