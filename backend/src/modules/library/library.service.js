import { Op } from "sequelize";
import db from "../../config/db.js";
import Book from "./book.model.js";
import BookIssue from "./book-issue.model.js";
import Student from "../students/student.model.js";
import Teacher from "../teachers/teacher.model.js";
import User from "../users/user.model.js";

import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import School from "../schools/school.model.js";
import FeeCategory from "../fees/fee-category.model.js";
import AppError from "../../shared/appError.js";
import { getPagination } from "../../shared/utils/pagination.js";

/* ============================================================================
   HELPERS
   ============================================================================ */

/** Add days to today's date, return YYYY-MM-DD */
const addDays = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

/** Today's date as YYYY-MM-DD */
const todayStr = () => new Date().toISOString().split("T")[0];

/** Count currently issued (not cancelled/returned/lost) copies of a book */
const countActiveIssues = async (bookId, transaction = null) => {
  return BookIssue.count({
    where: { book_id: bookId, status: "issued" },
    ...(transaction ? { transaction } : {}),
  });
};

/* ============================================================================
   LIBRARY SETTINGS
   ============================================================================ */

export const getLibrarySettingsService = async (school_id) => {
  const school = await School.findByPk(school_id, {
    attributes: [
      "library_loan_period_days",
      "library_overdue_whatsapp_enabled",
      "library_overdue_reminder_days",
      "library_overdue_fine_per_day",
    ],
  });
  if (!school) throw new AppError("School not found", 404);
  return school;
};


export const updateLibrarySettingsService = async (school_id, payload) => {
  const school = await School.findByPk(school_id);
  if (!school) throw new AppError("School not found", 404);
  await school.update(payload);
  return await getLibrarySettingsService(school_id);
};

/* ============================================================================
   BOOKS
   ============================================================================ */

export const listBooksService = async (school_id, query = {}) => {
  const { limit, offset } = getPagination(query);
  const where = { school_id };

  if (query.search) {
    where[Op.or] = [
      { book_name: { [Op.iLike]: `%${query.search}%` } },
      { book_no: { [Op.iLike]: `%${query.search}%` } },
    ];
  }
  if (query.status) {
    where.status = query.status;
  } else {
    // By default only show active books
    where.status = "active";
  }

  const { count, rows } = await Book.findAndCountAll({
    where,
    include: [
      { model: User, as: "Creator", attributes: ["name"], required: false },
    ],
    order: [["book_no", "ASC"]],
    limit,
    offset,
  });

  return { total: count, books: rows };
};

export const addBookService = async (school_id, created_by, { book_no, book_name, total_copies, image_url }) => {
  const existing = await Book.findOne({ where: { school_id, book_no } });
  if (existing) {
    throw new AppError(`Book number '${book_no}' already exists`, 400);
  }

  const book = await Book.create({
    school_id,
    book_no,
    book_name,
    total_copies,
    available_copies: total_copies,
    image_url: image_url || null,
    status: "active",
    created_by,
  });

  return book;
};


export const editBookService = async (bookId, school_id, { book_name, total_copies, image_url }) => {
  const t = await db.transaction();
  try {
    const book = await Book.findOne({
      where: { id: bookId, school_id },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
    if (!book) throw new AppError("Book not found", 404);
    if (book.status === "archived") throw new AppError("Cannot edit an archived book", 400);

    const updates = {};
    if (book_name !== undefined) updates.book_name = book_name;
    if (image_url !== undefined) updates.image_url = image_url;


    if (total_copies !== undefined) {
      // Recalculate available: new_available = new_total - currently_issued
      const currentlyIssued = await countActiveIssues(bookId, t);
      const newAvailable = total_copies - currentlyIssued;
      if (newAvailable < 0) {
        throw new AppError(
          `Cannot reduce total copies to ${total_copies} — ${currentlyIssued} copies are currently issued`,
          400
        );
      }
      updates.total_copies = total_copies;
      updates.available_copies = newAvailable;
    }

    await book.update(updates, { transaction: t });
    await t.commit();
    return book;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

export const archiveBookService = async (bookId, school_id) => {
  const book = await Book.findOne({ where: { id: bookId, school_id } });
  if (!book) throw new AppError("Book not found", 404);

  const activeIssues = await countActiveIssues(bookId);
  if (activeIssues > 0) {
    throw new AppError(
      `Cannot archive — ${activeIssues} copies are currently issued`,
      400
    );
  }

  await book.update({ status: "archived" });
  return { success: true, message: "Book archived successfully" };
};

export const unarchiveBookService = async (bookId, school_id) => {
  const book = await Book.findOne({ where: { id: bookId, school_id } });
  if (!book) throw new AppError("Book not found", 404);

  await book.update({ status: "active" });
  return { success: true, message: "Book restored to active catalog successfully" };
};

/* ============================================================================
   ISSUE BOOK
   ============================================================================ */

export const issueBookService = async (
  school_id,
  issued_by,
  { borrower_type = "student", student_id, teacher_id, book_id, due_date }
) => {
  const t = await db.transaction();
  try {
    // 1. Validate book
    const book = await Book.findOne({
      where: { id: book_id, school_id, status: "active" },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
    if (!book) throw new AppError("Book not found", 404);

    if (book.available_copies <= 0) {
      throw new AppError("No copies available for this book", 400);
    }

    // 2. Validate borrower
    let targetStudentId = null;
    let targetTeacherId = null;

    if (borrower_type === "teacher") {
      if (!teacher_id) throw new AppError("Teacher ID is required", 400);
      const teacher = await Teacher.findOne({ where: { id: teacher_id, school_id }, transaction: t });
      if (!teacher) throw new AppError("Teacher not found", 404);
      targetTeacherId = teacher.id;

      const alreadyIssued = await BookIssue.findOne({
        where: { school_id, teacher_id: targetTeacherId, book_id, status: "issued" },
        transaction: t,
      });
      if (alreadyIssued) throw new AppError("Teacher already has this book issued", 400);
    } else {
      if (!student_id) throw new AppError("Student ID is required", 400);
      const student = await Student.findOne({ where: { id: student_id, school_id }, transaction: t });
      if (!student) throw new AppError("Student not found", 404);
      targetStudentId = student.id;

      const alreadyIssued = await BookIssue.findOne({
        where: { school_id, student_id: targetStudentId, book_id, status: "issued" },
        transaction: t,
      });
      if (alreadyIssued) throw new AppError("Student already has this book issued", 400);
    }

    // 3. Create issue
    const issue = await BookIssue.create(
      {
        school_id,
        book_id,
        borrower_type,
        student_id: targetStudentId,
        teacher_id: targetTeacherId,
        issue_date: todayStr(),
        due_date,
        status: "issued",
        issued_by,
      },
      { transaction: t }
    );

    await book.decrement("available_copies", { by: 1, transaction: t });

    await t.commit();
    return issue;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};


/* ============================================================================
   RETURN BOOK
   ============================================================================ */

export const returnBookService = async (issueId, school_id, returned_by, { status, fine_amount, remarks }) => {
  const t = await db.transaction();
  try {
    const issue = await BookIssue.findOne({
      where: { id: issueId, school_id, status: "issued" },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
    if (!issue) throw new AppError("Active issue not found", 404);

    const book = await Book.findOne({
      where: { id: issue.book_id, school_id },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
    if (!book) throw new AppError("Book not found", 404);

    const updates = {
      status,
      returned_date: todayStr(),
      returned_by,
      remarks: remarks || null,
      fine_amount: fine_amount || null,
    };

    await issue.update(updates, { transaction: t });

    // Increment available for returned or damaged (damaged book is returned)
    if (status === "returned" || status === "damaged") {
      await book.increment("available_copies", { by: 1, transaction: t });
    }

    await t.commit();
    return issue;
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

/* ============================================================================
   CANCEL ISSUE
   ============================================================================ */

export const cancelIssueService = async (issueId, school_id, { remarks }) => {
  const t = await db.transaction();
  try {
    const issue = await BookIssue.findOne({
      where: { id: issueId, school_id, status: "issued" },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
    if (!issue) throw new AppError("Active issue not found — can only cancel unread issues", 404);

    const book = await Book.findOne({
      where: { id: issue.book_id, school_id },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
    if (!book) throw new AppError("Book not found", 404);

    await issue.update(
      { status: "cancelled", remarks: remarks || null },
      { transaction: t }
    );
    await book.increment("available_copies", { by: 1, transaction: t });

    await t.commit();
    return { success: true, message: "Issue cancelled successfully" };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

/* ============================================================================
   UNDO RETURN (Admin only)
   ============================================================================ */

export const undoReturnService = async (issueId, school_id, { remarks }) => {
  const t = await db.transaction();
  try {
    const issue = await BookIssue.findOne({
      where: { id: issueId, school_id, status: ["returned", "lost"] },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
    if (!issue) throw new AppError("No returned/lost issue found to undo", 404);

    const book = await Book.findOne({
      where: { id: issue.book_id, school_id },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });
    if (!book) throw new AppError("Book not found", 404);

    const wasLost = issue.status === "lost";

    await issue.update(
      {
        status: "issued",
        returned_date: null,
        returned_by: null,
        fine_amount: null,
        remarks: remarks || null,
      },
      { transaction: t }
    );

    // Only decrement available if it was returned (not lost — available was already reduced for lost)
    if (!wasLost) {
      await book.decrement("available_copies", { by: 1, transaction: t });
    }

    await t.commit();
    return { success: true, message: "Return undone successfully" };
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

/* ============================================================================
   HISTORY (Admin)
   ============================================================================ */

export const listIssueHistoryService = async (school_id, query = {}) => {
  const { limit, offset } = getPagination(query);
  const where = { school_id };

  if (query.status && query.status.trim()) {
    where.status = query.status.trim();
  }
  if (query.student_id) where.student_id = Number(query.student_id);
  if (query.teacher_id) where.teacher_id = Number(query.teacher_id);

  if (query.user_id) {
    const uid = Number(query.user_id);
    const student = await Student.findOne({ where: { user_id: uid, school_id }, attributes: ["id"] });
    const teacher = await Teacher.findOne({ where: { user_id: uid, school_id }, attributes: ["id"] });
    const userOr = [];
    if (student) userOr.push({ student_id: student.id });
    if (teacher) userOr.push({ teacher_id: teacher.id });
    if (userOr.length > 0) {
      where[Op.or] = userOr;
    } else {
      return { total: 0, issues: [] };
    }
  }

  if (query.search && query.search.trim()) {
    const s = `%${query.search.trim()}%`;
    const searchCond = [
      { "$Book.book_name$": { [Op.iLike]: s } },
      { "$Book.book_no$": { [Op.iLike]: s } },
      { "$Student.user.name$": { [Op.iLike]: s } },
      { "$Student.user.username$": { [Op.iLike]: s } },
      { "$Teacher.user.name$": { [Op.iLike]: s } },
      { "$Teacher.user.username$": { [Op.iLike]: s } },
    ];
    if (where[Op.or]) {
      where[Op.and] = [{ [Op.or]: where[Op.or] }, { [Op.or]: searchCond }];
      delete where[Op.or];
    } else {
      where[Op.or] = searchCond;
    }
  }

  if (query.from_date && query.to_date) {
    where.issue_date = { [Op.between]: [query.from_date, query.to_date] };
  }

  const { count, rows } = await BookIssue.findAndCountAll({
    where,
    include: [
      {
        model: Student,
        as: "Student",
        include: [{ model: User, attributes: ["id", "name", "username"] }],
        attributes: ["id", "roll_no", "admission_no"],
        required: false,
      },
      {
        model: Teacher,
        as: "Teacher",
        include: [{ model: User, attributes: ["id", "name", "username", "phone"] }],
        attributes: ["id", "employee_id"],
        required: false,
      },
      { model: Book, as: "Book", attributes: ["id", "book_no", "book_name", "image_url"] },
      { model: User, as: "IssuedBy", attributes: ["name"], required: false },
      { model: User, as: "ReturnedBy", attributes: ["name"], required: false },
    ],
    order: [["created_at", "DESC"]],
    limit,
    offset,
    subQuery: false,
  });

  return { total: count, issues: rows };
};

/* ============================================================================
   TEACHER ISSUES (PWA)
   ============================================================================ */

export const getTeacherIssuesService = async (school_id, teacher_id) => {
  const active = await BookIssue.findAll({
    where: { school_id, teacher_id, status: "issued" },
    include: [{ model: Book, as: "Book", attributes: ["id", "book_no", "book_name", "image_url"] }],
    order: [["due_date", "ASC"]],
  });

  const history = await BookIssue.findAll({
    where: {
      school_id,
      teacher_id,
      status: { [Op.in]: ["returned", "lost", "damaged", "cancelled"] },
    },
    include: [{ model: Book, as: "Book", attributes: ["id", "book_no", "book_name", "image_url"] }],
    order: [["updated_at", "DESC"]],
    limit: 50,
  });

  return { active, history };
};


/* ============================================================================
   STUDENT ISSUES (PWA)
   ============================================================================ */

export const getStudentIssuesService = async (school_id, student_id, query = {}) => {
  const page = Math.max(parseInt(query.history_page || query.page || 1, 10), 1);
  const limit = Math.min(Math.max(parseInt(query.history_limit || query.limit || 10, 10), 1), 50);
  const offset = (page - 1) * limit;

  const active = await BookIssue.findAll({
    where: { school_id, student_id, status: "issued" },
    include: [{ model: Book, as: "Book", attributes: ["id", "book_no", "book_name", "image_url"] }],
    order: [["due_date", "ASC"]],
  });

  const { count, rows } = await BookIssue.findAndCountAll({
    where: {
      school_id,
      student_id,
      status: { [Op.in]: ["returned", "lost", "cancelled"] },
    },
    include: [{ model: Book, as: "Book", attributes: ["id", "book_no", "book_name", "image_url"] }],
    order: [["updated_at", "DESC"]],
    limit,
    offset,
  });

  return {
    active,
    history: rows,
    historyTotal: count,
    historyPage: page,
    hasMoreHistory: offset + rows.length < count,
  };
};

/** For student profile widget — counts only */
export const getStudentIssueSummaryService = async (school_id, student_id) => {
  const today = todayStr();

  const issued = await BookIssue.count({ where: { school_id, student_id, status: "issued" } });
  const overdue = await BookIssue.count({
    where: {
      school_id,
      student_id,
      status: "issued",
      due_date: { [Op.lt]: today },
    },
  });
  const historyCount = await BookIssue.count({
    where: { school_id, student_id, status: { [Op.in]: ["returned", "lost"] } },
  });

  return { issued, overdue, history: historyCount };
};

/* ============================================================================
   REPORTS
   ============================================================================ */

export const reportBooksService = async (school_id, query = {}) => {
  const { limit, offset } = getPagination(query);
  const where = { school_id };
  if (query.status) where.status = query.status;

  const { count, rows } = await Book.findAndCountAll({
    where,
    order: [["book_no", "ASC"]],
    limit,
    offset,
  });

  return { total: count, books: rows };
};

export const reportIssuedService = async (school_id, query = {}) => {
  const { limit, offset } = getPagination(query);
  const where = { school_id };
  if (query.status) where.status = query.status;
  if (query.student_id) where.student_id = query.student_id;

  const { count, rows } = await BookIssue.findAndCountAll({
    where,
    include: [
      {
        model: Student,
        as: "Student",
        include: [
          { model: User, attributes: ["name", "phone"] },
          { model: Class, attributes: ["class_name"] },
          { model: Section, attributes: ["name"] },
        ],
        attributes: ["id", "admission_no", "roll_no"],

      },
      { model: Book, as: "Book", attributes: ["id", "book_no", "book_name"] },
    ],
    order: [["issue_date", "DESC"]],
    limit,
    offset,
  });

  return { total: count, issues: rows };
};

export const reportOverdueService = async (school_id, query = {}) => {
  const { limit, offset } = getPagination(query);
  const today = todayStr();

  const { count, rows } = await BookIssue.findAndCountAll({
    where: {
      school_id,
      status: "issued",
      due_date: { [Op.lt]: today },
    },
    include: [
      {
        model: Student,
        as: "Student",
        include: [
          { model: User, attributes: ["name", "phone"] },
          { model: Class, attributes: ["class_name"] },
          { model: Section, attributes: ["name"] },
        ],
        attributes: ["id", "admission_no", "roll_no"],

      },
      { model: Book, as: "Book", attributes: ["id", "book_no", "book_name"] },
    ],
    order: [["due_date", "ASC"]],
    limit,
    offset,
  });

  return { total: count, issues: rows };
};

export const reportLostService = async (school_id, query = {}) => {
  const { limit, offset } = getPagination(query);

  const { count, rows } = await BookIssue.findAndCountAll({
    where: { school_id, status: "lost" },
    include: [
      {
        model: Student,
        as: "Student",
        include: [
          { model: User, attributes: ["name", "phone"] },
          { model: Class, attributes: ["class_name"] },
        ],
        attributes: ["id", "admission_no", "roll_no"],
      },

      { model: Book, as: "Book", attributes: ["id", "book_no", "book_name"] },
    ],
    order: [["updated_at", "DESC"]],
    limit,
    offset,
  });

  return { total: count, issues: rows };
};

/* ============================================================================
   OVERDUE REMINDERS (called by cron)
   ============================================================================ */

export const sendOverdueRemindersService = async () => {
  const { sendTextMessage } = await import("../whatsapp/whatsapp.service.js");
  const today = todayStr();

  // Find all schools with WhatsApp overdue reminders enabled
  const schools = await School.findAll({
    where: { library_overdue_whatsapp_enabled: true },
    attributes: ["id", "school_name", "library_overdue_reminder_days"],
  });

  let totalSent = 0;

  for (const school of schools) {
    const reminderDays = school.library_overdue_reminder_days ?? 1;

    // Calculate target due date: today + reminderDays
    const targetDate = addDays(reminderDays);

    // Issues due on the target date OR already overdue
    const issues = await BookIssue.findAll({
      where: {
        school_id: school.id,
        status: "issued",
        due_date: { [Op.lte]: targetDate },
      },
      include: [
        {
          model: Student,
          as: "Student",
          include: [{ model: User, attributes: ["name", "phone"] }],
          attributes: ["id"],
        },
        { model: Book, as: "Book", attributes: ["book_name", "book_no"] },
      ],
    });

    for (const issue of issues) {
      const phone = issue.Student?.user?.phone;
      const studentName = issue.Student?.user?.name || "Student";
      const bookName = issue.Book?.book_name || "the book";
      const dueDate = issue.due_date;

      if (!phone) continue;

      const isOverdue = dueDate < today;
      const message = isOverdue
        ? `Dear ${studentName}, the library book "${bookName}" (Due: ${dueDate}) is overdue. Please return it at the earliest. — ${school.school_name}`
        : `Dear ${studentName}, reminder: the library book "${bookName}" is due on ${dueDate}. Please return it on time. — ${school.school_name}`;

      await sendTextMessage(phone, message, school.id);
      totalSent++;
    }
  }

  return { totalSent };
};

/* ============================================================================
   TC CHECK — check pending books before student delete/TC
   ============================================================================ */

export const checkStudentPendingBooksService = async (student_id, school_id) => {
  const pending = await BookIssue.count({
    where: { school_id, student_id, status: "issued" },
  });
  return { hasPending: pending > 0, count: pending };
};
