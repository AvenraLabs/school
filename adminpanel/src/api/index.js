import axiosInstance from './axios';

export const authAPI = {
  login: async (username, password) => {
    const response = await axiosInstance.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await axiosInstance.post('/auth/change-password', {
      old_password: oldPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  resetUserPassword: async (userId, newPassword) => {
    const response = await axiosInstance.patch(`/admin/users/${userId}/reset-password`, {
      new_password: newPassword,
    });
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await axiosInstance.patch('/auth/profile', profileData);
    return response.data;
  },
};

// School APIs (Super Admin)
export const schoolAPI = {
  create: async (schoolData) => {
    const response = await axiosInstance.post('/schools', schoolData);
    return response.data;
  },

  list: async (limit = 10, offset = 0) => {
    const response = await axiosInstance.get('/schools', {
      params: { limit, offset },
    });
    return response.data;
  },

  getStats: async (schoolId, params = {}) => {
    const response = await axiosInstance.get(`/schools/${schoolId}/stats`, { params });
    return response.data;
  },

  updateAdminStatus: async (schoolId, isActive) => {
    const response = await axiosInstance.patch(`/schools/${schoolId}/admin-status`, {
      is_active: isActive,
    });
    return response.data;
  },

  resetAdminPassword: async (schoolId, newPassword) => {
    const response = await axiosInstance.patch(`/schools/${schoolId}/admin-reset-password`, {
      new_password: newPassword,
    });
    return response.data;
  },

  getDirectory: async () => {
    const response = await axiosInstance.get('/schools/directory');
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await axiosInstance.get('/schools/dashboard-stats');
    return response.data;
  },

  getSchoolAnalytics: async () => {
    const response = await axiosInstance.get('/analytics/school');
    return response.data;
  },

  getSectionRoster: async (sectionId) => {
    const response = await axiosInstance.get(`/schools/directory/sections/${sectionId}`);
    return response.data;
  },


  getStudentProfile: async (studentId) => {
    const response = await axiosInstance.get(`/schools/directory/students/${studentId}`);
    return response.data;
  },

  getStudentAttendanceLogs: async (studentId) => {
    const response = await axiosInstance.get(`/schools/directory/students/${studentId}/attendance-logs`);
    return response.data;
  },

  update: async (schoolId, schoolData) => {
    const response = await axiosInstance.patch(`/schools/${schoolId}`, schoolData);
    return response.data;
  },
};

// Classes API
export const classesAPI = {
  create: async (className) => {
    const response = await axiosInstance.post('/classes', {
      class_name: className,
    });
    return response.data;
  },

  list: async () => {
    const response = await axiosInstance.get('/classes');
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/classes/${id}`);
    return response.data;
  },

  update: async (id, className) => {
    const response = await axiosInstance.patch(`/classes/${id}`, {
      class_name: className,
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/classes/${id}`);
    return response.data;
  },

  getLoginRoster: async (classId, sectionId) => {
    const params = {};
    if (classId) params.class_id = classId;
    if (sectionId) params.section_id = sectionId;
    const response = await axiosInstance.get('/classes/login-roster', { params });
    return response.data;
  },
};

// Sections API
export const sectionsAPI = {
  create: async (classId, name, studentCount = 0) => {
    const response = await axiosInstance.post('/sections', {
      class_id: classId,
      name,
      student_count: studentCount,
    });
    return response.data;
  },

  getByClass: async (classId) => {
    const response = await axiosInstance.get(`/sections/classes/${classId}/sections`);
    return response.data;
  },

  updateStatus: async (id, isActive) => {
    const response = await axiosInstance.patch(`/sections/${id}/status`, {
      is_active: isActive,
    });
    return response.data;
  },
};

// Subjects API
export const subjectsAPI = {
  create: async (name) => {
    const response = await axiosInstance.post('/subjects', { name });
    return response.data;
  },

  list: async () => {
    const response = await axiosInstance.get('/subjects');
    return response.data;
  },

  update: async (id, name) => {
    const response = await axiosInstance.patch(`/subjects/${id}`, { name });
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/subjects/${id}`);
    return response.data;
  },
};

// Teachers API
export const teachersAPI = {
  create: async () => {
    const response = await axiosInstance.post('/teachers', {});
    return response.data;
  },

  list: async (limit = 10, offset = 0, status, approvalStatus) => {
    const params = { limit, offset };
    if (status) params.status = status;
    if (approvalStatus) params.approval_status = approvalStatus;
    const response = await axiosInstance.get('/teachers', { params });
    return response.data;
  },

  getOptions: async () => {
    const response = await axiosInstance.get('/teachers/options');
    return response.data;
  },

  updateStatus: async (id, status, reason) => {
    const response = await axiosInstance.patch(`/teachers/${id}/status`, {
      status,
      reason,
    });
    return response.data;
  },

  approve: async (id, action, rejectionReason) => {
    const response = await axiosInstance.post(`/admin/teachers/${id}/approve`, {
      action,
      rejection_reason: rejectionReason,
    });
    return response.data;
  },

  bulkApprove: async (teacherIds, action) => {
    const response = await axiosInstance.post('/admin/teachers/bulk-approve', {
      teacher_ids: teacherIds,
      action,
    });
    return response.data;
  },
};

// Students API
export const studentsAPI = {
  create: async (classId, sectionId) => {
    const response = await axiosInstance.post('/students', {
      class_id: classId,
      section_id: sectionId,
    });
    return response.data;
  },

  list: async (limit = 10, offset = 0, classId, sectionId, status, approvalStatus) => {
    const params = { limit, offset };
    if (classId) params.class_id = classId;
    if (sectionId) params.section_id = sectionId;
    if (status) params.status = status;
    if (approvalStatus) params.approval_status = approvalStatus;
    const response = await axiosInstance.get('/students', { params });
    return response.data;
  },

  getOptions: async (classId, sectionId) => {
    const params = {};
    if (classId) params.class_id = classId;
    if (sectionId) params.section_id = sectionId;
    const response = await axiosInstance.get('/students/options', { params });
    return response.data;
  },

  moveStudent: async (id, sectionId) => {
    const response = await axiosInstance.patch(`/students/${id}/move`, {
      section_id: sectionId,
    });
    return response.data;
  },

  updateStatus: async (id, status, reason) => {
    const response = await axiosInstance.patch(`/students/${id}/status`, {
      status,
      reason,
    });
    return response.data;
  },

  assignSection: async (targetClassId, targetSectionId, students) => {
    const response = await axiosInstance.post('/students/assign-section', {
      target_class_id: targetClassId,
      target_section_id: targetSectionId,
      students,
    });
    return response.data;
  },

  bulkApprove: async (studentIds, action) => {
    const response = await axiosInstance.post('/admin/students/bulk-approve', {
      student_ids: studentIds,
      action,
    });
    return response.data;
  },
};


// Bulk API
export const bulkAPI = {
  createData: async (data) => {
    const response = await axiosInstance.post('/bulk/bulk-create', data);
    return response.data;
  },
};

// Approvals API
export const approvalsAPI = {
  getPending: async (limit = 10, offset = 0, fromDate, toDate, type) => {
    const params = { limit, offset };
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    if (type) params.type = type;
    const response = await axiosInstance.get('/admin/approvals/pending', { params });
    return response.data;
  },

  approveRequest: async (type, id, action, rejectionReason) => {
    const response = await axiosInstance.post(`/admin/approvals/${type}/${id}/${action}`, {
      rejection_reason: rejectionReason,
    });
    return response.data;
  },

  listProfileUpdates: async () => {
    const response = await axiosInstance.get('/admin/approvals/profile-updates');
    return response.data;
  },

  processProfileUpdate: async (id, action, rejectionReason) => {
    const response = await axiosInstance.post(`/admin/approvals/profile-updates/${id}/process`, {
      action,
      rejection_reason: rejectionReason,
    });
    return response.data;
  },
};

// Timetable API
export const timetableAPI = {
  create: async (classId, sectionId, dayOfWeek, entries) => {
    const response = await axiosInstance.post('/timetables', {
      class_id: classId,
      section_id: sectionId,
      day_of_week: dayOfWeek,
      entries,
    });
    return response.data;
  },

  getSection: async (classId, sectionId) => {
    const response = await axiosInstance.get('/timetables/section', {
      params: { class_id: classId, section_id: sectionId },
    });
    return response.data;
  },
};

// Teacher Assignments API
export const teacherAssignmentsAPI = {
  create: async (teacherId, classId, sectionId, subjectId, isClassTeacher) => {
    const response = await axiosInstance.post('/teacher-assignments', {
      teacher_id: teacherId,
      class_id: classId,
      section_id: sectionId,
      subject_id: subjectId,
      is_class_teacher: isClassTeacher,
    });
    return response.data;
  },

  list: async (limit = 10, offset = 0) => {
    const response = await axiosInstance.get('/teacher-assignments', {
      params: { limit, offset },
    });
    return response.data;
  },

  getByTeacher: async (teacherId) => {
    const response = await axiosInstance.get(`/teacher-assignments/teacher/${teacherId}`);
    return response.data;
  },

  getBySection: async (sectionId) => {
    const response = await axiosInstance.get(`/teacher-assignments/section/${sectionId}`);
    return response.data;
  },

  update: async (id, isActive, isClassTeacher) => {
    const response = await axiosInstance.patch(`/teacher-assignments/${id}`, {
      is_active: isActive,
      is_class_teacher: isClassTeacher,
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/teacher-assignments/${id}`);
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  create: async (title, message, targetRole, classId, sectionId, sendWhatsApp, imageUrl) => {
    const response = await axiosInstance.post('/notifications', {
      title,
      message,
      target_role: targetRole,
      class_id: classId,
      section_id: sectionId,
      send_whatsapp: sendWhatsApp,
      image_url: imageUrl,
    });
    return response.data;
  },

  list: async (params = {}) => {
    const response = await axiosInstance.get('/notifications', { params });
    return response.data;
  },

  acknowledge: async (id) => {
    const response = await axiosInstance.post(`/notifications/${id}/acknowledge`, {});
    return response.data;
  },

  getAcknowledgements: async (id) => {
    const response = await axiosInstance.get(`/notifications/${id}/acknowledgements`);
    return response.data;
  },
};

// Exams API
export const examsAPI = {
  create: async (classId, name, subjects = []) => {
    const response = await axiosInstance.post('/exams', {
      class_id: classId,
      name,
      subjects,
    });
    return response.data;
  },

  list: async (classId) => {
    const response = await axiosInstance.get('/exams', {
      params: { class_id: classId },
    });
    return response.data;
  },

  lock: async (id, isLocked) => {
    const response = await axiosInstance.post(`/exams/${id}/lock`, {
      is_locked: isLocked,
    });
    return response.data;
  },

  // Add/update a single subject slot within an exam
  upsertSubject: async (examId, subjectId, examDate, syllabus) => {
    const response = await axiosInstance.put(`/exams/${examId}/subjects`, {
      subject_id: subjectId,
      exam_date: examDate,
      syllabus,
    });
    return response.data;
  },

  removeSubject: async (examId, subjectId) => {
    const response = await axiosInstance.delete(`/exams/${examId}/subjects/${subjectId}`);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosInstance.delete(`/exams/${id}`);
    return response.data;
  },
};

// Exam Master API (reusable exam names)
export const examMastersAPI = {
  list: async () => {
    const response = await axiosInstance.get('/exam-masters');
    return response.data;
  },
  create: async (name) => {
    const response = await axiosInstance.post('/exam-masters', { name });
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/exam-masters/${id}`);
    return response.data;
  },
};

// Report Cards API
export const reportCardsAPI = {
  create: async (studentId, examId) => {
    const response = await axiosInstance.post('/report-cards', {
      student_id: studentId,
      exam_id: examId,
    });
    return response.data;
  },

  setMarks: async (id, marks, remarks) => {
    const response = await axiosInstance.post(`/report-cards/${id}/marks`, {
      marks,
      remarks,
    });
    return response.data;
  },

  publish: async (id, remarks) => {
    const response = await axiosInstance.post(`/report-cards/${id}/publish`, {
      remarks,
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/report-cards/${id}`);
    return response.data;
  },

  list: async (classId, examId) => {
    const response = await axiosInstance.get('/report-cards', {
      params: { class_id: classId, exam_id: examId },
    });
    return response.data;
  },

  getGradingScales: async () => {
    const response = await axiosInstance.get('/report-cards/grading-scales');
    return response.data;
  },

  saveGradingScales: async (scales) => {
    const response = await axiosInstance.post('/report-cards/grading-scales', { scales });
    return response.data;
  },
};

// Token Policies API (Super Admin)
export const tokenPoliciesAPI = {
  list: async () => {
    const response = await axiosInstance.get('/tokens/policies');
    return response.data;
  },

  update: async (role, monthlyTokens, mode = 'replace') => {
    const response = await axiosInstance.post('/tokens/policies', {
      role,
      monthly_tokens: monthlyTokens,
      mode,
    });
    return response.data;
  },

  // Sets both student + teacher policies in one call
  updateBoth: async (studentMonthly, teacherMonthly, mode = 'replace') => {
    const response = await axiosInstance.post('/tokens/policies', {
      student_monthly: studentMonthly,
      teacher_monthly: teacherMonthly,
      mode,
    });
    return response.data;
  },

  getAccounts: async (schoolId, role, limit = 50, offset = 0) => {
    const params = { limit, offset };
    if (schoolId) params.school_id = schoolId;
    if (role) params.role = role;
    const response = await axiosInstance.get('/tokens/accounts', { params });
    return response.data;
  },

  getTransactions: async (schoolId, userId, limit = 50, offset = 0) => {
    const params = { limit, offset };
    if (schoolId) params.school_id = schoolId;
    if (userId) params.user_id = userId;
    const response = await axiosInstance.get('/tokens/transactions', { params });
    return response.data;
  },

  adjustUserTokens: async (userId, amount, mode = 'add') => {
    const response = await axiosInstance.post(`/tokens/users/${userId}/adjust`, {
      amount,
      mode,
    });
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  getAISchoolData: async () => {
    const response = await axiosInstance.get('/analytics/ai/school');
    return response.data;
  },

  getAIUserData: async (role) => {
    const params = {};
    if (role) params.role = role;
    const response = await axiosInstance.get('/analytics/ai/school/users', { params });
    return response.data;
  },

  getAIClassData: async () => {
    const response = await axiosInstance.get('/analytics/ai/school/classes');
    return response.data;
  },
};

// Audit Logs API
export const auditLogsAPI = {
  list: async (entityType, entityId, fromDate, toDate, limit = 10, offset = 0) => {
    const params = { limit, offset };
    if (entityType) params.entity_type = entityType;
    if (entityId) params.entity_id = entityId;
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    const response = await axiosInstance.get('/admin/audit-logs', { params });
    return response.data;
  },
};

// Transport API
export const transportAPI = {
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/transport/dashboard-stats');
    return response.data;
  },

  listTrips: async (params = {}) => {
    const response = await axiosInstance.get('/admin/transport/trips', { params });
    return response.data;
  },

  // Drivers CRUD
  listDrivers: async (params = {}) => {
    const response = await axiosInstance.get('/admin/transport/drivers', { params });
    return response.data;
  },
  createDriver: async (driverData) => {
    const response = await axiosInstance.post('/admin/transport/drivers', driverData);
    return response.data;
  },
  updateDriver: async (id, driverData) => {
    const response = await axiosInstance.put(`/admin/transport/drivers/${id}`, driverData);
    return response.data;
  },
  deleteDriver: async (id) => {
    const response = await axiosInstance.delete(`/admin/transport/drivers/${id}`);
    return response.data;
  },

  // Vehicles CRUD
  listVehicles: async (params = {}) => {
    const response = await axiosInstance.get('/admin/transport/vehicles', { params });
    return response.data;
  },
  createVehicle: async (vehicleData) => {
    const response = await axiosInstance.post('/admin/transport/vehicles', vehicleData);
    return response.data;
  },
  updateVehicle: async (id, vehicleData) => {
    const response = await axiosInstance.put(`/admin/transport/vehicles/${id}`, vehicleData);
    return response.data;
  },
  deleteVehicle: async (id) => {
    const response = await axiosInstance.delete(`/admin/transport/vehicles/${id}`);
    return response.data;
  },

  // Assignments
  listAssignments: async (params = {}) => {
    const response = await axiosInstance.get('/admin/transport/assignments', { params });
    return response.data;
  },
  assignStudent: async (student_id, vehicle_id, pickup_point) => {
    const response = await axiosInstance.post('/admin/transport/assignments', { student_id, vehicle_id, pickup_point });
    return response.data;
  },
  unassignStudent: async (student_id) => {
    const response = await axiosInstance.delete(`/admin/transport/assignments/${student_id}`);
    return response.data;
  },

  // Change Requests
  listRequests: async (params = {}) => {
    const response = await axiosInstance.get('/admin/transport/requests', { params });
    return response.data;
  },
  processRequest: async (id, action, rejection_reason) => {
    const response = await axiosInstance.post(`/admin/transport/requests/${id}/${action}`, { rejection_reason });
    return response.data;
  },
};

export const academicYearsAPI = {
  list: async () => {
    const response = await axiosInstance.get('/academic-years');
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/academic-years', data);
    return response.data;
  },
  setCurrent: async (id) => {
    const response = await axiosInstance.patch(`/academic-years/${id}/current`);
    return response.data;
  },
  getPreview: async (data) => {
    const response = await axiosInstance.post('/academic-years/preview', data);
    return response.data;
  },
  promote: async (data) => {
    const response = await axiosInstance.post('/academic-years/promote', data);
    return response.data;
  },
};

export const lostFoundAPI = {
  list: async (params = {}) => {
    const response = await axiosInstance.get('/lost-found', { params });
    return response.data;
  },
  listMy: async (params = {}) => {
    const response = await axiosInstance.get('/lost-found/my', { params });
    return response.data;
  },
  create: async (data) => {
    const response = await axiosInstance.post('/lost-found', data);
    return response.data;
  },
  close: async (id) => {
    const response = await axiosInstance.patch(`/lost-found/${id}/status`, { status: 'CLOSED' });
    return response.data;
  },
  delete: async (id) => {
    const response = await axiosInstance.delete(`/lost-found/${id}`);
    return response.data;
  },
};

export const feedbackAPI = {
  submit: async (data) => {
    const response = await axiosInstance.post('/feedback', data);
    return response.data;
  },
  manage: async (params = {}) => {
    const response = await axiosInstance.get('/feedback/manage', { params });
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await axiosInstance.patch(`/feedback/${id}/status`, { status });
    return response.data;
  },
};

export const uploadAPI = {
  uploadAnnouncement: async (file) => {
    const formData = new FormData();
    formData.append('announcement', file);
    const response = await axiosInstance.post('/upload/announcement', formData);
    return response.data;
  },
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axiosInstance.post('/upload/avatar', formData);
    return response.data;
  },
  deleteFile: async (filePath) => {
    const response = await axiosInstance.post('/upload/delete-file', { filePath });
    return response.data;
  },
};

