import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { validate } from "../../shared/middlewares/validate.js";
import {
  createExamSchema,
  upsertExamSubjectSchema,
} from "./exam.schema.js";

import {
  createExam,
  listExamsByClass,
  upsertExamSubject,
  removeExamSubject,
  deleteExam,
} from "./exam.controller.js";

const router = express.Router();

router.use(protect);

/* ADMIN/TEACHER: Create exam with subject schedule */
router.post("/", allowRoles("teacher", "school_admin"), validate(createExamSchema), createExam);

/* ADMIN/TEACHER: Manage subjects in an exam */
router.put("/:id/subjects", allowRoles("teacher", "school_admin"), validate(upsertExamSubjectSchema), upsertExamSubject);
router.delete("/:id/subjects/:subject_id", allowRoles("teacher", "school_admin"), removeExamSubject);

/* ADMIN/TEACHER: Delete exam */
router.delete("/:id", allowRoles("teacher", "school_admin"), deleteExam);

/* All roles: List exams for a class */
router.get("/", listExamsByClass);


export default router;
