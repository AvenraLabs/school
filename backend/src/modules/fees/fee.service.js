import db from "../../config/db.js";
import FeeCategory from "./fee-category.model.js";
import ClassFeePlan from "./class-fee-plan.model.js";
import ClassFeeSchedule from "./class-fee-schedule.model.js";
import StudentFeeLedger from "./student-fee-ledger.model.js";
import StudentTermLedger from "./student-term-ledger.model.js";
import FeePayment from "./fee-payment.model.js";
import AcademicYear from "../academic-years/academic-year.model.js";
import Student from "../students/student.model.js";
import Class from "../classes/classes.model.js";
import Section from "../sections/section.model.js";
import User from "../users/user.model.js";
import School from "../schools/school.model.js";
import AppError from "../../shared/appError.js";
import { getPagination } from "../../shared/utils/pagination.js";
import { Op } from "sequelize";

/* ============================================================================
   HELPERS
   ============================================================================ */

/** Get active academic year for a school */
const getCurrentAcademicYear = async (school_id, transaction = null) => {
  const currentYear = await AcademicYear.findOne({
    where: { school_id, is_current: true },
    transaction,
  });
  if (!currentYear) {
    throw new AppError("Current active academic year not configured for school", 400);
  }
  return currentYear;
};

/** Format receipt number with Year Prefix e.g. 2026-000001 */
const formatReceiptNo = (num, yearName = "") => {
  const yearPrefix = yearName ? String(yearName).substring(0, 4) : new Date().getFullYear();
  return `${yearPrefix}-${String(num).padStart(6, "0")}`;
};

/** Calculate ledger total after scholarship % and fixed discount */
const calculateNetTotal = (grossTotal, scholarshipPercent = 0, discountAmount = 0, termTuitionTotal = null) => {
  const gross = Number(grossTotal) || 0;
  const pct = Number(scholarshipPercent) || 0;
  const disc = Number(discountAmount) || 0;

  const discountableAmount = termTuitionTotal !== null && termTuitionTotal !== undefined ? Number(termTuitionTotal) : gross;
  const scholarshipDiscount = discountableAmount * (pct / 100);

  const afterScholarship = gross - scholarshipDiscount;
  const net = Math.max(0, afterScholarship - disc);
  return Number(net.toFixed(2));
};

/* ============================================================================
   FEE CATEGORIES
   ============================================================================ */

export const createFeeCategoryService = async (school_id, { name }) => {
  const exists = await FeeCategory.findOne({ where: { school_id, name } });
  if (exists) {
    if (exists.is_archived) {
      await exists.update({ is_archived: false, is_active: true });
      return exists;
    }
    throw new AppError(`Category '${name}' already exists`, 400);
  }
  return await FeeCategory.create({ school_id, name, is_active: true, is_archived: false });
};

export const listFeeCategoriesService = async (school_id) => {
  return await FeeCategory.findAll({
    where: { school_id, is_archived: false },
    order: [["name", "ASC"]],
  });
};

export const updateFeeCategoryService = async (id, school_id, payload) => {
  const category = await FeeCategory.findOne({ where: { id, school_id } });
  if (!category) throw new AppError("Fee category not found", 404);

  if (payload.name && payload.name !== category.name) {
    const exists = await FeeCategory.findOne({ where: { school_id, name: payload.name } });
    if (exists && exists.id !== Number(id)) throw new AppError(`Category '${payload.name}' already exists`, 400);
  }

  await category.update(payload);
  return category;
};

export const deleteFeeCategoryService = async (id, school_id) => {
  const category = await FeeCategory.findOne({ where: { id, school_id } });
  if (!category) throw new AppError("Fee category not found", 404);

  // Check if category is used in class fee plans
  const inUse = await ClassFeePlan.findOne({ where: { school_id, fee_category_id: id } });
  if (inUse) {
    // Archive instead of hard delete to preserve historical integrity
    await category.update({ is_archived: true, is_active: false });
    return { message: "Category archived because it is assigned in a Class Fee Plan" };
  }

  await category.destroy();
  return { message: "Fee category deleted successfully" };
};

/* ============================================================================
   CLASS FEE PLANS & SCHEDULES (TERM BREAKDOWN)
   ============================================================================ */

export const upsertClassFeePlansAndSchedulesService = async (school_id, class_id, { categories: items = [], schedules = [] }) => {
  return db.transaction(async (t) => {
    const currentYear = await getCurrentAcademicYear(school_id, t);

    // Verify class exists
    const cls = await Class.findOne({ where: { id: class_id, school_id }, transaction: t });
    if (!cls) throw new AppError("Class not found", 404);

    // 1. Save/update category plans
    // Delete existing class plans & schedules for this class in this academic year
    await ClassFeePlan.destroy({
      where: { school_id, academic_year_id: currentYear.id, class_id: Number(class_id) },
      transaction: t,
    });

    await ClassFeeSchedule.destroy({
      where: { school_id, academic_year_id: currentYear.id, class_id: Number(class_id) },
      transaction: t,
    });

    // 1. Save category plans
    for (const item of items) {
      if (!item.fee_category_id) continue;
      const category = await FeeCategory.findOne({
        where: { id: item.fee_category_id, school_id },
        transaction: t,
      });
      if (!category) continue;

      await ClassFeePlan.create(
        {
          school_id,
          academic_year_id: currentYear.id,
          class_id: Number(class_id),
          fee_category_id: Number(item.fee_category_id),
          amount: Number(item.amount) || 0,
          is_active: true,
        },
        { transaction: t }
      );
    }

    // 2. Save term schedules
    let order = 1;
    for (const sched of schedules) {
      if (!sched.term_name || !sched.term_name.trim()) continue;
      await ClassFeeSchedule.create(
        {
          school_id,
          academic_year_id: currentYear.id,
          class_id: Number(class_id),
          term_name: sched.term_name.trim(),
          due_date: sched.due_date || null,
          amount: Number(sched.amount) || 0,
          display_order: order++,
        },
        { transaction: t }
      );
    }

    // 3. Re-sync unpaid student ledgers for this class so updated fee plans take effect immediately
    const studentsInClass = await Student.findAll({
      where: { school_id, class_id: Number(class_id), status: "ACTIVE" },
      transaction: t,
    });

    const newGrossTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const newSchedules = await ClassFeeSchedule.findAll({
      where: { school_id, academic_year_id: currentYear.id, class_id: Number(class_id) },
      order: [["display_order", "ASC"]],
      transaction: t,
    });

    for (const st of studentsInClass) {
      const ledger = await StudentFeeLedger.findOne({
        where: { school_id, academic_year_id: currentYear.id, student_id: st.id },
        transaction: t,
      });

      // Only update if student has 0 payments recorded yet (protecting paid records)
      if (ledger && Number(ledger.paid) === 0) {
        const netTotal = calculateNetTotal(newGrossTotal, ledger.scholarship_percent, ledger.discount_amount);
        await ledger.update({ total: netTotal, balance: netTotal }, { transaction: t });

        await StudentTermLedger.destroy({
          where: { school_id, academic_year_id: currentYear.id, student_id: st.id, paid: 0 },
          transaction: t,
        });

        for (const sched of newSchedules) {
          await StudentTermLedger.create(
            {
              school_id,
              academic_year_id: currentYear.id,
              student_id: st.id,
              schedule_id: sched.id,
              term_name: sched.term_name,
              due_date: sched.due_date,
              total: Number(sched.amount),
              paid: 0,
              balance: Number(sched.amount),
              status: "pending",
            },
            { transaction: t }
          );
        }
      }
    }

    return { success: true, message: "Class fee plan and term schedules saved successfully" };
  });
};

export const getClassFeePlansAndSchedulesService = async (school_id, class_id) => {
  const currentYear = await getCurrentAcademicYear(school_id);
  const plans = await ClassFeePlan.findAll({
    where: { school_id, academic_year_id: currentYear.id, class_id },
    include: [{ model: FeeCategory, attributes: ["id", "name", "is_active"] }],
    order: [[FeeCategory, "name", "ASC"]],
  });

  const schedules = await ClassFeeSchedule.findAll({
    where: { school_id, academic_year_id: currentYear.id, class_id },
    order: [["display_order", "ASC"], ["due_date", "ASC"]],
  });

  const grossCategoryTotal = plans.reduce((acc, p) => acc + Number(p.amount), 0);
  const grossScheduleTotal = schedules.reduce((acc, s) => acc + Number(s.amount), 0);

  return {
    plans,
    schedules,
    gross_category_total: grossCategoryTotal,
    gross_schedule_total: grossScheduleTotal,
  };
};

export const listAllClassFeePlansSummaryService = async (school_id) => {
  const currentYear = await getCurrentAcademicYear(school_id);

  const classes = await Class.findAll({
    where: { school_id, is_active: true },
    order: [["class_name", "ASC"]],
  });

  const plans = await ClassFeePlan.findAll({
    where: { school_id, academic_year_id: currentYear.id },
    include: [{ model: FeeCategory, attributes: ["id", "name"] }],
  });

  const schedules = await ClassFeeSchedule.findAll({
    where: { school_id, academic_year_id: currentYear.id },
    order: [["display_order", "ASC"]],
  });

  const classMap = {};
  for (const c of classes) {
    classMap[c.id] = {
      class_id: c.id,
      class_name: c.class_name,
      categories_count: 0,
      schedules_count: 0,
      total_amount: 0,
      plans: [],
      schedules: [],
    };
  }

  for (const p of plans) {
    if (classMap[p.class_id]) {
      classMap[p.class_id].categories_count++;
      classMap[p.class_id].total_amount += Number(p.amount);
      classMap[p.class_id].plans.push({
        category_id: p.fee_category_id,
        category_name: p.fee_category?.name,
        amount: Number(p.amount),
      });
    }
  }

  for (const s of schedules) {
    if (classMap[s.class_id]) {
      classMap[s.class_id].schedules_count++;
      classMap[s.class_id].schedules.push({
        id: s.id,
        term_name: s.term_name,
        due_date: s.due_date,
        amount: Number(s.amount),
      });
    }
  }

  return Object.values(classMap);
};

/* ============================================================================
   STUDENT FEE LEDGERS & TERM BREAKDOWNS
   ============================================================================ */

export const generateStudentLedgerService = async (
  school_id,
  student_id,
  { fee_mode = "full", custom_total = null, scholarship_percent = 0, discount_amount = 0 } = {},
  externalTransaction = null
) => {
  const execute = async (t) => {
    const currentYear = await getCurrentAcademicYear(school_id, t);

    const student = await Student.findOne({ where: { id: student_id, school_id }, transaction: t });
    if (!student) throw new AppError("Student not found", 404);

    let ledger = await StudentFeeLedger.findOne({
      where: { school_id, academic_year_id: currentYear.id, student_id },
      transaction: t,
    });

    // Calculate gross total
    let grossTotal = 0;
    if (fee_mode === "custom" && custom_total !== null && custom_total !== undefined) {
      grossTotal = Number(custom_total);
    } else {
      const plans = await ClassFeePlan.findAll({
        where: { school_id, academic_year_id: currentYear.id, class_id: student.class_id },
        transaction: t,
      });
      grossTotal = plans.reduce((acc, p) => acc + Number(p.amount), 0);
    }

    const netTotal = calculateNetTotal(grossTotal, scholarship_percent, discount_amount);

    if (!ledger) {
      ledger = await StudentFeeLedger.create(
        {
          school_id,
          academic_year_id: currentYear.id,
          student_id,
          total: netTotal,
          paid: 0,
          balance: netTotal,
          scholarship_percent: Number(scholarship_percent) || 0,
          discount_amount: Number(discount_amount) || 0,
          fee_mode,
          custom_total: custom_total !== null ? Number(custom_total) : null,
          status: "active",
        },
        { transaction: t }
      );
    }

    // Auto-generate term ledgers based on class fee schedules
    const schedules = await ClassFeeSchedule.findAll({
      where: { school_id, academic_year_id: currentYear.id, class_id: student.class_id },
      order: [["display_order", "ASC"]],
      transaction: t,
    });

    if (schedules.length > 0) {
      for (const sched of schedules) {
        const termExists = await StudentTermLedger.findOne({
          where: { school_id, academic_year_id: currentYear.id, student_id, term_name: sched.term_name },
          transaction: t,
        });

        if (!termExists) {
          await StudentTermLedger.create(
            {
              school_id,
              academic_year_id: currentYear.id,
              student_id,
              schedule_id: sched.id,
              term_name: sched.term_name,
              due_date: sched.due_date,
              total: Number(sched.amount),
              paid: 0,
              balance: Number(sched.amount),
              status: "pending",
            },
            { transaction: t }
          );
        }
      }
    }

    return ledger;
  };

  if (externalTransaction) {
    return await execute(externalTransaction);
  } else {
    return await db.transaction(execute);
  }
};

export const bulkGenerateLedgersForClassService = async (school_id, class_id) => {
  return db.transaction(async (t) => {
    const currentYear = await getCurrentAcademicYear(school_id, t);

    const students = await Student.findAll({
      where: { school_id, class_id, status: "ACTIVE", approval_status: "approved" },
      transaction: t,
    });

    let generatedCount = 0;
    for (const student of students) {
      await generateStudentLedgerService(school_id, student.id, {}, t);
      generatedCount++;
    }

    return { total_students: students.length, ledgers_generated: generatedCount };
  });
};

export const getStudentLedgerService = async (school_id, student_id) => {
  const currentYear = await getCurrentAcademicYear(school_id);

  const student = await Student.findOne({
    where: { id: student_id, school_id },
    include: [
      { model: User, attributes: ["name", "username", "phone"] },
      { model: Class, attributes: ["id", "class_name"] },
      { model: Section, attributes: ["id", "name"] },
    ],
  });

  if (!student) throw new AppError("Student not found", 404);

  let ledger = await StudentFeeLedger.findOne({
    where: { school_id, academic_year_id: currentYear.id, student_id },
  });

  // Auto-generate if missing
  if (!ledger) {
    ledger = await generateStudentLedgerService(school_id, student_id);
  }

  // Fetch term ledgers
  let termLedgers = await StudentTermLedger.findAll({
    where: { school_id, academic_year_id: currentYear.id, student_id },
    order: [["due_date", "ASC"], ["created_at", "ASC"]],
  });

  // Auto-sync term ledgers from ClassFeeSchedule if missing or out of sync
  const activeSchedules = await ClassFeeSchedule.findAll({
    where: { school_id, academic_year_id: currentYear.id, class_id: student.class_id },
    order: [["display_order", "ASC"]],
  });

  const activeTermNames = activeSchedules.map((s) => s.term_name).sort().join("|");
  const existingTermNames = termLedgers.map((t) => t.term_name).sort().join("|");

  if (activeSchedules.length > 0 && (termLedgers.length === 0 || activeTermNames !== existingTermNames)) {
    // Re-sync unpaid term ledgers to match latest active schedule terms
    await StudentTermLedger.destroy({
      where: { school_id, academic_year_id: currentYear.id, student_id, paid: 0 },
    });

    for (const sched of activeSchedules) {
      const alreadyPaidTerm = termLedgers.find((t) => t.term_name === sched.term_name && Number(t.paid) > 0);
      if (!alreadyPaidTerm) {
        await StudentTermLedger.create({
          school_id,
          academic_year_id: currentYear.id,
          student_id,
          schedule_id: sched.id,
          term_name: sched.term_name,
          due_date: sched.due_date,
          total: Number(sched.amount),
          paid: 0,
          balance: Number(sched.amount),
          status: "pending",
        });
      }
    }

    termLedgers = await StudentTermLedger.findAll({
      where: { school_id, academic_year_id: currentYear.id, student_id },
      order: [["due_date", "ASC"], ["created_at", "ASC"]],
    });
  }

  // Fetch breakdown of category plans
  const plans = await ClassFeePlan.findAll({
    where: { school_id, academic_year_id: currentYear.id, class_id: student.class_id },
    include: [{ model: FeeCategory, attributes: ["id", "name"] }],
  });

  // Calculate active term balances
  const activeTermsNet = termLedgers.reduce((acc, t) => acc + (t.status === "waived" ? 0 : Number(t.total)), 0);
  const activeTermsBalance = termLedgers.reduce((acc, t) => acc + (t.status === "waived" ? 0 : Number(t.balance)), 0);

  const actualPaidSoFar = (await FeePayment.findAll({
    where: { school_id, student_id, ledger_id: ledger.id, is_void: false },
    attributes: ["amount"],
  })).reduce((acc, p) => acc + Number(p.amount), 0);

  if (Number(ledger.total) !== activeTermsNet || Number(ledger.balance) !== activeTermsBalance || Number(ledger.paid) !== actualPaidSoFar) {
    await ledger.update({
      total: activeTermsNet,
      paid: actualPaidSoFar,
      balance: activeTermsBalance,
    });
  }

  // Auto-check for approaching due date reminders (within 5 days or today)
  try {
    const today = new Date();
    for (const term of termLedgers) {
      if (term.status !== "paid" && term.status !== "waived" && term.due_date) {
        const dueDate = new Date(term.due_date);
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        if (diffDays <= 5) {
          const { triggerFeeDueReminderNotification } = await import("../notifications/notification-trigger.service.js");
          await triggerFeeDueReminderNotification({
            school_id,
            term_name: term.term_name,
            amount: term.balance,
            due_date: term.due_date,
            days_left: diffDays,
            class_id: student.class_id,
            section_id: student.section_id,
          });
        }
      }
    }
  } catch {
    // quiet
  }

  // Fetch payment history
  const allPayments = await FeePayment.findAll({
    where: { school_id, student_id, ledger_id: ledger.id },
    order: [["paid_at", "DESC"]],
    include: [{ model: User, as: "VoidedBy", attributes: ["name"] }],
  });

  return {
    student: {
      id: student.id,
      name: student.user?.name,
      username: student.user?.username,
      phone: student.user?.phone,
      admission_no: student.admission_no,
      roll_no: student.roll_no,
      father_name: student.father_name,
      emergency_contact: student.emergency_contact,
      class_id: student.class_id,
      class_name: student.class?.class_name,
      section_name: student.section?.name,
    },
    ledger: {
      id: ledger.id,
      total: Number(ledger.total),
      paid: Number(ledger.paid),
      balance: Number(ledger.balance),
      scholarship_percent: Number(ledger.scholarship_percent),
      discount_amount: Number(ledger.discount_amount),
      fee_mode: ledger.fee_mode,
      status: ledger.status,
    },
    terms: termLedgers.map((t) => ({
      id: t.id,
      term_name: t.term_name,
      due_date: t.due_date,
      total: Number(t.total),
      paid: Number(t.paid),
      balance: Number(t.balance),
      status: t.status,
    })),
    plan_breakdown: plans.map((p) => ({
      category_name: p.fee_category?.name,
      amount: Number(p.amount),
    })),
    payments: allPayments.map((p) => ({
      id: p.id,
      receipt_no: p.receipt_no,
      amount: Number(p.amount),
      late_fee_amount: Number(p.late_fee_amount || 0),
      mode: p.mode,
      reference: p.reference,
      paid_by: p.paid_by,
      remarks: p.remarks,
      paid_at: p.paid_at,
      is_void: p.is_void,
      voided_at: p.voided_at,
      void_reason: p.void_reason,
    })),
  };
};

export const getMyFeeLedgerService = async (school_id, user_id, role) => {
  let student_id = null;
  if (role === "student") {
    const st = await Student.findOne({ where: { user_id, school_id } });
    if (!st) throw new AppError("Student profile not found for user", 404);
    student_id = st.id;
  } else if (role === "parent") {
    const parentUser = await User.findByPk(user_id);
    const st = await Student.findOne({
      where: { school_id, [Op.or]: [{ emergency_contact: parentUser.phone }, { phone: parentUser.phone }] },
    });
    if (!st) throw new AppError("No associated student profile found for parent", 404);
    student_id = st.id;
  } else {
    throw new AppError("Unauthorized role for my-ledger", 403);
  }

  return await getStudentLedgerService(school_id, student_id);
};

export const updateLedgerAdjustmentsService = async (
  ledger_id,
  school_id,
  { waived_term_ids = [], term_discounts = {} }
) => {
  return db.transaction(async (t) => {
    const ledger = await StudentFeeLedger.findOne({
      where: { id: ledger_id, school_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!ledger) throw new AppError("Student fee ledger not found", 404);

    // 1. Handle term waivers (e.g. Mid-Year Joiner)
    if (Array.isArray(waived_term_ids)) {
      for (const termId of waived_term_ids) {
        const term = await StudentTermLedger.findOne({
          where: { id: termId, school_id, student_id: ledger.student_id },
          transaction: t,
        });
        if (term && Number(term.paid) === 0) {
          await term.update({ total: 0, balance: 0, status: "waived" }, { transaction: t });
        }
      }
    }

    // 2. Handle flat discounts per fee plan term
    if (term_discounts && typeof term_discounts === "object") {
      for (const [termId, discVal] of Object.entries(term_discounts)) {
        const disc = Math.max(0, Number(discVal) || 0);
        const term = await StudentTermLedger.findOne({
          where: { id: termId, school_id, student_id: ledger.student_id },
          transaction: t,
        });
        if (term && term.status !== "paid" && term.status !== "waived") {
          const sched = term.schedule_id ? await ClassFeeSchedule.findByPk(term.schedule_id, { transaction: t }) : null;
          const origTotal = sched ? Number(sched.amount) : Number(term.total);
          const newTermTotal = Math.max(0, origTotal - disc);
          const newTermBalance = Math.max(0, newTermTotal - Number(term.paid));
          const newStatus = newTermBalance === 0 ? (Number(term.paid) > 0 ? "paid" : "waived") : (Number(term.paid) > 0 ? "partial" : "pending");
          await term.update({ total: newTermTotal, balance: newTermBalance, status: newStatus }, { transaction: t });
        }
      }
    }

    // Recalculate total net ledger
    const activeTerms = await StudentTermLedger.findAll({
      where: { school_id, academic_year_id: ledger.academic_year_id, student_id: ledger.student_id, status: { [Op.ne]: "waived" } },
      transaction: t,
    });

    const netTotal = activeTerms.reduce((sum, term) => sum + Number(term.total), 0);
    const actualPaidSoFar = (await FeePayment.findAll({
      where: { school_id, student_id: ledger.student_id, ledger_id: ledger.id, is_void: false },
      attributes: ["amount"],
      transaction: t,
    })).reduce((acc, p) => acc + Number(p.amount), 0);

    const newBalance = Math.max(0, netTotal - actualPaidSoFar);

    await ledger.update(
      {
        total: netTotal,
        paid: actualPaidSoFar,
        balance: newBalance,
      },
      { transaction: t }
    );

    return {
      success: true,
      message: "Scholarship & fee plan concessions saved successfully",
      ledger: {
        total: Number(ledger.total),
        paid: Number(ledger.paid),
        balance: Number(ledger.balance),
      },
    };
  });
};


/* ============================================================================
   PAYMENTS (WITH AUTO-TERM ALLOCATION & LATE FEE)
   ============================================================================ */

export const recordPaymentService = async (
  school_id,
  { student_id, amount, term_ledger_id = null, late_fee_amount = 0, mode = "cash", reference = null, paid_by = null, remarks = null }
) => {
  return db.transaction(async (t) => {
    const currentYear = await getCurrentAcademicYear(school_id, t);

    let ledger = await StudentFeeLedger.findOne({
      where: { school_id, academic_year_id: currentYear.id, student_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!ledger) {
      ledger = await generateStudentLedgerService(school_id, student_id, {}, t);
    }

    if (ledger.status === "frozen") {
      throw new AppError("Student fee ledger is frozen. Cannot accept payment.", 400);
    }

    const payAmount = Number(amount);
    const lateFee = Number(late_fee_amount) || 0;
    if (isNaN(payAmount) || payAmount <= 0) {
      throw new AppError("Payment amount must be greater than 0", 400);
    }

    // Determine target term ledger for allocation (auto-allocate to oldest unpaid term if null)
    let targetTerm = null;
    if (term_ledger_id) {
      targetTerm = await StudentTermLedger.findOne({
        where: { id: term_ledger_id, school_id, student_id },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
    } else {
      // Oldest unpaid term
      targetTerm = await StudentTermLedger.findOne({
        where: { school_id, academic_year_id: currentYear.id, student_id, status: { [Op.ne]: "paid" } },
        order: [["due_date", "ASC"], ["created_at", "ASC"]],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
    }

    // Increment receipt counter atomically & ensure receipt_no is unique
    const school = await School.findByPk(school_id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!school) throw new AppError("School not found", 404);

    let nextCounter = (school.fee_receipt_counter || 0) + 1;
    let receiptNo = formatReceiptNo(nextCounter, currentYear.name);

    // Ensure receiptNo does not conflict with existing records in fee_payments
    let exists = await FeePayment.findOne({
      where: { school_id, receipt_no: receiptNo },
      transaction: t,
    });

    while (exists) {
      nextCounter++;
      receiptNo = formatReceiptNo(nextCounter, currentYear.name);
      exists = await FeePayment.findOne({
        where: { school_id, receipt_no: receiptNo },
        transaction: t,
      });
    }

    await school.update({ fee_receipt_counter: nextCounter }, { transaction: t });

    // Create payment record
    const payment = await FeePayment.create(
      {
        school_id,
        student_id,
        ledger_id: ledger.id,
        term_ledger_id: targetTerm ? targetTerm.id : null,
        amount: payAmount,
        late_fee_amount: lateFee,
        mode,
        reference: reference || null,
        receipt_no: receiptNo,
        paid_by: paid_by || null,
        remarks: remarks || null,
        paid_at: new Date(),
        is_void: false,
      },
      { transaction: t }
    );

    // Update overall ledger paid and balance
    const newPaid = Number(ledger.paid) + payAmount;
    const newBalance = Math.max(0, Number(ledger.total) - newPaid);

    await ledger.update({ paid: newPaid, balance: newBalance }, { transaction: t });

    // Update specific term ledger if applicable
    if (targetTerm) {
      const newTermPaid = Number(targetTerm.paid) + payAmount;
      const newTermBalance = Math.max(0, Number(targetTerm.total) - newTermPaid);
      const newTermStatus = newTermBalance === 0 ? "paid" : "partial";

      await targetTerm.update(
        { paid: newTermPaid, balance: newTermBalance, status: newTermStatus },
        { transaction: t }
      );
    }

    // Fetch student info
    const student = await Student.findByPk(student_id, {
      include: [
        { model: User, attributes: ["name", "username", "phone"] },
        { model: Class, attributes: ["class_name"] },
        { model: Section, attributes: ["name"] },
      ],
      transaction: t,
    });

    // Trigger in-app PWA notification for student/parent
    try {
      const { triggerFeePaymentReceivedNotification } = await import("../notifications/notification-trigger.service.js");
      await triggerFeePaymentReceivedNotification({
        school_id,
        admin_user_id: 1,
        amount: payAmount,
        balance: newBalance,
        class_id: student?.class_id,
        section_id: student?.section_id,
      });
    } catch {
      // quiet if notification fails
    }

    return {
      payment: {
        id: payment.id,
        receipt_no: payment.receipt_no,
        amount: Number(payment.amount),
        late_fee_amount: Number(payment.late_fee_amount),
        mode: payment.mode,
        reference: payment.reference,
        paid_by: payment.paid_by,
        remarks: payment.remarks,
        paid_at: payment.paid_at,
        allocated_term: targetTerm ? targetTerm.term_name : "Overall",
      },
      ledger: {
        total: Number(ledger.total),
        paid: newPaid,
        balance: newBalance,
      },
      student: {
        id: student.id,
        name: student.user?.name,
        username: student.user?.username,
        phone: student.user?.phone,
        class_name: student.class?.class_name,
        section_name: student.section?.name,
      },
    };
  });
};

export const voidPaymentService = async (payment_id, school_id, user_id, { void_reason }) => {
  return db.transaction(async (t) => {
    const payment = await FeePayment.findOne({
      where: { id: payment_id, school_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!payment) throw new AppError("Payment record not found", 404);
    if (payment.is_void) throw new AppError("Payment is already voided", 400);

    const ledger = await StudentFeeLedger.findOne({
      where: { id: payment.ledger_id, school_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!ledger) throw new AppError("Associated ledger not found", 404);

    await payment.update(
      {
        is_void: true,
        voided_by: user_id,
        voided_at: new Date(),
        void_reason: void_reason || "Voided by admin",
      },
      { transaction: t }
    );

    // Revert overall ledger
    const newPaid = Math.max(0, Number(ledger.paid) - Number(payment.amount));
    const newBalance = Number(ledger.total) - newPaid;

    await ledger.update({ paid: newPaid, balance: newBalance }, { transaction: t });

    // Revert term ledger if linked
    if (payment.term_ledger_id) {
      const term = await StudentTermLedger.findByPk(payment.term_ledger_id, { transaction: t });
      if (term) {
        const newTermPaid = Math.max(0, Number(term.paid) - Number(payment.amount));
        const newTermBalance = Number(term.total) - newTermPaid;
        const newStatus = newTermPaid === 0 ? "pending" : newTermBalance === 0 ? "paid" : "partial";
        await term.update({ paid: newTermPaid, balance: newTermBalance, status: newStatus }, { transaction: t });
      }
    }

    return {
      success: true,
      message: `Payment ${payment.receipt_no} voided successfully`,
      new_paid: newPaid,
      new_balance: newBalance,
    };
  });
};

export const listSchoolPaymentHistoryService = async (school_id, query = {}) => {
  const { limit, offset } = getPagination(query);
  const { search, class_id, section_id, mode } = query;

  const where = { school_id };
  const studentWhere = {};

  if (class_id) studentWhere.class_id = Number(class_id);
  if (section_id) studentWhere.section_id = Number(section_id);
  if (mode && mode.trim()) where.mode = mode.trim();

  if (search && search.trim()) {
    const s = `%${search.trim()}%`;
    where[Op.or] = [
      { receipt_no: { [Op.iLike]: s } },
      { reference: { [Op.iLike]: s } },
      { "$student.user.name$": { [Op.iLike]: s } },
      { "$student.roll_no$": { [Op.iLike]: s } },
    ];
  }

  const { count, rows } = await FeePayment.findAndCountAll({
    where,
    limit,
    offset,
    order: [["paid_at", "DESC"]],
    include: [
      {
        model: Student,
        where: Object.keys(studentWhere).length > 0 ? studentWhere : undefined,
        attributes: ["id", "admission_no", "roll_no"],
        include: [
          { model: User, attributes: ["name", "phone"] },
          { model: Class, attributes: ["class_name"] },
          { model: Section, attributes: ["name"] },
        ],
      },
      { model: User, as: "VoidedBy", attributes: ["name"] },
    ],
  });

  return {
    total: count,
    payments: rows.map((p) => ({
      id: p.id,
      receipt_no: p.receipt_no,
      amount: Number(p.amount),
      late_fee_amount: Number(p.late_fee_amount || 0),
      mode: p.mode,
      reference: p.reference,
      paid_at: p.paid_at,
      is_void: p.is_void,
      voided_at: p.voided_at,
      void_reason: p.void_reason,
      voided_by_name: p.VoidedBy?.name,
      student_id: p.student_id,
      student_name: p.student?.user?.name,
      student_phone: p.student?.user?.phone,
      roll_no: p.student?.roll_no || p.student?.admission_no,
      class_name: p.student?.class?.class_name,
      section_name: p.student?.section?.name,
    })),
  };
};

/* ============================================================================
   REPORTS & DAILY COLLECTION STATS
   ============================================================================ */

export const getFeeCollectionSummaryService = async (school_id) => {
  const currentYear = await getCurrentAcademicYear(school_id);

  // Overall ledgers
  const ledgers = await StudentFeeLedger.findAll({
    where: { school_id, academic_year_id: currentYear.id },
    include: [
      {
        model: Student,
        attributes: ["id", "class_id"],
        include: [{ model: Class, attributes: ["id", "class_name"] }],
      },
    ],
  });

  let totalFee = 0;
  let totalCollected = 0;
  let totalPending = 0;

  const classSummary = {};

  for (const l of ledgers) {
    const tot = Number(l.total);
    const pd = Number(l.paid);
    const bal = Number(l.balance);

    totalFee += tot;
    totalCollected += pd;
    totalPending += bal;

    const className = l.student?.class?.class_name || "Unassigned";
    if (!classSummary[className]) {
      classSummary[className] = {
        class_name: className,
        student_count: 0,
        total_fee: 0,
        collected: 0,
        pending: 0,
      };
    }

    classSummary[className].student_count++;
    classSummary[className].total_fee += tot;
    classSummary[className].collected += pd;
    classSummary[className].pending += bal;
  }

  // Today's collection stats
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayPayments = await FeePayment.findAll({
    where: {
      school_id,
      is_void: false,
      paid_at: { [Op.gte]: todayStart },
    },
  });

  let todayTotal = 0;
  let todayCount = todayPayments.length;
  const modeBreakdown = { cash: 0, upi: 0, bank_transfer: 0, cheque: 0, online: 0 };

  for (const p of todayPayments) {
    const amt = Number(p.amount);
    todayTotal += amt;
    if (modeBreakdown[p.mode] !== undefined) {
      modeBreakdown[p.mode] += amt;
    }
  }

  return {
    academic_year: currentYear.name,
    overall: {
      total_students_enrolled: ledgers.length,
      total_fee: Number(totalFee.toFixed(2)),
      total_collected: Number(totalCollected.toFixed(2)),
      total_pending: Number(totalPending.toFixed(2)),
      collection_percentage: totalFee > 0 ? Number(((totalCollected / totalFee) * 100).toFixed(1)) : 0,
    },
    today: {
      total_collected: Number(todayTotal.toFixed(2)),
      receipts_count: todayCount,
      by_mode: modeBreakdown,
    },
    classes: Object.values(classSummary).sort((a, b) => a.class_name.localeCompare(b.class_name)),
  };
};

export const getDefaultersListService = async (school_id, query = {}) => {
  const { limit, offset } = getPagination(query);
  const currentYear = await getCurrentAcademicYear(school_id);

  const minBal = Number(query.min_balance) || 0;

  const where = {
    school_id,
    academic_year_id: currentYear.id,
    status: "active",
    balance: { [Op.gt]: minBal },
  };

  const studentWhere = {};
  if (query.class_id) studentWhere.class_id = Number(query.class_id);

  const { count, rows } = await StudentFeeLedger.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: Student,
        where: Object.keys(studentWhere).length > 0 ? studentWhere : undefined,
        attributes: ["id", "admission_no", "roll_no", "father_name", "emergency_contact"],
        include: [
          { model: User, attributes: ["name", "username", "phone"] },
          { model: Class, attributes: ["id", "class_name"] },
          { model: Section, attributes: ["id", "name"] },
        ],
      },
    ],
    order: [["balance", "DESC"]],
  });

  return {
    total: count,
    defaulters: rows.map((l) => ({
      ledger_id: l.id,
      student_id: l.student_id,
      name: l.student?.user?.name,
      username: l.student?.user?.username,
      admission_no: l.student?.admission_no,
      roll_no: l.student?.roll_no,
      father_name: l.student?.father_name,
      phone: l.student?.user?.phone || l.student?.emergency_contact || "—",
      class_name: l.student?.class?.class_name,
      section_name: l.student?.section?.name,
      total: Number(l.total),
      paid: Number(l.paid),
      balance: Number(l.balance),
    })),
  };
};

export const sendPaymentWhatsAppReceiptService = async (payment_id, school_id) => {
  const payment = await FeePayment.findOne({
    where: { id: payment_id, school_id },
    include: [
      {
        model: Student,
        attributes: ["id", "admission_no", "roll_no", "phone", "emergency_contact"],
        include: [
          { model: User, attributes: ["name", "phone"] },
          { model: Class, attributes: ["class_name"] },
          { model: Section, attributes: ["name"] },
        ],
      },
      { model: StudentFeeLedger, attributes: ["total", "paid", "balance"] },
    ],
  });

  if (!payment) throw new AppError("Payment receipt not found", 404);

  const school = await School.findByPk(school_id);
  const schoolName = school?.name || "School";

  const studentName = payment.Student?.User?.name || payment.Student?.name || "Student";
  const className = payment.Student?.Class?.class_name || "";
  const sectionName = payment.Student?.Section?.name || "";
  const rawPhone = payment.Student?.phone || payment.Student?.User?.phone || payment.Student?.emergency_contact;

  if (!rawPhone || !rawPhone.trim()) {
    throw new AppError("Parent phone number is empty in student profile", 400);
  }

  const msg = `*${schoolName.toUpperCase()}*\n` +
    `*OFFICIAL FEE RECEIPT*\n` +
    `--------------------------\n` +
    `*Receipt No:* ${payment.receipt_no}\n` +
    `*Student:* ${studentName}\n` +
    `*Class & Section:* ${className}${sectionName ? " - " + sectionName : ""}\n` +
    `*Amount Paid:* ₹${Number(payment.amount).toLocaleString("en-IN")}\n` +
    `*Remaining Balance:* ₹${Number(payment.StudentFeeLedger?.balance || 0).toLocaleString("en-IN")}\n` +
    `--------------------------\n` +
    `Thank you! ${schoolName}`;

  const { sendTextMessage } = await import("../whatsapp/whatsapp.service.js");
  const result = await sendTextMessage(rawPhone, msg, school_id);

  if (!result.success) {
    throw new AppError(result.error || "WhatsApp API dispatch failed. Check environment credentials or phone number.", 400);
  }

  return {
    success: true,
    message: `WhatsApp receipt sent to parent (${rawPhone}) successfully!`,
  };
};
