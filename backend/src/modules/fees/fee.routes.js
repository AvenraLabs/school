import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { validate } from "../../shared/middlewares/validate.js";

import {
  createFeeCategorySchema,
  updateFeeCategorySchema,
  upsertClassFeePlanSchema,
  generateLedgerSchema,
  updateLedgerAdjustmentsSchema,
  recordPaymentSchema,
  voidPaymentSchema,
} from "./fee.schema.js";

import {
  createFeeCategory,
  listFeeCategories,
  updateFeeCategory,
  deleteFeeCategory,
  upsertClassFeePlans,
  getClassFeePlans,
  listAllClassFeePlansSummary,
  generateStudentLedger,
  bulkGenerateLedgers,
  getStudentLedger,
  updateLedgerAdjustments,
  recordPayment,
  voidPayment,
  getFeeCollectionSummary,
  getDefaultersList,
} from "./fee.controller.js";

const router = express.Router();

router.use(protect);

/* Student & Parent PWA Route */
router.get("/my-ledger", allowRoles("student", "parent", "school_admin", "super_admin"), (async (req, res, next) => {
  const { getMyFeeLedger } = await import("./fee.controller.js");
  return getMyFeeLedger(req, res, next);
}));

/* School Admin & Super Admin Only Routes */
router.use(allowRoles("school_admin", "super_admin"));

/* Fee Categories */
router.post("/categories", validate(createFeeCategorySchema), createFeeCategory);
router.get("/categories", listFeeCategories);
router.patch("/categories/:id", validate(updateFeeCategorySchema), updateFeeCategory);
router.delete("/categories/:id", deleteFeeCategory);

/* Class Fee Plans */
router.get("/plans/summary", listAllClassFeePlansSummary);
router.post("/plans/:classId", validate(upsertClassFeePlanSchema), upsertClassFeePlans);
router.get("/plans/:classId", getClassFeePlans);

/* Student Fee Ledgers */
router.post("/ledgers/generate", validate(generateLedgerSchema), generateStudentLedger);
router.post("/ledgers/bulk-generate/:classId", bulkGenerateLedgers);
router.get("/ledgers/:studentId", getStudentLedger);
router.patch("/ledgers/:ledgerId/adjust", validate(updateLedgerAdjustmentsSchema), updateLedgerAdjustments);

/* Payments */
router.get("/payments", (async (req, res, next) => {
  const { listSchoolPaymentHistory } = await import("./fee.controller.js");
  return listSchoolPaymentHistory(req, res, next);
}));
router.post("/payments", validate(recordPaymentSchema), recordPayment);
router.patch("/payments/:paymentId/void", validate(voidPaymentSchema), voidPayment);
router.post("/payments/:id/send-whatsapp", (async (req, res, next) => {
  const { sendPaymentWhatsAppReceipt } = await import("./fee.controller.js");
  return sendPaymentWhatsAppReceipt(req, res, next);
}));

/* Reports & Summaries */
router.get("/summary", getFeeCollectionSummary);
router.get("/defaulters", getDefaultersList);

export default router;
