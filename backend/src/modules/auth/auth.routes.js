import express from "express";
import { login, changePassword, switchStudent, adminResetUserPassword, updateProfile } from "./auth.controller.js";
import { loginSchema, changePasswordSchema } from "./auth.schema.js";
import { validate } from "../../shared/middlewares/validate.js";
import { protect } from "../../shared/middlewares/auth.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post(
  "/change-password",
  protect,
  validate(changePasswordSchema),
  changePassword
);
router.post("/switch-student", protect, switchStudent);
router.patch("/admin/users/:userId/reset-password", protect, adminResetUserPassword);
router.patch("/profile", protect, updateProfile);

export default router;
