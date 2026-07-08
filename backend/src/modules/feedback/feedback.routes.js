import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { validate } from "../../shared/middlewares/validate.js";
import {
  submitFeedback,
  getFeedbacks,
  updateStatus,
} from "./feedback.controller.js";
import {
  submitFeedbackSchema,
  updateFeedbackStatusSchema,
} from "./feedback.schema.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post("/", allowRoles("school_admin", "teacher", "student"), validate(submitFeedbackSchema), submitFeedback);
router.get("/manage", allowRoles("super_admin"), getFeedbacks);
router.patch("/:id/status", allowRoles("super_admin"), validate(updateFeedbackStatusSchema), updateStatus);

export default router;
