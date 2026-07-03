import asyncHandler from "../../shared/asyncHandler.js";
import {
  listFamiliesService,
  createFamilyService,
  updateFamilyService,
  addStudentToFamilyService,
  removeStudentFromFamilyService,
  getSiblingsService,
} from "./family.service.js";

/* ADMIN: LIST */
export const listFamilies = asyncHandler(async (req, res) => {
  const result = await listFamiliesService({
    school_id: req.user.school_id,
    query: req.query,
  });
  res.json({ total: result.count, items: result.rows });
});

/* ADMIN: CREATE */
export const createFamily = asyncHandler(async (req, res) => {
  const family = await createFamilyService({
    school_id: req.user.school_id,
    ...req.body,
  });
  res.status(201).json({ family });
});

/* ADMIN: UPDATE */
export const updateFamily = asyncHandler(async (req, res) => {
  const family = await updateFamilyService({
    family_id: req.params.id,
    school_id: req.user.school_id,
    ...req.body,
  });
  res.json({ family });
});

/* ADMIN: ADD STUDENT TO FAMILY */
export const addStudentToFamily = asyncHandler(async (req, res) => {
  const result = await addStudentToFamilyService({
    family_id: req.params.id,
    student_id: req.body.student_id,
    school_id: req.user.school_id,
  });
  res.json({ message: "Student added to family", ...result });
});

/* ADMIN: REMOVE STUDENT FROM FAMILY */
export const removeStudentFromFamily = asyncHandler(async (req, res) => {
  const result = await removeStudentFromFamilyService({
    family_id: req.params.id,
    student_id: req.params.student_id,
    school_id: req.user.school_id,
  });
  res.json({ message: "Student removed from family", ...result });
});

/* STUDENT: GET MY SIBLINGS */
export const getMySiblings = asyncHandler(async (req, res) => {
  const siblings = await getSiblingsService({
    student_id: req.user.student_id,
    school_id: req.user.school_id,
  });
  res.json({ items: siblings });
});
