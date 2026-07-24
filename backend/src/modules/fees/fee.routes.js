import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";

import {
  createFeeCategory,
  listFeeCategories,
  updateFeeCategory,
  deleteFeeCategory,
  createFeeDefinition,
  listFeeDefinitions,
  deleteFeeDefinition,
  applyConcession,
  getStudentFees,
  recordPayment,
  voidPayment,
  getDailyCollectionReport,
  getFeeCollectionSummary,
  getDefaultersList,
  getMyFeeLedger,
  sendPaymentWhatsAppReceipt,
} from "./fee.controller.js";

const router = express.Router();

router.use(protect);

/* Student & Parent App Route */
router.get("/my-ledger", allowRoles("student", "parent", "school_admin", "super_admin"), getMyFeeLedger);

/* School Admin & Super Admin Only Routes */
router.use(allowRoles("school_admin", "super_admin"));

/* Fee Categories */
router.post("/categories", createFeeCategory);
router.get("/categories", listFeeCategories);
router.patch("/categories/:id", updateFeeCategory);
router.delete("/categories/:id", deleteFeeCategory);

/* Fee Definitions */
router.post("/definitions", createFeeDefinition);
router.get("/definitions", listFeeDefinitions);
router.delete("/definitions/:id", deleteFeeDefinition);

/* Concessions */
router.post("/concessions", applyConcession);

/* Student Fees */
router.get("/student/:studentId", getStudentFees);
router.get("/ledgers/:studentId", getStudentFees); // Fallback alias

/* Payments */
router.post("/payments", recordPayment);
router.patch("/payments/:paymentId/void", voidPayment);
router.post("/payments/:id/send-whatsapp", sendPaymentWhatsAppReceipt);

/* Reports & Daily Cash Reconciliation */
router.get("/daily-report", getDailyCollectionReport);
router.get("/summary", getFeeCollectionSummary);
router.get("/defaulters", getDefaultersList);

export default router;
