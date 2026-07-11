import express from "express";
import { protect } from "../../shared/middlewares/auth.js";
import { validate } from "../../shared/middlewares/validate.js";
import {
  createReportCardSchema,
  saveReportCardMarksSchema,
  publishReportCardSchema,
  getAcademicReportCardsSchema,
  bulkSaveReportCardMarksSchema,
  bulkPublishReportCardsSchema,
} from "./report-card.schema.js";
import {
  createReportCard,
  saveReportCardMarks,
  publishReportCard,
  getReportCard,
  listReportCards,
  getAcademicReportCards,
  bulkSaveReportCardMarks,
  bulkPublishReportCards,
  getGradingScales,
  saveGradingScales,
} from "./report-card.controller.js";
import { allowRoles } from "../../shared/middlewares/role.js";

const router = express.Router();

router.use(protect);

/* teacher/admin listing all report cards for a class and exam */
router.get(
  "/",
  allowRoles("school_admin", "teacher"),
  validate(getAcademicReportCardsSchema),
  getAcademicReportCards
);

/* teacher */
router.post(
  "/",
  allowRoles("school_admin", "teacher"),
  validate(createReportCardSchema),
  createReportCard
);
router.post(
  "/:id/marks",
  allowRoles("school_admin", "teacher"),
  validate(saveReportCardMarksSchema),
  saveReportCardMarks
);
router.post(
  "/:id/publish",
  allowRoles("school_admin", "teacher"),
  validate(publishReportCardSchema),
  publishReportCard
);

router.post(
  "/bulk-marks",
  allowRoles("school_admin", "teacher"),
  validate(bulkSaveReportCardMarksSchema),
  bulkSaveReportCardMarks
);

router.post(
  "/bulk-publish",
  allowRoles("school_admin", "teacher"),
  validate(bulkPublishReportCardsSchema),
  bulkPublishReportCards
);

/* Grading Scales */
router.get("/grading-scales", getGradingScales);
router.post("/grading-scales", allowRoles("school_admin"), saveGradingScales);

/* view */
router.get("/student/list", allowRoles("student"), listReportCards);
router.get("/:id", getReportCard);

export default router;
