import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { validate } from "../../shared/middlewares/validate.js";
import {
  createClassSchema,
  updateClassSchema,
} from "./classes.schema.js";
import {
  createClass,
  getClasses,
  getLoginRoster,
  getClassById,
  updateClass,
  deleteClass,
} from "./classes.controller.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  allowRoles("school_admin", "super_admin"),
  validate(createClassSchema),
  createClass
);
router.get("/", allowRoles("school_admin", "teacher", "super_admin"), getClasses);
router.get("/login-roster", allowRoles("school_admin", "super_admin"), getLoginRoster);
router.get("/:id", allowRoles("school_admin", "teacher", "super_admin"), getClassById);
router.patch(
  "/:id",
  allowRoles("school_admin", "super_admin"),
  validate(updateClassSchema),
  updateClass
);
router.delete("/:id", allowRoles("school_admin", "super_admin"), deleteClass);

export default router;
