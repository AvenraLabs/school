import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { validate } from "../../shared/middlewares/validate.js";
import {
  createPost,
  listItems,
  listMyItems,
  getItem,
  updateStatus,
  deletePost,
} from "./lost-found.controller.js";
import {
  createLostFoundSchema,
  updateLostFoundStatusSchema,
} from "./lost-found.schema.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.post("/", allowRoles("school_admin", "teacher", "student"), validate(createLostFoundSchema), createPost);
router.get("/", allowRoles("school_admin", "teacher", "student"), listItems);
router.get("/my", allowRoles("school_admin", "teacher", "student"), listMyItems);
router.get("/:id", allowRoles("school_admin", "teacher", "student"), getItem);
router.patch("/:id/status", allowRoles("school_admin", "teacher", "student"), validate(updateLostFoundStatusSchema), updateStatus);
router.delete("/:id", allowRoles("school_admin", "teacher", "student", "super_admin"), deletePost);

export default router;
