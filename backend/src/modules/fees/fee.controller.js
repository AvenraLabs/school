import asyncHandler from "../../shared/asyncHandler.js";
import {
  createFeeCategoryService,
  listFeeCategoriesService,
  updateFeeCategoryService,
  deleteFeeCategoryService,
  upsertClassFeePlansAndSchedulesService,
  getClassFeePlansAndSchedulesService,
  listAllClassFeePlansSummaryService,
  generateStudentLedgerService,
  bulkGenerateLedgersForClassService,
  getStudentLedgerService,
  updateLedgerAdjustmentsService,
  recordPaymentService,
  voidPaymentService,
  getFeeCollectionSummaryService,
  getDefaultersListService,
} from "./fee.service.js";

/* Categories */
export const createFeeCategory = asyncHandler(async (req, res) => {
  const category = await createFeeCategoryService(req.user.school_id, req.body);
  res.status(201).json(category);
});

export const listFeeCategories = asyncHandler(async (req, res) => {
  const categories = await listFeeCategoriesService(req.user.school_id);
  res.json(categories);
});

export const updateFeeCategory = asyncHandler(async (req, res) => {
  const category = await updateFeeCategoryService(req.params.id, req.user.school_id, req.body);
  res.json(category);
});

export const deleteFeeCategory = asyncHandler(async (req, res) => {
  const result = await deleteFeeCategoryService(req.params.id, req.user.school_id);
  res.json(result);
});

/* Class Fee Plans & Term Schedules */
export const upsertClassFeePlans = asyncHandler(async (req, res) => {
  const result = await upsertClassFeePlansAndSchedulesService(req.user.school_id, req.params.classId, req.body);
  res.json(result);
});

export const getClassFeePlans = asyncHandler(async (req, res) => {
  const result = await getClassFeePlansAndSchedulesService(req.user.school_id, req.params.classId);
  res.json(result);
});

export const listAllClassFeePlansSummary = asyncHandler(async (req, res) => {
  const summary = await listAllClassFeePlansSummaryService(req.user.school_id);
  res.json(summary);
});

/* Student Fee Ledgers */
export const generateStudentLedger = asyncHandler(async (req, res) => {
  const ledger = await generateStudentLedgerService(req.user.school_id, req.body.student_id, req.body);
  res.status(201).json(ledger);
});

export const bulkGenerateLedgers = asyncHandler(async (req, res) => {
  const result = await bulkGenerateLedgersForClassService(req.user.school_id, req.params.classId);
  res.json(result);
});

export const getStudentLedger = asyncHandler(async (req, res) => {
  const data = await getStudentLedgerService(req.user.school_id, req.params.studentId);
  res.json(data);
});

export const updateLedgerAdjustments = asyncHandler(async (req, res) => {
  const ledger = await updateLedgerAdjustmentsService(req.params.ledgerId, req.user.school_id, req.body);
  res.json(ledger);
});

/* Payments */
export const recordPayment = asyncHandler(async (req, res) => {
  const result = await recordPaymentService(req.user.school_id, req.body);
  res.status(201).json(result);
});

export const voidPayment = asyncHandler(async (req, res) => {
  const result = await voidPaymentService(
    req.params.paymentId,
    req.user.school_id,
    req.user.id,
    req.body
  );
  res.json(result);
});

/* Reports & Summaries */
export const getFeeCollectionSummary = asyncHandler(async (req, res) => {
  const summary = await getFeeCollectionSummaryService(req.user.school_id);
  res.json(summary);
});

export const getDefaultersList = asyncHandler(async (req, res) => {
  const defaulters = await getDefaultersListService(req.user.school_id, req.query);
  res.json(defaulters);
});

export const listSchoolPaymentHistory = asyncHandler(async (req, res) => {
  const { listSchoolPaymentHistoryService } = await import("./fee.service.js");
  const payments = await listSchoolPaymentHistoryService(req.user.school_id, req.query);
  res.json(payments);
});

export const getMyFeeLedger = asyncHandler(async (req, res) => {
  const { getMyFeeLedgerService } = await import("./fee.service.js");
  const ledger = await getMyFeeLedgerService(req.user.school_id, req.user.id, req.user.role);
  res.json(ledger);
});

export const sendPaymentWhatsAppReceipt = asyncHandler(async (req, res) => {
  const { sendPaymentWhatsAppReceiptService } = await import("./fee.service.js");
  const result = await sendPaymentWhatsAppReceiptService(req.params.id, req.user.school_id);
  res.json(result);
});
