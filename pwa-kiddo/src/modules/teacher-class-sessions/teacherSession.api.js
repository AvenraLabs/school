import api from "../../api/axios";

export const startClassSession = (data) =>
    api.post("/teacher-class-sessions/start", data);

export const endClassSession = (sessionId) =>
    api.post(`/teacher-class-sessions/${sessionId}/end`);

export const listClassSessions = (date) =>
    api.get("/teacher-class-sessions", { params: date ? { date } : {} });

export const markSessionAttendance = (sessionId, records) =>
    api.post("/attendance/teachers/attendance", {
        teacher_class_session_id: sessionId,
        records,
    });

export const listStudentsBySection = (classId, sectionId) =>
    api.get("/students", {
        params: {
            class_id: classId,
            section_id: sectionId,
            limit: 500,
        },
    });

export const getSessionAttendance = (sessionId) =>
    api.get(`/attendance/teachers/attendance/session/${sessionId}`);
