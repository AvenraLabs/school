# SchoolIQ API Specification & Endpoints Guide

Base URL: `https://admin.avenra.org/api` (Production) or `http://localhost:3002/api` (Local)
Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

---

## 1. Auth Module (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/login` | Public | Authenticates user (username/phone + password). Returns JWT token. Enforces active profile status checks. |
| POST | `/logout` | Authenticated | Revokes session, clears server-side refresh records. |
| POST | `/change-password` | Authenticated | Changes current user password. |
| PATCH | `/admin/users/:userId/reset-password` | Admin | Resets a target user's password. |
| PATCH | `/profile` | Authenticated | Updates name and avatar URL. |

---

## 2. Core Administration Modules

### Schools (`/api/schools`)
- `GET /` (Super Admin): List all registered schools.
- `POST /` (Super Admin): Create new school instance.
- `GET /:id` (Admin): Get school details and configuration settings.
- `PATCH /:id` (Admin): Update school settings, logo, risk thresholds, library rules.
- `PATCH /:id/modules` (Super Admin): Update `enabled_modules` JSON payload (7 core module toggles).

### Academic Years (`/api/academic-years`)
- `GET /` | `POST /` | `PATCH /:id/set-current` | `DELETE /:id`

### Classes & Sections (`/api/classes`, `/api/sections`)
- `GET /api/classes` | `POST /api/classes` | `PATCH /api/classes/:id` | `DELETE /api/classes/:id`
- `GET /api/sections` | `POST /api/sections` | `PATCH /api/sections/:id` | `DELETE /api/sections/:id`

### Subjects (`/api/subjects`)

CRUD for the school-wide subject catalog.

- `GET /` (Admin, Teacher): List all school subjects.
- `POST /` (Admin): Create a new subject.
- `PATCH /:id` (Admin): Update a subject.
- `DELETE /:id` (Admin): Delete a subject.

### Class Subject Mapping
- `GET /class/:class_id` (Admin, Teacher): Get the default subject pool for a class.
- `PUT /class/:class_id` (Admin): Replace the default subjects for a class. Body: `{ subject_ids: number[] }`.

### Section-Level Resolved Subjects
- `GET /section/:class_id/:section_id` (Admin, Teacher): **Smart endpoint** — returns the resolved subject list for a specific section (class default + section overrides applied). Used by timetables, exams, and homework dropdowns.

### Section Subject Overrides
- `GET /section/:class_id/:section_id/overrides` (Admin): Get raw override rows for a section (for the override editor UI).
- `PUT /section/:class_id/:section_id/overrides` (Admin): Replace override rows for a section. Body: `{ overrides: [{subject_id, is_included}] }`. Only store delta rows — `is_included=false` excludes a class default subject; `is_included=true` adds a subject not in class default.
- `GET /` | `POST /` | `PATCH /:id` | `DELETE /:id`

---

## 3. Personnel & Students

### Students (`/api/students`)
- `GET /` — List students (filtered by class, section, status, search).
- `POST /` — Register/create student profile.
- `GET /me` — Current student profile details.
- `GET /:id` — Detailed student profile view.
- `PATCH /:id` — Update student profile details.
- `DELETE /:id` — Delete student profile.
- `GET /dashboard` — Student dashboard metrics & stats.

### Teachers (`/api/teachers`)
- `GET /` — List teachers.
- `POST /` — Register/create teacher profile.
- `GET /me` — Current teacher profile.
- `GET /:id` — Detailed teacher profile.
- `PATCH /:id` — Update teacher profile.
- `GET /dashboard` — Teacher dashboard metrics.

### Approvals & Audit (`/api/approvals`, `/api/audit`)
- `GET /teachers/pending` | `PATCH /teachers/:id/approve` | `PATCH /teachers/:id/reject`
- `GET /students/pending` | `PATCH /students/:id/approve` | `PATCH /students/:id/reject`
- `GET /profile-update-requests` | `PATCH /profile-update-requests/:id/approve` | `PATCH /profile-update-requests/:id/reject`
- `GET /audit-logs` — Audit history of approval decisions.

### Bulk Operations (`/api/bulk`)
- `POST /teachers/import` — CSV/Excel bulk teacher import.
- `POST /students/import` — CSV/Excel bulk student import.
- `POST /promotion/execute` — Term/Year student class promotion wizard.

---

## 4. Attendance & Scheduling

### Attendance (`/api/teachers/attendance`, `/api/students/attendance`)
- `POST /teachers/attendance` — Mark daily class attendance.
- `POST /teachers/attendance/send-absent-whatsapp` — Manually dispatch WhatsApp absent alerts to parents of students marked absent today.
- `GET /teachers/attendance/daily` — Get attendance list for a given date, class, section.
- `GET /teachers/attendance/summary` — Class-level monthly/annual summary.
- `GET /students/attendance/summary` — Individual student attendance percentage & history.
- `GET /teachers/attendance/analytics` — Class attendance analytics & risk flags.

### Timetables & Substitutions (`/api/timetables`)
- `GET /` | `POST /batch` | `DELETE /class/:classId/section/:sectionId`
- `GET /substitutions` | `POST /substitutions` | `DELETE /substitutions/:id`

### Teacher Assignments (`/api/teacher-assignments`)
- `GET /` | `POST /` | `DELETE /:id` — Map teachers to subject & class/section.

---

## 5. Academics, Examinations & Report Cards

### Exams & Exam Masters (`/api/exams`, `/api/exam-masters`)
- `GET /api/exam-masters` | `POST /api/exam-masters` — Exam master templates.
- `GET /api/exams` (Admin, Teacher, Student): List exams for a class. Optional query param `section_id` to include stream-specific exams alongside class-wide exams.
- `POST /api/exams` (Admin, Teacher): Create exam. Body: `{ class_id, section_id?, name, subjects? }`. Optional `section_id` scopes exam to a specific section stream (e.g. 12-A Science vs 12-B Commerce).
- `POST /api/exams/:id/lock` — Lock/unlock exam.
- `PUT /api/exams/:id/subjects` — Assign subjects, max marks, and syllabus to exam.

### Report Cards & Marks Entry (`/api/report-cards`)
- `GET /marks` | `POST /marks/batch` — Bulk marks entry for an exam subject.
- `GET /student/:studentId` — Full report card summary for student across all terms.
- `GET /grading-scales` | `POST /grading-scales` — Manage grading boundaries.

---

## 6. Financial Management

### Fee Management (`/api/fees`)
- `GET /categories` | `POST /categories` — Fee categories.
- `GET /definitions` | `POST /definitions` — Define fee structure per class/year.
- `GET /students` — Query student fee status (pending/partial/paid/overdue).
- `POST /payments` — Record fee payment receipt.
- `POST /payments/:id/void` — Void payment receipt.

### Expenses (`/api/expenses`)
- `GET /categories` | `POST /categories` — Expense categories.
- `GET /` | `POST /` | `PATCH /:id/cancel` — Record voucher & cancel expenses.

---

## 7. Library Management (`/api/library`)

- `GET /books` | `POST /books` | `PATCH /books/:id` — Manage library books catalog.
- `GET /issues` | `POST /issues` | `PATCH /issues/:id/return` — Issue/return book.

---

## 8. Transport & Live Tracking (`/api/transport`)

- `GET /drivers` | `POST /drivers` | `GET /vehicles` | `POST /vehicles`
- `GET /allocations` | `POST /allocations` — Assign students to bus routes.
- `POST /trips/start` | `POST /trips/end` | `POST /trips/location` — Live GPS logging.
- `GET /trips/active` — Active trip live location stream.
- `GET /requests` | `POST /requests` | `PATCH /requests/:id/status` — Transport requests.

---

## 9. AI, Gamification & RAG Services

### RAG Student Learning Assistant (`/api/rag`)
- `GET /chat/sessions` | `POST /chat/sessions` — RAG student chat threads.
- `POST /chat/messages` — Ask question to AI textbook assistant.
- `GET /chapters` — Available textbook chapter metadata.

### Teacher AI Tools (`/api/teacher-ai`)
- `POST /generate-question-paper` — Generate custom exam papers using AI.
- `POST /generate-lesson-plan` — Generate lesson plans.
- `GET /documents` | `GET /documents/:id` | `PATCH /documents/:id` — Saved AI documents.

### AI Video Generation (`/api/ai/videos`)
- `POST /generate` | `GET /status/:id` | `GET /` — Generate 3D animation videos via Kling AI.

### Token Quotas & AI Analytics (`/api/tokens`, `/api/ai-analytics`)
- `GET /tokens/policy` | `PATCH /tokens/policy` (Super Admin) — Role token quotas.
- `GET /tokens/account` — User token balance check.
- `GET /ai-analytics` — Usage & prompt audit logs.
- `GET /api/analytics/ai/integration-logs` (Super Admin) — Query live JSON integration logs (Gemini, Kling, WhatsApp, Maps).

### Gamification & Quizzes (`/api/quiz`, `/api/quizzes`, `/api/game`)
- `GET /api/quizzes` | `POST /api/quizzes` — Teacher assigned quizzes.
- `POST /api/quiz/student-submit` — Student quiz submission.
- `POST /api/game/create` | `POST /api/game/join` — Live Kahoot-style socket game room.

---

## 10. Communication & Utilities

- `POST /api/homework` | `GET /api/homework` | `POST /api/homework/:id/submit` — Homework module.
- `POST /api/notifications` | `GET /api/notifications` | `POST /api/notifications/:id/ack` — Notifications & Posters.
- `GET /api/group-chat/rooms` | `GET /api/group-chat/rooms/:id/messages` — Group chat threads.
- `POST /api/lost-found` | `GET /api/lost-found` — Lost & Found.
- `POST /api/feedback` | `GET /api/feedback` — System feedback & bug reports.
- `GET /api/whatsapp/webhook` — Meta Webhook hub verification challenge endpoint.
- `POST /api/whatsapp/webhook` — Meta Webhook real-time delivery status callback event receiver.
- `POST /api/upload` — File upload endpoint (Images, PDFs, Documents).
