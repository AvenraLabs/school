import {
  getPendingStudentApprovalsService,
  getPendingTeacherApprovalsService,
  getPendingParentApprovalsService,
} from "./approval.service.js";

/* =========================
   TEACHER DASHBOARD
========================= */
export const getTeacherPendingApprovals = async (req, res, next) => {
  try {
    const result = await getPendingStudentApprovalsService({
      user: req.user,
      class_id: req.query.class_id,
      query: req.query,
    });

    res.json({
      total: result.count,
      items: result.rows,
    });
  } catch (e) {
    next(e);
  }
};

/* =========================
   ADMIN DASHBOARD
========================= */
export const getAdminPendingApprovals = async (req, res, next) => {
  try {
    const { type } = req.query;
    const responseData = {};
    const promises = [];

    if (!type || type === "teacher") {
      promises.push(
        getPendingTeacherApprovalsService({
          user: req.user,
          query: req.query,
        }).then((teachers) => {
          responseData.teachers = {
            total: teachers.count,
            items: teachers.rows,
          };
        })
      );
    }

    if (!type || type === "parent") {
      promises.push(
        getPendingParentApprovalsService({
          user: req.user,
          query: req.query,
        }).then((parents) => {
          responseData.parents = {
            total: parents.count,
            items: parents.rows,
          };
        })
      );
    }

    if (!type || type === "student") {
      promises.push(
        getPendingStudentApprovalsService({
          user: req.user,
          query: req.query,
        }).then((students) => {
          responseData.students = {
            total: students.count,
            items: students.rows,
          };
        })
      );
    }

    await Promise.all(promises);
    res.json(responseData);
  } catch (e) {
    next(e);
  }
};

/* =========================
   ACTION
========================= */
export const approveRejectRequest = async (req, res, next) => {
  try {
    const { type, id, action } = req.params;
    const rejection_reason = req.body?.rejection_reason;

    const result = await import("./approval.service.js").then(m => m.processApprovalAction({
      user: req.user,
      type,
      id,
      action,
      rejection_reason
    }));

    res.json({ message: "Request processed successfully", result });
  } catch (e) {
    next(e);
  }
};
