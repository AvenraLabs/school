import asyncHandler from "../../shared/asyncHandler.js";
import {
  checkReadinessService,
  runGenerationJobService,
  getGenerationJobStatusService,
  confirmGenerationJobService,
} from "./timetable-generation.service.js";

/* =====================================================
   GET TIMETABLE GENERATION READINESS CHECK
===================================================== */
export const getReadinessCheck = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const class_id = req.query.class_id ? Number(req.query.class_id) : undefined;

  const data = await checkReadinessService({
    school_id,
    class_id,
  });

  res.status(200).json({
    success: true,
    data,
  });
});

/* =====================================================
   RUN TIMETABLE GENERATION (ASYNC BACKGROUND JOB)
===================================================== */
export const runTimetableGeneration = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const user_id = req.user.id;
  const { class_id, overwrite } = req.body;

  const data = await runGenerationJobService({
    school_id,
    user_id,
    class_id: class_id ? Number(class_id) : undefined,
    overwrite: !!overwrite,
  });

  res.status(202).json({
    success: true,
    message: "Timetable generation job enqueued successfully",
    data,
  });
});

/* =====================================================
   GET TIMETABLE GENERATION JOB STATUS
===================================================== */
export const getGenerationJobStatus = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const jobId = req.params.jobId;

  const data = await getGenerationJobStatusService({
    school_id,
    jobId,
  });

  res.status(200).json({
    success: true,
    data,
  });
});

/* =====================================================
   CONFIRM & PUBLISH TIMETABLE DRAFT TO DATABASE
===================================================== */
export const confirmTimetableGeneration = asyncHandler(async (req, res) => {
  const school_id = req.user.school_id;
  const user_id = req.user.id;
  const jobId = req.params.jobId;
  const { payload_timetable } = req.body;

  const result = await confirmGenerationJobService({
    school_id,
    jobId,
    user_id,
    payload_timetable,
  });

  res.status(200).json({
    success: true,
    ...result,
  });
});
