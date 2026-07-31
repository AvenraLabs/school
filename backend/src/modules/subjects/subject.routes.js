import express from "express";
import {
    createSubject,
    getAllSubjects,
    updateSubject,
    deleteSubject,
    getClassSubjects,
    setClassSubjects,
    getResolvedSubjectsForSection,
    getSectionOverrides,
    setSectionOverrides,
    saveSubjectPeriods,
} from "./subject.controller.js";
import { validate } from "../../shared/middlewares/validate.js";
import {
    createSubjectSchema,
    updateSubjectSchema,
    savePeriodsSchema,
} from "./subject.schema.js";
import { protect } from "../../shared/middlewares/auth.js";
import { allowRoles } from "../../shared/middlewares/role.js";

const router = express.Router();

router.use(protect);

// ─── Specific routes MUST come before /:id to avoid route conflicts ───

// Bulk period allocation update (for class default or section override)
router
    .route("/periods")
    .put(allowRoles("school_admin"), validate(savePeriodsSchema), saveSubjectPeriods);

// Class-level subject mapping (default pool for a class)
router
    .route("/class/:class_id")
    .get(allowRoles("school_admin", "teacher"), getClassSubjects)
    .put(allowRoles("school_admin"), setClassSubjects);

// Section-level raw override rows (for the override editor UI)
// NOTE: /overrides suffix route must come before the shorter /section/:class_id/:section_id
router
    .route("/section/:class_id/:section_id/overrides")
    .get(allowRoles("school_admin"), getSectionOverrides)
    .put(allowRoles("school_admin"), setSectionOverrides);

// Section-level resolved subjects (class default + overrides applied) — used by timetables, exams, etc.
router
    .route("/section/:class_id/:section_id")
    .get(allowRoles("school_admin", "teacher"), getResolvedSubjectsForSection);

// ─── Subject catalog CRUD (must come after specific routes) ───
router
    .route("/")
    .get(allowRoles("school_admin", "teacher"), getAllSubjects)
    .post(allowRoles("school_admin"), validate(createSubjectSchema), createSubject);

router
    .route("/:id")
    .patch(allowRoles("school_admin"), validate(updateSubjectSchema), updateSubject)
    .delete(allowRoles("school_admin"), deleteSubject);

export default router;
