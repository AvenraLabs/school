import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import {
  getTokenPolicies,
  setTokenPolicies,
  listTokenAccounts,
  listTokenTransactions,
  adjustUserTokenBalance,
  getBillingSummary,
  getApiLogsFeed,
  updateSchoolWhatsAppQuota,
} from "./token.controller.js";

const router = express.Router();

router.use(protect);

// Super admin: manage token policies and balances
router.get("/tokens/policies", allowRoles("super_admin"), getTokenPolicies);
router.post("/tokens/policies", allowRoles("super_admin"), setTokenPolicies);

router.get("/tokens/accounts", allowRoles("super_admin"), listTokenAccounts);
router.get("/tokens/transactions", allowRoles("super_admin"), listTokenTransactions);
router.post("/tokens/users/:userId/adjust", allowRoles("super_admin"), adjustUserTokenBalance);

// Billing & API usage logs
router.get("/tokens/billing-summary", allowRoles("super_admin"), getBillingSummary);
router.get("/tokens/api-logs", allowRoles("super_admin"), getApiLogsFeed);
router.post("/tokens/schools/:schoolId/whatsapp-quota", allowRoles("super_admin"), updateSchoolWhatsAppQuota);

export default router;
