import asyncHandler from "../../shared/asyncHandler.js";
import {
  createFeeCategoryService,
  listFeeCategoriesService,
  updateFeeCategoryService,
  deleteFeeCategoryService,
  createFeeDefinitionService,
  listFeeDefinitionsService,
  deleteFeeDefinitionService,
  applyConcessionService,
  getStudentFeesService,
  recordPaymentService,
  voidPaymentService,
  getDailyCollectionReportService,
  getDefaultersListService,
  getFeeCollectionSummaryService,
  getMyFeeLedgerService,
  sendPaymentWhatsAppReceiptService,
  getUnifiedFinanceDashboardService,
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

/* Fee Definitions */
export const createFeeDefinition = asyncHandler(async (req, res) => {
  const result = await createFeeDefinitionService(req.user.school_id, req.body);
  res.status(201).json(result);
});

export const listFeeDefinitions = asyncHandler(async (req, res) => {
  const definitions = await listFeeDefinitionsService(req.user.school_id, req.query);
  res.json(definitions);
});

export const deleteFeeDefinition = asyncHandler(async (req, res) => {
  const result = await deleteFeeDefinitionService(req.params.id, req.user.school_id);
  res.json(result);
});

/* Concessions */
export const applyConcession = asyncHandler(async (req, res) => {
  const result = await applyConcessionService(req.user.school_id, req.body);
  res.json(result);
});

/* Student Fees & Payments */
export const getStudentFees = asyncHandler(async (req, res) => {
  const data = await getStudentFeesService(req.user.school_id, req.params.studentId);
  res.json(data);
});

export const getMyFeeLedger = asyncHandler(async (req, res) => {
  const ledger = await getMyFeeLedgerService(req.user.school_id, req.user.id, req.user.role);
  res.json(ledger);
});

export const recordPayment = asyncHandler(async (req, res) => {
  const result = await recordPaymentService(req.user.school_id, req.body);
  res.status(201).json(result);
});

export const voidPayment = asyncHandler(async (req, res) => {
  // Only school_admin (and super_admin) may void payments — explicit guard
  if (req.user.role !== "school_admin" && req.user.role !== "super_admin") {
    return res.status(403).json({ message: "Only school admin can void payments." });
  }
  const result = await voidPaymentService(
    req.params.paymentId,
    req.user.school_id,
    req.user.id,
    req.body
  );
  res.json(result);
});

export const sendPaymentWhatsAppReceipt = asyncHandler(async (req, res) => {
  const result = await sendPaymentWhatsAppReceiptService(req.params.id, req.user.school_id);
  res.json(result);
});

/* Reports & Daily Reconciliation */
export const getDailyCollectionReport = asyncHandler(async (req, res) => {
  const report = await getDailyCollectionReportService(req.user.school_id, req.query);
  res.json(report);
});

export const getFeeCollectionSummary = asyncHandler(async (req, res) => {
  const summary = await getFeeCollectionSummaryService(req.user.school_id);
  res.json(summary);
});

export const getDefaultersList = asyncHandler(async (req, res) => {
  const defaulters = await getDefaultersListService(req.user.school_id, req.query);
  res.json(defaulters);
});

export const getUnifiedFinanceDashboard = asyncHandler(async (req, res) => {
  const dashboard = await getUnifiedFinanceDashboardService(req.user.school_id);
  res.json(dashboard);
});
