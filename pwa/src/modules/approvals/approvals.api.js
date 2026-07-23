import api from "../../api/axios";

export const getTeacherPendingApprovals = () =>
    api.get("/teachers/approvals/pending");

export const approveRequest = (type, id, action = 'approve') =>
    api.post(`/teachers/approvals/${type}/${id}/${action}`);

export const getTeacherProfileUpdates = () =>
    api.get("/teachers/approvals/profile-updates");

export const processProfileUpdate = (id, action = 'approve', rejectionReason = '') =>
    api.post(`/teachers/approvals/profile-updates/${id}/process`, { action, rejection_reason: rejectionReason });
