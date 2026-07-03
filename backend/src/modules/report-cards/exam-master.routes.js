import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";
import {
  listExamMasters,
  createExamMaster,
  deleteExamMaster,
} from "./exam-master.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", allowRoles("school_admin", "super_admin", "teacher"), listExamMasters);
router.post("/", allowRoles("school_admin", "super_admin"), createExamMaster);
router.delete("/:id", allowRoles("school_admin", "super_admin"), deleteExamMaster);

export default router;
