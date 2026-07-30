import asyncHandler from "../../shared/asyncHandler.js";
import AppError from "../../shared/appError.js";
import {
    createSubjectService,
    getAllSubjectsService,
    updateSubjectService,
    deleteSubjectService,
    getClassSubjectsService,
    setClassSubjectsService,
    getSectionOverridesService,
    setSectionOverridesService,
    getSubjectsForSection,
} from "./subject.service.js";

/* =========================
   CREATE SUBJECT
========================= */
export const createSubject = asyncHandler(async (req, res) => {
    const result = await createSubjectService({
        school_id: req.user.school_id,
        ...req.body,
    });

    if (result.error === "SUBJECT_EXISTS") {
        throw new AppError("Subject with this name already exists", 409);
    }

    res.status(201).json({
        success: true,
        data: result.subject,
    });
});

/* =========================
   GET ALL SUBJECTS
========================= */
export const getAllSubjects = asyncHandler(async (req, res) => {
    const result = await getAllSubjectsService({
        school_id: req.user.school_id,
    });

    res.status(200).json({
        total: result.count,
        items: result.rows,
    });
});

/* =========================
   UPDATE SUBJECT
========================= */
export const updateSubject = asyncHandler(async (req, res) => {
    const result = await updateSubjectService({
        school_id: req.user.school_id,
        subject_id: req.params.id,
        updates: req.body,
    });

    if (result.error === "SUBJECT_NOT_FOUND") {
        throw new AppError("Subject not found", 404);
    }

    if (result.error === "SUBJECT_EXISTS") {
        throw new AppError("Subject with this name already exists", 409);
    }

    res.status(200).json({
        success: true,
        data: result.subject,
    });
});

/* =========================
   DELETE SUBJECT
========================= */
export const deleteSubject = asyncHandler(async (req, res) => {
    const result = await deleteSubjectService({
        school_id: req.user.school_id,
        subject_id: req.params.id,
    });

    if (result.error === "SUBJECT_NOT_FOUND") {
        throw new AppError("Subject not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Subject deleted successfully",
    });
});

/* ============================================================
   CLASS SUBJECT MAPPING
============================================================ */

/**
 * GET /subjects/class/:class_id
 * Returns the default subject pool for a class.
 */
export const getClassSubjects = asyncHandler(async (req, res) => {
    const subjects = await getClassSubjectsService(
        req.user.school_id,
        Number(req.params.class_id)
    );
    res.json({ items: subjects });
});

/**
 * PUT /subjects/class/:class_id
 * Replaces the default subject set for a class.
 * Body: { subject_ids: number[] }
 */
export const setClassSubjects = asyncHandler(async (req, res) => {
    const { subject_ids = [] } = req.body;
    const result = await setClassSubjectsService(
        req.user.school_id,
        Number(req.params.class_id),
        subject_ids.map(Number)
    );
    res.json(result);
});

/* ============================================================
   SECTION SUBJECT OVERRIDES
============================================================ */

/**
 * GET /subjects/section/:class_id/:section_id
 * Returns the RESOLVED subject list for a specific section.
 * Applies class default + section overrides. Used by timetables, exams, etc.
 */
export const getResolvedSubjectsForSection = asyncHandler(async (req, res) => {
    const subjects = await getSubjectsForSection(
        req.user.school_id,
        Number(req.params.class_id),
        Number(req.params.section_id)
    );
    res.json({ items: subjects });
});

/**
 * GET /subjects/section/:class_id/:section_id/overrides
 * Returns the raw override rows only (for the section override editor UI).
 */
export const getSectionOverrides = asyncHandler(async (req, res) => {
    const overrides = await getSectionOverridesService(
        req.user.school_id,
        Number(req.params.class_id),
        Number(req.params.section_id)
    );
    res.json({ items: overrides });
});

/**
 * PUT /subjects/section/:class_id/:section_id/overrides
 * Replaces all override rows for a specific section.
 * Body: { overrides: [{ subject_id, is_included }] }
 */
export const setSectionOverrides = asyncHandler(async (req, res) => {
    const { overrides = [] } = req.body;
    const result = await setSectionOverridesService(
        req.user.school_id,
        Number(req.params.class_id),
        Number(req.params.section_id),
        overrides
    );
    res.json(result);
});
