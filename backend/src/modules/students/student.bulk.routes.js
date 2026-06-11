import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import { validate } from "../../shared/middlewares/validate.js";

import { bulkApproveStudentsSchema } from "./student.bulk.schema.js";
import { bulkApproveStudents } from "./student.bulk.controller.js";

const router = express.Router();

router.post(
  "/admin/students/bulk-approve",
  protect,
  allowRoles("school_admin"),
  validate(bulkApproveStudentsSchema),
  bulkApproveStudents
);

export default router;
