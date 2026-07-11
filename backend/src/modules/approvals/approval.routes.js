import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { validate } from "../../shared/middlewares/validate.js";

import { listPendingApprovalsSchema } from "./approval.schema.js";
import {
  getTeacherPendingApprovals,
  getAdminPendingApprovals,
  approveRejectRequest,
  getPendingProfileUpdates,
  processProfileUpdateRequest,
} from "./approval.controller.js";

const router = express.Router();

/* =========================
   TEACHER
========================= */
router.get(
  "/teachers/approvals/pending",
  protect,
  allowRoles("teacher"),
  validate(listPendingApprovalsSchema),
  getTeacherPendingApprovals
);

router.get(
  "/teachers/approvals/profile-updates",
  protect,
  allowRoles("teacher"),
  getPendingProfileUpdates
);

router.post(
  "/teachers/approvals/profile-updates/:id/process",
  protect,
  allowRoles("teacher"),
  processProfileUpdateRequest
);

router.post(
  "/teachers/approvals/:type/:id/:action",
  protect,
  allowRoles("teacher"),
  approveRejectRequest
);

/* =========================
   ADMIN
========================= */
router.get(
  "/admin/approvals/pending",
  protect,
  allowRoles("school_admin"),
  validate(listPendingApprovalsSchema),
  getAdminPendingApprovals
);

router.get(
  "/admin/approvals/profile-updates",
  protect,
  allowRoles("school_admin"),
  getPendingProfileUpdates
);

router.post(
  "/admin/approvals/profile-updates/:id/process",
  protect,
  allowRoles("school_admin"),
  processProfileUpdateRequest
);

router.post(
  "/admin/approvals/:type/:id/:action",
  protect,
  allowRoles("school_admin"),
  approveRejectRequest
);

export default router;
