import express from "express";
import {
  createBellSchedule,
  getBellSchedules,
  getBellScheduleById,
  updateBellSchedule,
  deleteBellSchedule,
} from "./bell-schedule.controller.js";
import { validate } from "../../shared/middlewares/validate.js";
import {
  createBellScheduleSchema,
  updateBellScheduleSchema,
} from "./bell-schedule.schema.js";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(allowRoles("school_admin", "teacher"), getBellSchedules)
  .post(allowRoles("school_admin"), validate(createBellScheduleSchema), createBellSchedule);

router
  .route("/:id")
  .get(allowRoles("school_admin", "teacher"), getBellScheduleById)
  .patch(allowRoles("school_admin"), validate(updateBellScheduleSchema), updateBellSchedule)
  .delete(allowRoles("school_admin"), deleteBellSchedule);

export default router;
