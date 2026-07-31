import asyncHandler from "../../shared/asyncHandler.js";
import {
  createBellScheduleService,
  getBellSchedulesService,
  getBellScheduleByIdService,
  updateBellScheduleService,
  deleteBellScheduleService,
} from "./bell-schedule.service.js";

/* =====================================================
   CREATE BELL SCHEDULE
===================================================== */
export const createBellSchedule = asyncHandler(async (req, res) => {
  const data = await createBellScheduleService({
    school_id: req.user.school_id,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    data,
  });
});

/* =====================================================
   GET ALL BELL SCHEDULES
===================================================== */
export const getBellSchedules = asyncHandler(async (req, res) => {
  const items = await getBellSchedulesService({
    school_id: req.user.school_id,
  });

  res.status(200).json({
    success: true,
    count: items.length,
    items,
  });
});

/* =====================================================
   GET SINGLE BELL SCHEDULE BY ID
===================================================== */
export const getBellScheduleById = asyncHandler(async (req, res) => {
  const data = await getBellScheduleByIdService({
    school_id: req.user.school_id,
    template_id: req.params.id,
  });

  res.status(200).json({
    success: true,
    data,
  });
});

/* =====================================================
   UPDATE BELL SCHEDULE
===================================================== */
export const updateBellSchedule = asyncHandler(async (req, res) => {
  const data = await updateBellScheduleService({
    school_id: req.user.school_id,
    template_id: req.params.id,
    ...req.body,
  });

  res.status(200).json({
    success: true,
    data,
  });
});

/* =====================================================
   DELETE BELL SCHEDULE
===================================================== */
export const deleteBellSchedule = asyncHandler(async (req, res) => {
  await deleteBellScheduleService({
    school_id: req.user.school_id,
    template_id: req.params.id,
  });

  res.status(200).json({
    success: true,
    message: "Bell schedule template deleted successfully",
  });
});
