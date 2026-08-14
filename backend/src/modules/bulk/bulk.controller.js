import asyncHandler from "../../shared/asyncHandler.js";
import { bulkCreateDataService } from "./bulk.service.js";
import AppError from "../../shared/appError.js";

export const bulkCreateData = asyncHandler(async (req, res) => {
  const { classes, teacher_count } = req.body;
  const school_id =
    req.body.school_id ||
    req.headers["x-school-id"] ||
    req.headers["school-id"] ||
    req.user?.school_id;

  if (!school_id) {
    throw new AppError(
      "school_id is required for bulk data creation. Please specify a target school.",
      400
    );
  }

  const result = await bulkCreateDataService({
    school_id,
    classes,
    teacher_count,
  });

  res.status(201).json({
    message: "Data created successfully",
    summary: result,
  });
});
