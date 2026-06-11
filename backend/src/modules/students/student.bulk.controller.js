import { bulkApproveStudentsService } from "./student.bulk.service.js";

export const bulkApproveStudents = async (req, res, next) => {
  try {
    const { student_ids, action } = req.body;
    const result = await bulkApproveStudentsService({
      student_ids,
      action,
      admin_user_id: req.user.id,
      school_id: req.user.school_id,
    });

    res.json(result);
  } catch (e) {
    next(e);
  }
};
