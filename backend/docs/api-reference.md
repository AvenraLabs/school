# School ERP - Backend API Reference

Welcome to the official developer API reference for the Kiddo School ERP system. This document catalogs all **153 backend API endpoints** configured in the server.

## Overview & Global Design
- **Base URL**: All endpoints are relative to the root server domain (e.g., `https://api.yourschool.com`).
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <JWT_TOKEN>` (for protected endpoints)
- **Multi-Tenancy**: Most tables and queries scope operations automatically using the `school_id` claims extracted from the JWT token.
- **Tenant Scope**: Cross-tenant data leaks are strictly prevented via DB row-level scoping.

---

## API Endpoint Directory by Module

- [Academic Years Module (#academic-years)] - 5 endpoints
- [Ai Analytics Module (#ai-analytics)] - 5 endpoints
- [Approvals Module (#approvals)] - 4 endpoints
- [Attendance Module (#attendance)] - 5 endpoints
- [Audit Module (#audit)] - 1 endpoints
- [Auth Module (#auth)] - 4 endpoints
- [Bulk Module (#bulk)] - 1 endpoints
- [Classes Module (#classes)] - 6 endpoints
- [Game Module (#game)] - 6 endpoints
- [Group Chat Module (#group-chat)] - 4 endpoints
- [Homework Module (#homework)] - 5 endpoints
- [Notifications Module (#notifications)] - 4 endpoints
- [Quiz Module (#quiz)] - 2 endpoints
- [Rag Module (#rag)] - 1 endpoints
- [Report Cards Module (#report-cards)] - 14 endpoints
- [Schools Module (#schools)] - 11 endpoints
- [Sections Module (#sections)] - 3 endpoints
- [Students Module (#students)] - 18 endpoints
- [Teacher Ai Module (#teacher-ai)] - 2 endpoints
- [Teacher Assignments Module (#teacher-assignments)] - 7 endpoints
- [Teachers Module (#teachers)] - 10 endpoints
- [Timetables Module (#timetables)] - 3 endpoints
- [Tokens Module (#tokens)] - 5 endpoints
- [Transport Module (#transport)] - 27 endpoints

---

## Academic Years Module <a name="academic-years"></a>

> Endpoints to configure and query academic years for scoping student data, marks, and timetables.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/academic-years/` | 🔓 No | Public | - | `listAcademicYears` | [academic-year.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/academic-years/academic-year.routes.js) |
| `POST` | `/api/academic-years/` | 🔓 No | Public | - | `createAcademicYear` | [academic-year.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/academic-years/academic-year.routes.js) |
| `PATCH` | `/api/academic-years/:id/current` | 🔓 No | Public | - | `setCurrentAcademicYear` | [academic-year.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/academic-years/academic-year.routes.js) |
| `POST` | `/api/academic-years/preview` | 🔓 No | Public | - | `getPromotionPreview` | [academic-year.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/academic-years/academic-year.routes.js) |
| `POST` | `/api/academic-years/promote` | 🔓 No | Public | - | `promoteAcademicYear` | [academic-year.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/academic-years/academic-year.routes.js) |

---

## Ai Analytics Module <a name="ai-analytics"></a>

> Analytical endpoints tracking AI prompts, response logs, token usage, and system-wide credits.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/ai/school` | 🔒 Yes | Any Logged In | - | `"super_admin"` | [ai-analytics.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/ai-analytics/ai-analytics.routes.js) |
| `GET` | `/api/analytics/ai/school/classes` | 🔒 Yes | Any Logged In | - | `"super_admin"` | [ai-analytics.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/ai-analytics/ai-analytics.routes.js) |
| `GET` | `/api/analytics/ai/school/users` | 🔒 Yes | Any Logged In | - | `"super_admin"` | [ai-analytics.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/ai-analytics/ai-analytics.routes.js) |
| `GET` | `/api/analytics/ai/student` | 🔒 Yes | Any Logged In | - | Dynamic | [ai-analytics.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/ai-analytics/ai-analytics.routes.js) |
| `GET` | `/api/analytics/ai/teacher` | 🔒 Yes | Any Logged In | - | Dynamic | [ai-analytics.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/ai-analytics/ai-analytics.routes.js) |

---

## Approvals Module <a name="approvals"></a>

> Pipeline endpoints for administrative verification of teacher and student onboarding profile updates.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/approvals/:type/:id/:action` | 🔒 Yes | Any Logged In | - | Dynamic | [approval.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/approvals/approval.routes.js) |
| `GET` | `/api/admin/approvals/pending` | 🔒 Yes | Any Logged In | - | Dynamic | [approval.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/approvals/approval.routes.js) |
| `POST` | `/api/teachers/approvals/:type/:id/:action` | 🔒 Yes | Any Logged In | - | Dynamic | [approval.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/approvals/approval.routes.js) |
| `GET` | `/api/teachers/approvals/pending` | 🔒 Yes | Any Logged In | - | Dynamic | [approval.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/approvals/approval.routes.js) |

---

## Attendance Module <a name="attendance"></a>

> APIs to mark daily attendance, check class registers, and retrieve analytical attendance history.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/attendance/students/attendance/summary` | 🔒 Yes | Any Logged In | - | Dynamic | [attendance.summary.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/attendance/attendance.summary.routes.js) |
| `POST` | `/api/attendance/teachers/attendance` | 🔒 Yes | Any Logged In | - | `"school_admin"` | [attendance.summary.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/attendance/attendance.summary.routes.js) |
| `GET` | `/api/attendance/teachers/attendance/analytics` | 🔒 Yes | Any Logged In | - | Dynamic | [attendance.analytics.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/attendance/attendance.analytics.routes.js) |
| `GET` | `/api/attendance/teachers/attendance/daily` | 🔒 Yes | Any Logged In | - | `"school_admin"` | [attendance.summary.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/attendance/attendance.summary.routes.js) |
| `GET` | `/api/attendance/teachers/attendance/summary` | 🔒 Yes | Any Logged In | - | `"school_admin"` | [attendance.summary.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/attendance/attendance.summary.routes.js) |

---

## Audit Module <a name="audit"></a>

> System audit logs recording admin-level configurations and general resource creations.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/audit-logs` | 🔒 Yes | Any Logged In | - | `"super_admin"` | [audit.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/audit/audit.routes.js) |

---

## Auth Module <a name="auth"></a>

> Endpoints for user authentication, session creation, switching student profiles, and administrator password resets.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `PATCH` | `/api/auth/admin/users/:userId/reset-password` | 🔒 Yes | Any Logged In | - | `adminResetUserPassword` | [auth.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/auth/auth.routes.js) |
| `POST` | `/api/auth/change-password` | 🔒 Yes | Any Logged In | - | Dynamic | [auth.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/auth/auth.routes.js) |
| `POST` | `/api/auth/login` | 🔓 No | Public | - | Dynamic | [auth.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/auth/auth.routes.js) |
| `POST` | `/api/auth/switch-student` | 🔒 Yes | Any Logged In | - | `switchStudent` | [auth.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/auth/auth.routes.js) |

---

## Bulk Module <a name="bulk"></a>

> CSV bulk upload and ingestion utilities for onboarding entire school databases (rosters, teachers, schedules).

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/bulk/bulk-create` | 🔒 Yes | Any Logged In | - | Dynamic | [bulk.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/bulk/bulk.routes.js) |

---

## Classes Module <a name="classes"></a>

> APIs for setting up curriculum levels (e.g. Class 1 to 12) within the institution.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/classes/` | 🔓 No | Public | - | `"teacher"` | [classes.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/classes/classes.routes.js) |
| `POST` | `/api/classes/` | 🔓 No | Public | - | Dynamic | [classes.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/classes/classes.routes.js) |
| `DELETE` | `/api/classes/:id` | 🔓 No | Public | - | Dynamic | [classes.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/classes/classes.routes.js) |
| `GET` | `/api/classes/:id` | 🔓 No | Public | - | `"teacher"` | [classes.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/classes/classes.routes.js) |
| `PATCH` | `/api/classes/:id` | 🔓 No | Public | - | Dynamic | [classes.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/classes/classes.routes.js) |
| `GET` | `/api/classes/login-roster` | 🔓 No | Public | - | Dynamic | [classes.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/classes/classes.routes.js) |

---

## Game Module <a name="game"></a>

> Lobby and active status endpoints for educational multiplayer live games.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/game/quiz/:sessionId/leaderboard` | 🔓 No | Public | - | `"teacher"` | [game.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/game/game.routes.js) |
| `GET` | `/api/game/quiz/history` | 🔓 No | Public | - | `"teacher"` | [game.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/game/game.routes.js) |
| `POST` | `/api/game/quiz/multi/create` | 🔓 No | Public | - | `"teacher"` | [game.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/game/game.routes.js) |
| `POST` | `/api/game/quiz/multi/join` | 🔓 No | Public | - | `"teacher"` | [game.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/game/game.routes.js) |
| `POST` | `/api/game/quiz/single/start` | 🔓 No | Public | - | `"teacher"` | [game.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/game/game.routes.js) |
| `POST` | `/api/game/quiz/single/submit` | 🔓 No | Public | - | `"teacher"` | [game.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/game/game.routes.js) |

---

## Group Chat Module <a name="group-chat"></a>

> Real-time class chat room endpoints scoped by subject, section, and enrolled students.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/group-chat/` | 🔓 No | Public | - | `listGroupChats` | [group-chat.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/group-chat/group-chat.routes.js) |
| `POST` | `/api/group-chat/` | 🔓 No | Public | - | Dynamic | [group-chat.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/group-chat/group-chat.routes.js) |
| `DELETE` | `/api/group-chat/:chatId` | 🔓 No | Public | - | `"school_admin"` | [group-chat.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/group-chat/group-chat.routes.js) |
| `GET` | `/api/group-chat/:chatId/messages` | 🔓 No | Public | - | `getGroupMessagesController` | [group-chat.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/group-chat/group-chat.routes.js) |

---

## Homework Module <a name="homework"></a>

> Homework creation, submission tracking, student status registers, and submission analytics.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/homework/` | 🔓 No | Public | - | Dynamic | [homework.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/homework/homework.routes.js) |
| `POST` | `/api/homework/` | 🔓 No | Public | - | `"teacher"` | [homework.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/homework/homework.routes.js) |
| `POST` | `/api/homework/:homework_id/submit` | 🔓 No | Public | - | Dynamic | [homework.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/homework/homework.routes.js) |
| `GET` | `/api/homework/analytics/:homework_id/students` | 🔓 No | Public | - | `getHomeworkStudentStatus` | [homework.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/homework/homework.routes.js) |
| `GET` | `/api/homework/analytics/summary` | 🔓 No | Public | - | `getHomeworkSummary` | [homework.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/homework/homework.routes.js) |

---

## Notifications Module <a name="notifications"></a>

> APIs to dispatch push-like dashboard notifications to students, parents, or staff roles.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications/` | 🔓 No | Public | - | `listNotifications` | [notification.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/notifications/notification.routes.js) |
| `POST` | `/api/notifications/` | 🔓 No | Public | - | `"teacher"` | [notification.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/notifications/notification.routes.js) |
| `POST` | `/api/notifications/:id/acknowledge` | 🔒 Yes | Any Logged In | - | `acknowledgeNotification` | [notification.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/notifications/notification.routes.js) |
| `GET` | `/api/notifications/:id/acknowledgements` | 🔒 Yes | Any Logged In | - | `listNotificationAcks` | [notification.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/notifications/notification.routes.js) |

---

## Quiz Module <a name="quiz"></a>

> Quiz engines for CBSE textbook questions, supporting single-player training and multiplayer classroom games.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/quiz/` | 🔓 No | Public | - | `"school_admin"` | [quiz.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/quiz/quiz.routes.js) |
| `POST` | `/api/quiz/generate` | 🔓 No | Public | - | `"teacher"` | [quiz.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/quiz/quiz.routes.js) |

---

## Rag Module <a name="rag"></a>

> Retrieval-Augmented Generation endpoints powered by Google Gemini and ChromaDB for zero-hallucination textbook tutoring.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/rag/ask` | 🔒 Yes | Any Logged In | - | `askQuestion` | [rag.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/rag/rag.routes.js) |

---

## Report Cards Module <a name="report-cards"></a>

> Gradebooks, exam setups, assessment details, report card drafts, and publishing triggers.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/exam-masters/` | 🔓 No | Public | - | `"teacher"` | [exam-master.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/report-cards/exam-master.routes.js) |
| `POST` | `/api/exam-masters/` | 🔓 No | Public | - | `"super_admin"` | [exam-master.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/report-cards/exam-master.routes.js) |
| `DELETE` | `/api/exam-masters/:id` | 🔓 No | Public | - | `"super_admin"` | [exam-master.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/report-cards/exam-master.routes.js) |
| `GET` | `/api/exams/` | 🔓 No | Public | - | `listExamsByClass` | [exam.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/report-cards/exam.routes.js) |
| `POST` | `/api/exams/` | 🔓 No | Public | - | `"school_admin"` | [exam.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/report-cards/exam.routes.js) |
| `POST` | `/api/exams/:id/lock` | 🔓 No | Public | - | Dynamic | [exam.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/report-cards/exam.routes.js) |
| `PUT` | `/api/exams/:id/subjects` | 🔓 No | Public | - | `"school_admin"` | [exam.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/report-cards/exam.routes.js) |
| `DELETE` | `/api/exams/:id/subjects/:subject_id` | 🔓 No | Public | - | `"school_admin"` | [exam.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/report-cards/exam.routes.js) |
| `GET` | `/api/report-cards/` | 🔓 No | Public | - | `"teacher"` | [report-card.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/report-cards/report-card.routes.js) |
| `POST` | `/api/report-cards/` | 🔓 No | Public | - | `"teacher"` | [report-card.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/report-cards/report-card.routes.js) |
| `GET` | `/api/report-cards/:id` | 🔓 No | Public | - | `getReportCard` | [report-card.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/report-cards/report-card.routes.js) |
| `POST` | `/api/report-cards/:id/marks` | 🔓 No | Public | - | `"teacher"` | [report-card.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/report-cards/report-card.routes.js) |
| `POST` | `/api/report-cards/:id/publish` | 🔓 No | Public | - | `"teacher"` | [report-card.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/report-cards/report-card.routes.js) |
| `GET` | `/api/report-cards/student/list` | 🔓 No | Public | - | Dynamic | [report-card.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/report-cards/report-card.routes.js) |

---

## Schools Module <a name="schools"></a>

> Institution setup, tenant properties, configuration parameters, and dashboard meta-data.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/schools/` | 🔓 No | Public | - | `listSchools` | [school.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/schools/school.routes.js) |
| `POST` | `/api/schools/` | 🔓 No | Public | - | Dynamic | [school.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/schools/school.routes.js) |
| `PATCH` | `/api/schools/:id/admin-reset-password` | 🔓 No | Public | - | Dynamic | [school.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/schools/school.routes.js) |
| `PATCH` | `/api/schools/:id/admin-status` | 🔓 No | Public | - | Dynamic | [school.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/schools/school.routes.js) |
| `GET` | `/api/schools/:id/stats` | 🔓 No | Public | - | `getSchoolStats` | [school.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/schools/school.routes.js) |
| `PATCH` | `/api/schools/:id/status` | 🔓 No | Public | - | Dynamic | [school.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/schools/school.routes.js) |
| `GET` | `/api/schools/dashboard-stats` | 🔒 Yes | Any Logged In | - | `"super_admin"` | [school.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/schools/school.routes.js) |
| `GET` | `/api/schools/directory` | 🔒 Yes | Any Logged In | - | `"teacher"` | [school.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/schools/school.routes.js) |
| `GET` | `/api/schools/directory/sections/:sectionId` | 🔒 Yes | Any Logged In | - | `"teacher"` | [school.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/schools/school.routes.js) |
| `GET` | `/api/schools/directory/students/:studentId` | 🔒 Yes | Any Logged In | - | `"teacher"` | [school.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/schools/school.routes.js) |
| `GET` | `/api/schools/directory/students/:studentId/attendance-logs` | 🔒 Yes | Any Logged In | - | `"teacher"` | [school.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/schools/school.routes.js) |

---

## Sections Module <a name="sections"></a>

> Setting up subdivisions (e.g., Section A, Section B) within academic classes.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/sections/` | 🔒 Yes | Any Logged In | - | Dynamic | [section.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/sections/section.routes.js) |
| `PATCH` | `/api/sections/:id/status` | 🔒 Yes | Any Logged In | - | Dynamic | [section.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/sections/section.routes.js) |
| `GET` | `/api/sections/classes/:class_id/sections` | 🔒 Yes | Any Logged In | - | `"teacher"` | [section.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/sections/section.routes.js) |

---

## Students Module <a name="students"></a>

> Student profiles, onboarding, profile updates, siblings details, and class placements.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/students/bulk-approve` | 🔒 Yes | Any Logged In | - | Dynamic | [student.bulk.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/student.bulk.routes.js) |
| `GET` | `/api/students/` | 🔒 Yes | Any Logged In | - | `"teacher"` | [student.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/student.routes.js) |
| `POST` | `/api/students/` | 🔒 Yes | Any Logged In | - | Dynamic | [student.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/student.routes.js) |
| `PATCH` | `/api/students/:id/move` | 🔒 Yes | Any Logged In | - | Dynamic | [student.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/student.routes.js) |
| `PATCH` | `/api/students/:id/status` | 🔒 Yes | Any Logged In | - | Dynamic | [student.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/student.routes.js) |
| `POST` | `/api/students/assign-section` | 🔒 Yes | Any Logged In | - | Dynamic | [student.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/student.routes.js) |
| `POST` | `/api/students/complete-profile` | 🔒 Yes | Any Logged In | - | Dynamic | [student.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/student.routes.js) |
| `GET` | `/api/students/dashboard` | 🔒 Yes | Any Logged In | - | Dynamic | [student.dashboard.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/student.dashboard.routes.js) |
| `GET` | `/api/students/families/` | 🔒 Yes | Any Logged In | - | Dynamic | [family.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/family.routes.js) |
| `POST` | `/api/students/families/` | 🔒 Yes | Any Logged In | - | Dynamic | [family.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/family.routes.js) |
| `PUT` | `/api/students/families/:id` | 🔒 Yes | Any Logged In | - | Dynamic | [family.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/family.routes.js) |
| `POST` | `/api/students/families/:id/students` | 🔒 Yes | Any Logged In | - | Dynamic | [family.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/family.routes.js) |
| `DELETE` | `/api/students/families/:id/students/:student_id` | 🔒 Yes | Any Logged In | - | Dynamic | [family.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/family.routes.js) |
| `GET` | `/api/students/families/my-siblings` | 🔒 Yes | Any Logged In | - | Dynamic | [family.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/family.routes.js) |
| `GET` | `/api/students/me` | 🔒 Yes | Any Logged In | - | `getMyProfile` | [student.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/student.routes.js) |
| `GET` | `/api/students/options` | 🔒 Yes | Any Logged In | - | `"teacher"` | [student.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/student.routes.js) |
| `PATCH` | `/api/students/profile/request` | 🔒 Yes | Any Logged In | - | Dynamic | [student.approval.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/student.approval.routes.js) |
| `GET` | `/api/students/teacher/section` | 🔒 Yes | Any Logged In | - | Dynamic | [student.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/students/student.routes.js) |

---

## Teacher Ai Module <a name="teacher-ai"></a>

> AI Co-pilot for teachers to auto-generate question papers, CBSET-aligned plans, and summaries.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/teacher/ai` | 🔒 Yes | Any Logged In | - | Dynamic | [teacher-ai.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teacher-ai/teacher-ai.routes.js) |
| `GET` | `/api/teacher/ai/history` | 🔒 Yes | Any Logged In | - | Dynamic | [teacher-ai.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teacher-ai/teacher-ai.routes.js) |

---

## Teacher Assignments Module <a name="teacher-assignments"></a>

> Map specialist subject teachers to specific class sections.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/teacher-assignments/` | 🔓 No | Public | - | Dynamic | [teacher-assignment.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teacher-assignments/teacher-assignment.routes.js) |
| `POST` | `/api/teacher-assignments/` | 🔓 No | Public | - | Dynamic | [teacher-assignment.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teacher-assignments/teacher-assignment.routes.js) |
| `DELETE` | `/api/teacher-assignments/:id` | 🔓 No | Public | - | Dynamic | [teacher-assignment.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teacher-assignments/teacher-assignment.routes.js) |
| `PATCH` | `/api/teacher-assignments/:id` | 🔓 No | Public | - | Dynamic | [teacher-assignment.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teacher-assignments/teacher-assignment.routes.js) |
| `GET` | `/api/teacher-assignments/section/:sectionId` | 🔓 No | Public | - | `"teacher"` | [teacher-assignment.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teacher-assignments/teacher-assignment.routes.js) |
| `GET` | `/api/teacher-assignments/teacher/:teacherId` | 🔓 No | Public | - | `"teacher"` | [teacher-assignment.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teacher-assignments/teacher-assignment.routes.js) |
| `GET` | `/api/teacher-assignments/teacher/me` | 🔓 No | Public | - | Dynamic | [teacher-assignment.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teacher-assignments/teacher-assignment.routes.js) |

---

## Teachers Module <a name="teachers"></a>

> Teacher profile setup, active rosters, subject assignments, and teacher dashboard summaries.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/admin/teachers/:teacher_id/approve` | 🔒 Yes | Any Logged In | - | Dynamic | [teacher.approval.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teachers/teacher.approval.routes.js) |
| `POST` | `/api/admin/teachers/bulk-approve` | 🔒 Yes | Any Logged In | - | Dynamic | [teacher.bulk.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teachers/teacher.bulk.routes.js) |
| `GET` | `/api/teachers/` | 🔒 Yes | Any Logged In | - | Dynamic | [teacher.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teachers/teacher.routes.js) |
| `POST` | `/api/teachers/` | 🔒 Yes | Any Logged In | - | Dynamic | [teacher.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teachers/teacher.routes.js) |
| `PATCH` | `/api/teachers/:id/status` | 🔒 Yes | Any Logged In | - | Dynamic | [teacher.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teachers/teacher.routes.js) |
| `POST` | `/api/teachers/complete-profile` | 🔒 Yes | Any Logged In | - | Dynamic | [teacher.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teachers/teacher.routes.js) |
| `GET` | `/api/teachers/dashboard` | 🔒 Yes | Any Logged In | - | Dynamic | [teacher-dashboard.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teachers/teacher-dashboard.routes.js) |
| `GET` | `/api/teachers/me` | 🔒 Yes | Any Logged In | - | `getMyProfile` | [teacher.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teachers/teacher.routes.js) |
| `GET` | `/api/teachers/options` | 🔒 Yes | Any Logged In | - | Dynamic | [teacher.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teachers/teacher.routes.js) |
| `PATCH` | `/api/teachers/profile/request` | 🔒 Yes | Any Logged In | - | Dynamic | [teacher.approval.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/teachers/teacher.approval.routes.js) |

---

## Timetables Module <a name="timetables"></a>

> Timetable scheduler for daily periods, classes, sections, and teacher assignments.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/timetables/` | 🔓 No | Public | - | `"teacher"` | [timetable.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/timetables/timetable.routes.js) |
| `GET` | `/api/timetables/section` | 🔓 No | Public | - | `getSectionTimetable` | [timetable.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/timetables/timetable.routes.js) |
| `GET` | `/api/timetables/teacher/me` | 🔓 No | Public | - | Dynamic | [timetable.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/timetables/timetable.routes.js) |

---

## Tokens Module <a name="tokens"></a>

> Credit allocation, billing scopes, and custom token limits for RAG search queries.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/tokens/accounts` | 🔓 No | Public | - | Dynamic | [token.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/tokens/token.routes.js) |
| `GET` | `/api/tokens/policies` | 🔓 No | Public | - | Dynamic | [token.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/tokens/token.routes.js) |
| `POST` | `/api/tokens/policies` | 🔓 No | Public | - | Dynamic | [token.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/tokens/token.routes.js) |
| `GET` | `/api/tokens/transactions` | 🔓 No | Public | - | Dynamic | [token.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/tokens/token.routes.js) |
| `POST` | `/api/tokens/users/:userId/adjust` | 🔓 No | Public | - | Dynamic | [token.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/tokens/token.routes.js) |

---

## Transport Module <a name="transport"></a>

> Real-time bus tracking, driver streaming triggers, active routes, and GPS coordinates reporting.

| Method | Full Endpoint Path | Auth Required | Roles Allowed | Validation Schema | Controller Handler | Source File |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/transport/assignments` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `POST` | `/api/admin/transport/assignments` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `DELETE` | `/api/admin/transport/assignments/:student_id` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `GET` | `/api/admin/transport/dashboard-stats` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `GET` | `/api/admin/transport/drivers` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `POST` | `/api/admin/transport/drivers` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `DELETE` | `/api/admin/transport/drivers/:id` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `PUT` | `/api/admin/transport/drivers/:id` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `GET` | `/api/admin/transport/requests` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `POST` | `/api/admin/transport/requests/:id/:action` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `GET` | `/api/admin/transport/trips` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `GET` | `/api/admin/transport/vehicles` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `POST` | `/api/admin/transport/vehicles` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `DELETE` | `/api/admin/transport/vehicles/:id` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `PUT` | `/api/admin/transport/vehicles/:id` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `GET` | `/api/driver/transport/active-trip` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `GET` | `/api/driver/transport/profile` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `POST` | `/api/driver/transport/trips/:id/location` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `POST` | `/api/driver/transport/trips/:id/stop` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `POST` | `/api/driver/transport/trips/start` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `GET` | `/api/driver/transport/vehicle` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `GET` | `/api/student/transport/me` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `POST` | `/api/student/transport/requests` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `GET` | `/api/student/transport/students/:student_id` | 🔓 No | Public | - | `"school_admin"` | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `GET` | `/api/student/transport/trips/:id/location` | 🔓 No | Public | - | `"school_admin"` | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `GET` | `/api/student/transport/vehicles` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |
| `GET` | `/api/teacher/transport/students` | 🔓 No | Public | - | Dynamic | [transport.routes.js](file:///c:/Users/nessi/Desktop/kiddo_shadow/backend/src/modules/transport/transport.routes.js) |

---


*Document generated automatically on 2026-07-07.*