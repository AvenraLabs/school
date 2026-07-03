import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import {
  listFamilies,
  createFamily,
  updateFamily,
  addStudentToFamily,
  removeStudentFromFamily,
  getMySiblings,
} from "./family.controller.js";

const router = express.Router();

/* Student: get own siblings */
router.get("/my-siblings", protect, allowRoles("student"), getMySiblings);

/* Admin: CRUD */
router.get("/", protect, allowRoles("school_admin"), listFamilies);
router.post("/", protect, allowRoles("school_admin"), createFamily);
router.put("/:id", protect, allowRoles("school_admin"), updateFamily);
router.post("/:id/students", protect, allowRoles("school_admin"), addStudentToFamily);
router.delete("/:id/students/:student_id", protect, allowRoles("school_admin"), removeStudentFromFamily);

export default router;
