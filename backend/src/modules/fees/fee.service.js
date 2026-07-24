import db from "../../config/db.js";
import FeeCategory from "./fee-category.model.js";
import FeeDefinition from "./fee-definition.model.js";
import StudentFee from "./student-fee.model.js";
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

/* Helpers */
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

const formatReceiptNo = (num, yearName = "") => {
  const padded = String(num).padStart(5, "0");
  // Use last 2 digits of the year (e.g. "26" from "2026-27" or "2026")
  const rawYear = yearName ? yearName.trim() : String(new Date().getFullYear());
  const yr = rawYear.substring(2, 4);
  return `${yr}-${padded}`;
  // Example: 26-00042
};

/* Mid-Year Student Auto-Assignment Helper */
export const autoAssignStudentFeesService = async (school_id, student_id, class_id, transaction = null) => {
  if (!class_id) return;
  const currentYear = await getCurrentAcademicYear(school_id, transaction);

  const activeDefs = await FeeDefinition.findAll({
    where: { school_id, academic_year_id: currentYear.id, class_id: Number(class_id), is_active: true },
    transaction,
  });

  for (const feeDef of activeDefs) {
    const existing = await StudentFee.findOne({
      where: { school_id, student_id, fee_definition_id: feeDef.id },
      transaction,
    });

    if (!existing) {
      const totAmt = Number(feeDef.total_amount);
      await StudentFee.create(
        {
          school_id,
          academic_year_id: currentYear.id,
          student_id,
          fee_definition_id: feeDef.id,
          total_amount: totAmt,
          concession_amount: 0,
          paid_amount: 0,
          balance_amount: totAmt,
          status: "pending",
        },
        { transaction }
      );
    }
  }
};

/* Fee Categories Master */
export const createFeeCategoryService = async (school_id, data) => {
  const { name } = data;
  if (!name || !name.trim()) throw new AppError("Category name is required", 400);

  const existing = await FeeCategory.findOne({
    where: { school_id, name: name.trim() },
  });
  if (existing) throw new AppError("Category name already exists", 400);

  return await FeeCategory.create({
    school_id,
    name: name.trim(),
    is_active: true,
  });
};

export const listFeeCategoriesService = async (school_id) => {
  return await FeeCategory.findAll({
    where: { school_id },
    order: [["name", "ASC"]],
  });
};

export const updateFeeCategoryService = async (id, school_id, data) => {
  const category = await FeeCategory.findOne({ where: { id, school_id } });
  if (!category) throw new AppError("Category not found", 404);

  if (data.name) category.name = data.name.trim();
  if (data.is_active !== undefined) category.is_active = Boolean(data.is_active);

  await category.save();
  return category;
};

export const deleteFeeCategoryService = async (id, school_id) => {
  const category = await FeeCategory.findOne({ where: { id, school_id } });
  if (!category) throw new AppError("Category not found", 404);

  await category.destroy();
  return { success: true, message: "Category deleted" };
};

/* Fee Definitions & Assignment */
export const createFeeDefinitionService = async (school_id, data) => {
  return db.transaction(async (t) => {
    const currentYear = await getCurrentAcademicYear(school_id, t);
    const { title, class_id, due_date, total_amount, breakdown = [], fee_type = "class", student_ids = [] } = data;

    if (!title || !title.trim()) throw new AppError("Fee title is required", 400);
    const totalAmt = Number(total_amount);
    if (isNaN(totalAmt) || totalAmt <= 0) throw new AppError("Total amount must be greater than 0", 400);

    const feeDef = await FeeDefinition.create(
      {
        school_id,
        academic_year_id: currentYear.id,
        class_id: class_id ? Number(class_id) : null,
        title: title.trim(),
        due_date: due_date || null,
        total_amount: totalAmt,
        breakdown: Array.isArray(breakdown) ? breakdown : [],
        fee_type: class_id ? "class" : "individual",
        is_active: true,
      },
      { transaction: t }
    );

    let targetStudents = [];
    if (class_id) {
      targetStudents = await Student.findAll({
        where: { school_id, class_id: Number(class_id), status: "ACTIVE" },
        transaction: t,
      });
    } else if (Array.isArray(student_ids) && student_ids.length > 0) {
      targetStudents = await Student.findAll({
        where: { school_id, id: { [Op.in]: student_ids.map(Number) } },
        transaction: t,
      });
    }

    let assignedCount = 0;
    for (const st of targetStudents) {
      const existing = await StudentFee.findOne({
        where: { school_id, student_id: st.id, fee_definition_id: feeDef.id },
        transaction: t,
      });

      if (!existing) {
        await StudentFee.create(
          {
            school_id,
            academic_year_id: currentYear.id,
            student_id: st.id,
            fee_definition_id: feeDef.id,
            total_amount: totalAmt,
            concession_amount: 0,
            paid_amount: 0,
            balance_amount: totalAmt,
            status: "pending",
          },
          { transaction: t }
        );
        assignedCount++;
      }
    }

    return {
      fee_definition: feeDef,
      assigned_students_count: assignedCount,
    };
  });
};

export const listFeeDefinitionsService = async (school_id, query = {}) => {
  const currentYear = await getCurrentAcademicYear(school_id);
  const where = { school_id, academic_year_id: currentYear.id };
  if (query.class_id) where.class_id = Number(query.class_id);

  return await FeeDefinition.findAll({
    where,
    include: [{ model: Class, attributes: ["id", "class_name"] }],
    order: [["created_at", "DESC"]],
  });
};

export const deleteFeeDefinitionService = async (id, school_id) => {
  return db.transaction(async (t) => {
    const feeDef = await FeeDefinition.findOne({ where: { id, school_id }, transaction: t });
    if (!feeDef) throw new AppError("Fee definition not found", 404);

    // Safeguard: Check if payments exist against this fee definition
    const studentFees = await StudentFee.findAll({ where: { school_id, fee_definition_id: id }, transaction: t });
    const studentFeeIds = studentFees.map((sf) => sf.id);

    if (studentFeeIds.length > 0) {
      const paymentsCount = await FeePayment.count({
        where: { school_id, student_fee_id: { [Op.in]: studentFeeIds }, is_void: false },
        transaction: t,
      });

      if (paymentsCount > 0) {
        throw new AppError(
          "Cannot delete fee because payments have already been collected against it. You can void the payments first.",
          400
        );
      }
    }

    await StudentFee.destroy({ where: { school_id, fee_definition_id: id }, transaction: t });
    await feeDef.destroy({ transaction: t });

    return { success: true, message: "Fee definition deleted successfully" };
  });
};

/* Concession / Discount Application */
export const applyConcessionService = async (school_id, data) => {
  return db.transaction(async (t) => {
    const { student_fee_id, concession_amount, reason } = data;
    const discAmt = Math.max(0, Number(concession_amount) || 0);

    const studentFee = await StudentFee.findOne({
      where: { id: student_fee_id, school_id },
      include: [{ model: FeeDefinition, required: true }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!studentFee) throw new AppError("Assigned student fee record not found", 404);

    const baseAmount = Number(studentFee.fee_definition?.total_amount || studentFee.total_amount);
    const newTotal = Math.max(0, baseAmount - discAmt);
    const paidAmt = Number(studentFee.paid_amount);
    const newBalance = Math.max(0, newTotal - paidAmt);
    const newStatus = newBalance === 0 ? "paid" : paidAmt > 0 ? "partial" : "pending";

    await studentFee.update(
      {
        concession_amount: discAmt,
        concession_reason: reason || "Admin concession",
        total_amount: newTotal,
        balance_amount: newBalance,
        status: newStatus,
      },
      { transaction: t }
    );

    return { success: true, student_fee: studentFee };
  });
};

/* Student Fees & Payments */
export const getStudentFeesService = async (school_id, student_id) => {
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

  const studentFees = await StudentFee.findAll({
    where: { school_id, academic_year_id: currentYear.id, student_id },
    include: [{ model: FeeDefinition }],
    order: [["created_at", "DESC"]],
  });

  const allPayments = await FeePayment.findAll({
    where: { school_id, student_id },
    order: [["paid_at", "DESC"]],
  });

  const totalFee = studentFees.reduce((acc, f) => acc + Number(f.total_amount), 0);
  const totalPaid = studentFees.reduce((acc, f) => acc + Number(f.paid_amount), 0);
  const totalBalance = studentFees.reduce((acc, f) => acc + Number(f.balance_amount), 0);

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
    summary: {
      total_fee: totalFee,
      total_paid: totalPaid,
      total_balance: totalBalance,
    },
    fees: studentFees.map((f) => ({
      id: f.id,
      fee_definition_id: f.fee_definition_id,
      title: f.fee_definition?.title,
      due_date: f.fee_definition?.due_date,
      breakdown: f.fee_definition?.breakdown || [],
      total_amount: Number(f.total_amount),
      concession_amount: Number(f.concession_amount || 0),
      concession_reason: f.concession_reason,
      paid_amount: Number(f.paid_amount),
      balance_amount: Number(f.balance_amount),
      status: f.status,
    })),
    payments: allPayments.map((p) => ({
      id: p.id,
      student_fee_id: p.student_fee_id,
      receipt_no: p.receipt_no,
      amount: Number(p.amount),
      mode: p.mode,
      reference: p.reference,
      paid_at: p.paid_at,
      is_void: p.is_void,
      void_reason: p.void_reason,
    })),
  };
};

export const getMyFeeLedgerService = async (school_id, user_id, role) => {
  let student_id = null;
  if (role === "student") {
    const st = await Student.findOne({ where: { user_id, school_id } });
    if (!st) throw new AppError("Student profile not found", 404);
    student_id = st.id;
  } else if (role === "parent") {
    const parentUser = await User.findByPk(user_id);
    const st = await Student.findOne({
      where: { school_id, [Op.or]: [{ emergency_contact: parentUser.phone }, { phone: parentUser.phone }] },
    });
    if (!st) throw new AppError("Associated student profile not found", 404);
    student_id = st.id;
  } else {
    throw new AppError("Unauthorized role", 403);
  }

  return await getStudentFeesService(school_id, student_id);
};

export const recordPaymentService = async (school_id, data) => {
  return db.transaction(async (t) => {
    const currentYear = await getCurrentAcademicYear(school_id, t);
    const { student_id, student_fee_id, amount, mode = "cash", reference, paid_by, remarks } = data;

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      throw new AppError("Payment amount must be greater than 0", 400);
    }

    const studentFee = await StudentFee.findOne({
      where: { id: student_fee_id, school_id, student_id },
      include: [{ model: FeeDefinition, required: true }],
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!studentFee) throw new AppError("Assigned student fee record not found", 404);

    if (studentFee.status === "paid") {
      throw new AppError("This fee has already been fully paid.", 400);
    }

    // Overpayment Validation
    const currentBalance = Number(studentFee.balance_amount);
    if (payAmount > currentBalance) {
      throw new AppError(
        `Payment amount (₹${payAmount.toLocaleString('en-IN')}) exceeds remaining fee balance of ₹${currentBalance.toLocaleString('en-IN')}.`,
        400
      );
    }

    // Format receipt number
    const school = await School.findByPk(school_id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!school) throw new AppError("School not found", 404);

    let nextCounter = (Number(school.fee_receipt_counter) || 0) + 1;
    let receiptNo = formatReceiptNo(nextCounter, currentYear.name);

    let exists = await FeePayment.findOne({ where: { school_id, receipt_no: receiptNo }, transaction: t });
    while (exists) {
      nextCounter++;
      receiptNo = formatReceiptNo(nextCounter, currentYear.name);
      exists = await FeePayment.findOne({ where: { school_id, receipt_no: receiptNo }, transaction: t });
    }

    await school.update({ fee_receipt_counter: nextCounter }, { transaction: t });

    // Update StudentFee balance
    const newPaid = Number(studentFee.paid_amount) + payAmount;
    const newBalance = Math.max(0, Number(studentFee.total_amount) - newPaid);
    const newStatus = newBalance === 0 ? "paid" : "partial";

    await studentFee.update(
      {
        paid_amount: newPaid,
        balance_amount: newBalance,
        status: newStatus,
      },
      { transaction: t }
    );

    // Create Payment Receipt
    const payment = await FeePayment.create(
      {
        school_id,
        student_id,
        student_fee_id: studentFee.id,
        receipt_no: receiptNo,
        amount: payAmount,
        mode,
        reference: reference || null,
        paid_by: paid_by || null,
        remarks: remarks || null,
        paid_at: new Date(),
      },
      { transaction: t }
    );

    return {
      success: true,
      payment,
      receipt_no: receiptNo,
      student_fee: studentFee,
    };
  });
};

export const voidPaymentService = async (payment_id, school_id, voided_by, { void_reason }) => {
  return db.transaction(async (t) => {
    const payment = await FeePayment.findOne({
      where: { id: payment_id, school_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!payment) throw new AppError("Payment receipt not found", 404);
    if (payment.is_void) throw new AppError("Payment is already voided", 400);

    const studentFee = await StudentFee.findOne({
      where: { id: payment.student_fee_id, school_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (studentFee) {
      const newPaid = Math.max(0, Number(studentFee.paid_amount) - Number(payment.amount));
      const newBalance = Math.max(0, Number(studentFee.total_amount) - newPaid);
      const newStatus = newPaid === 0 ? "pending" : newBalance === 0 ? "paid" : "partial";

      await studentFee.update(
        {
          paid_amount: newPaid,
          balance_amount: newBalance,
          status: newStatus,
        },
        { transaction: t }
      );
    }

    await payment.update(
      {
        is_void: true,
        voided_at: new Date(),
        voided_by,
        void_reason: void_reason || "Voided by office admin",
      },
      { transaction: t }
    );

    return { success: true, message: "Payment voided successfully and fee balance restored." };
  });
};

/* Daily Collection Reconciliation & Reports */
export const getDailyCollectionReportService = async (school_id, query = {}) => {
  const { limit, offset, page } = getPagination(query);

  const where = {
    school_id,
    is_void: false,
  };

  if (query.date && query.date !== 'all') {
    const targetDate = new Date(query.date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(query.date).setHours(23, 59, 59, 999));
    where.paid_at = { [Op.between]: [startOfDay, endOfDay] };
  }

  if (query.mode && query.mode !== 'all') {
    where.mode = query.mode;
  }

  if (query.search && query.search.trim()) {
    const q = `%${query.search.trim().toLowerCase()}%`;
    where[Op.or] = [
      db.where(db.fn('LOWER', db.col('receipt_no')), { [Op.like]: q }),
      db.where(db.fn('LOWER', db.col('mode')), { [Op.like]: q }),
    ];
  }

  // Calculate grand summary totals for all matching payments in DB
  const allMatchingPayments = await FeePayment.findAll({
    where,
    attributes: ["amount", "mode"],
  });

  const cashTotal = allMatchingPayments.filter((p) => p.mode === "cash").reduce((acc, p) => acc + Number(p.amount), 0);
  const upiTotal = allMatchingPayments.filter((p) => p.mode === "upi").reduce((acc, p) => acc + Number(p.amount), 0);
  const bankTotal = allMatchingPayments.filter((p) => p.mode === "bank_transfer" || p.mode === "cheque").reduce((acc, p) => acc + Number(p.amount), 0);
  const totalCollected = allMatchingPayments.reduce((acc, p) => acc + Number(p.amount), 0);

  // Fetch paginated payment rows
  const { count, rows: payments } = await FeePayment.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      {
        model: Student,
        attributes: ["id", "admission_no", "roll_no"],
        include: [
          { model: User, attributes: ["name"] },
          { model: Class, attributes: ["class_name"] },
        ],
      },
      { model: StudentFee, include: [{ model: FeeDefinition, attributes: ["title"] }] },
    ],
    order: [["paid_at", "DESC"]],
  });

  return {
    date: query.date || "all",
    pagination: {
      total: count,
      page,
      limit,
      total_pages: Math.ceil(count / limit),
    },
    summary: {
      cash_total: cashTotal,
      upi_total: upiTotal,
      bank_total: bankTotal,
      total_collected: totalCollected,
      count,
    },
    payments: payments.map((p) => {
      const studentObj = p.student || p.Student;
      const userObj = studentObj?.user || studentObj?.User;
      const classObj = studentObj?.class || studentObj?.Class;
      const studentFeeObj = p.student_fee || p.StudentFee;
      const feeDefObj = studentFeeObj?.fee_definition || studentFeeObj?.FeeDefinition;

      return {
        id: p.id,
        receipt_no: p.receipt_no,
        student_name: userObj?.name || studentObj?.name || 'N/A',
        class_name: classObj?.class_name || 'N/A',
        fee_title: feeDefObj?.title || 'Fee Payment',
        amount: Number(p.amount),
        mode: p.mode,
        paid_at: p.paid_at,
      };
    }),
  };
};

export const getDefaultersListService = async (school_id, query = {}) => {
  const { limit, offset } = getPagination(query);
  const currentYear = await getCurrentAcademicYear(school_id);
  const minBal = Number(query.min_balance) || 0;

  const where = {
    school_id,
    academic_year_id: currentYear.id,
    balance_amount: { [Op.gt]: minBal },
    status: { [Op.ne]: "paid" },
  };

  const studentWhere = {};
  if (query.class_id) studentWhere.class_id = Number(query.class_id);

  const { count, rows } = await StudentFee.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      { model: FeeDefinition, attributes: ["title", "due_date", "breakdown"] },
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
    order: [["balance_amount", "DESC"]],
  });

  return {
    total: count,
    defaulters: rows.map((f) => ({
      student_fee_id: f.id,
      student_id: f.student_id,
      name: f.student?.user?.name,
      admission_no: f.student?.admission_no,
      roll_no: f.student?.roll_no,
      phone: f.student?.user?.phone || f.student?.emergency_contact || "—",
      class_name: f.student?.class?.class_name,
      section_name: f.student?.section?.name,
      fee_title: f.fee_definition?.title,
      due_date: f.fee_definition?.due_date,
      total: Number(f.total_amount),
      paid: Number(f.paid_amount),
      balance: Number(f.balance_amount),
      status: f.status,
    })),
  };
};

export const getFeeCollectionSummaryService = async (school_id) => {
  const currentYear = await getCurrentAcademicYear(school_id);

  const studentFees = await StudentFee.findAll({
    where: { school_id, academic_year_id: currentYear.id },
    attributes: ["total_amount", "paid_amount", "balance_amount"],
  });

  const totalFee = studentFees.reduce((acc, f) => acc + Number(f.total_amount), 0);
  const totalCollected = studentFees.reduce((acc, f) => acc + Number(f.paid_amount), 0);
  const totalPending = studentFees.reduce((acc, f) => acc + Number(f.balance_amount), 0);

  return {
    total_fee: totalFee,
    total_collected: totalCollected,
    total_pending: totalPending,
    collection_percentage: totalFee > 0 ? Number(((totalCollected / totalFee) * 100).toFixed(1)) : 0,
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
      { model: StudentFee, include: [{ model: FeeDefinition }] },
    ],
  });

  if (!payment) throw new AppError("Payment receipt not found", 404);

  const school = await School.findByPk(school_id);
  const schoolName = school?.name || "School";

  const studentName = payment.Student?.User?.name || payment.Student?.name || "Student";
  const className = payment.Student?.Class?.class_name || "";
  const feeTitle = payment.StudentFee?.FeeDefinition?.title || "School Fee";
  const rawPhone = payment.Student?.phone || payment.Student?.User?.phone || payment.Student?.emergency_contact;

  if (!rawPhone || !rawPhone.trim()) {
    throw new AppError("Parent phone number is empty in student profile", 400);
  }

  const studentFeeObj = payment.student_fee || payment.StudentFee;
  const concAmt = Number(studentFeeObj?.concession_amount || 0);
  const concReason = studentFeeObj?.concession_reason;

  const msg = `*${schoolName.toUpperCase()}*\n` +
    `*OFFICIAL FEE RECEIPT*\n` +
    `--------------------------\n` +
    `*Receipt No:* ${payment.receipt_no}\n` +
    `*Student:* ${studentName}\n` +
    `*Class:* ${className}\n` +
    `*Fee Item:* ${feeTitle}\n` +
    (concAmt > 0 ? `*Discount / Concession:* -₹${concAmt.toLocaleString("en-IN")}${concReason ? ` (${concReason})` : ""}\n` : "") +
    `*Amount Paid:* ₹${Number(payment.amount).toLocaleString("en-IN")}\n` +
    `*Remaining Balance:* ₹${Number(studentFeeObj?.balance_amount || 0).toLocaleString("en-IN")}\n` +
    `--------------------------\n` +
    `Thank you! ${schoolName}`;

  const { sendTextMessage } = await import("../whatsapp/whatsapp.service.js");
  const result = await sendTextMessage(rawPhone, msg, school_id);

  if (!result.success) {
    throw new AppError(result.error || "WhatsApp API dispatch failed", 400);
  }

  return {
    success: true,
    message: `WhatsApp receipt sent to parent (${rawPhone}) successfully!`,
  };
};
