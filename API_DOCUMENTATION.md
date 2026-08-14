# SchoolIQ API Specification & Endpoints Guide

Base URL: `https://admin.avenra.org/api` (Production) or `http://localhost:3002/api` (Local)
Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`

---

## 1. Auth Module (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/login` | Public | Authenticates user (username/phone + password). Returns access token & refresh token. Enforces active profile status checks. |
| POST | `/refresh-token` | Public | Exchanges a valid, non-revoked refresh token for a new access token & rotated refresh token (`/refresh` alias). |
| POST | `/logout` | Authenticated | Revokes session, clears server-side refresh records. |
| POST | `/change-password` | Authenticated | Changes current user password and revokes active refresh tokens. |
| PATCH | `/admin/users/:userId/reset-password` | Admin | Resets a target user's password and revokes active refresh tokens. |
| PATCH | `/profile` | Authenticated | Updates name and avatar URL. |

---

## 2. Core Administration Modules

### Schools (`/api/schools`)
- `GET /` (Super Admin): List all registered schools.
- `POST /` (Super Admin): Create new school instance and school admin user. Payload: `{ name, code?, board?, address?, phone?, email?, admin_username, admin_password, admin_name? }`.
- `GET /:id` (Admin): Get school details and configuration settings.
- `PATCH /:id` (Admin): Update school settings, logo, risk thresholds, library rules.
- `PATCH /:id/modules` (Super Admin): Update `enabled_modules` JSON payload (7 core module toggles).


### Academic Years (`/api/academic-years`)
- `GET /` (Admin) — List all academic sessions for the school.
- `POST /` (Admin) — Create a new academic session. Body: `{ name, start_date, end_date, is_current? }`.
- `PATCH /:id/current` (Admin) — Set the target academic session as the active current year.
- `POST /preview` (Admin) — Get student progression and promotion preview report.
- `POST /promote` (Admin) — Execute annual promotion migration wizard.

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
- `POST /bulk-create` (Super Admin, School Admin) — Bulk institutional data seeder. Accepts `{ school_id?, classes: [{ name, sections: [{ name, students }] }], teacher_count? }`. Resolves `school_id` from payload body, `x-school-id` header, or authenticated user session. Performs transactional creation of classes, sections, student accounts, and teacher accounts.
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
- `GET /dashboard` — Unified finance dashboard analytics. Returns 6 KPI metrics: `this_month_collection`, `this_month_expenses`, `pending_fees`, `net_cash_flow_year`, `total_fees_collected`, `total_expenses`, plus `monthly_trends` and `expense_distribution`.
- `GET /daily-report` — Fee collection audit report register. Accepts `date` (YYYY-MM-DD; if omitted, returns all-time collection records), `mode`, `search`, `page`, `limit`.

### Expenses (`/api/expenses`)
- `GET /categories` | `POST /categories` — Expense categories.
- `GET /` | `POST /` | `PATCH /:id/cancel` — Record voucher & cancel expenses.

---

## 7. Library Management (`/api/library`)

- `GET /books` | `POST /books` | `PATCH /books/:id` — Manage library books catalog (Book No, Book Title, Total Copies Count, Cover Photo).
- `GET /issues` | `POST /issues` | `PATCH /issues/:id/return` — Issue/return book.

---

## 8. Transport & Live Tracking (`/api/transport`)

- `GET /admin/transport/drivers` | `POST /admin/transport/drivers` | `PUT /admin/transport/drivers/:id` — Manage drivers and password resets.
- `GET /admin/transport/vehicles` | `POST /admin/transport/vehicles` | `PUT /admin/transport/vehicles/:id` — Manage school bus fleet.
- `GET /admin/transport/assignments` | `POST /admin/transport/assignments` — Allocate students to bus vehicles.
- `GET /admin/transport/requests` | `POST /admin/transport/requests/:id/:action` — Admin desk to list, approve, or reject student bus change requests.
- `POST /driver/transport/trips/start` | `POST /driver/transport/trips/:id/stop` | `POST /driver/transport/trips/:id/location` — Driver live GPS tracking.
- `GET /student/transport/me` | `POST /student/transport/requests` — Student bus info and bus assignment requests.

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

### AI Video Generation & Diagrams (`/api/ai/videos`)
- `POST /api/ai/videos` — Create content generation job. Zod-validated payload:
  - `topic` (required), `subjectName` or `subjectId` (required), `classId`, `language`, `duration` (`"4"|"6"|"8"`), `content_type` (`"diagram_only"` *(default)* | `"diagram_and_video"`)
  - `diagram_only`: responds immediately (`status: "completed"`) with `imageUrl` and `summary` — **no polling needed**.
  - `diagram_and_video`: responds with `jobId` for polling; background queue runs Imagen + Veo concurrently via `Promise.allSettled`.
  - Quotas: Deducts 1 credit from `image_generation_balance` (row locked, atomic). Gemini prompt tokens deducted dynamically via `usageMetadata`. Video seconds deducted only for `diagram_and_video`. Auto-refunded on job failure.
- `GET /api/ai/videos/stream/:id` — Public video streaming (HTTP 206 byte-range proxy from GCS).
- `GET /api/ai/videos/teacher/my-videos` — Teacher's generated content with pagination (`page`, `limit`, `subjectName`). Returns `{ videos, subjects: [{ subject_name, count }], pagination: { total, page, limit, totalPages, hasMore } }`.
- `GET /api/ai/videos/student/class-videos` — Student's class content with pagination (`page`, `limit`, `subjectName`). Returns `{ subjects: [{ subject_name, items }], subjectCounts: [{ subject_name, count }], videos, pagination }`.
- `DELETE /api/ai/videos/:id` — Delete video/diagram record (RBAC: Super Admin, School Admin, or owner Teacher).
- `GET /api/ai/videos/:id` — Poll job status. Response includes `imageUrl`, `summary`, `contentType` in addition to existing `videoUrl`/`streamUrl` fields.
- `DELETE /api/ai/videos/:id` — Delete generation record. **RBAC Enforced**: Allowed only for `school_admin`, `super_admin`, or the creator `teacher` (HTTP 403 Forbidden otherwise).


### Token Quotas & AI Analytics (`/api/tokens`, `/api/ai-analytics`)
- `GET /api/tokens/policies` | `POST /api/tokens/policies` (Super Admin) — Configure role annual AI tokens, video seconds, and diagram image quotas per `school_id` (or global baseline `school_id: null` in `replace` / `top-up` modes).
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
- `POST /api/notifications/push-subscribe` — Save device VAPID Push subscription (`{ subscription: { endpoint, keys: { p256dh, auth } } }`).
- `POST /api/notifications/push-unsubscribe` — Unsubscribe device from background push (`{ endpoint }`).
- `GET /api/notifications/vapid-public-key` — Returns server VAPID public key (`{ publicKey }`).
- `GET /api/group-chat/rooms` | `GET /api/group-chat/rooms/:id/messages` — Group chat threads.
- `POST /api/lost-found` | `GET /api/lost-found` — Lost & Found.
- `POST /api/feedback` | `GET /api/feedback` — System feedback & bug reports.
- `GET /api/whatsapp/webhook` — Meta Webhook hub verification challenge endpoint.
- `POST /api/whatsapp/webhook` — Meta Webhook real-time delivery status callback event receiver.
- `POST /api/upload` — File upload endpoint (Images, PDFs, Documents).

---

## 11. Library Module (`/api/library`)

- `GET /api/library/settings` | `PATCH /api/library/settings` — Get and update library configuration (loan period, overdue reminder days, fine per day).
- `GET /api/library/books` | `POST /api/library/books` | `PATCH /api/library/books/:id` — Manage catalog books.
- `PATCH /api/library/books/:id/archive` | `PATCH /api/library/books/:id/unarchive` — Archive or restore catalog book.
- `POST /api/library/issues` — Issue a book copy to a student or teacher. Payload: `{ book_id: number, borrower_type?: "student"|"teacher", student_id?: number, teacher_id?: number, user_id?: number, due_date?: string }`. Automatically calculates `due_date` using school `library_loan_period_days` (default 14 days) if omitted. Dynamically resolves borrower ID if `user_id` is supplied.
- `PATCH /api/library/issues/:id/return` — Return or process action on issued book. Payload: `{ status: "returned" | "lost" | "damaged", fine_amount?: number, remarks?: string }`. Default status is `"returned"`. Automatically calculates overdue fine based on per-day rate if `fine_amount` is omitted.
- `PATCH /api/library/issues/:id/cancel` — Cancel an issue record.
- `PATCH /api/library/issues/:id/undo-return` — Undo a return action.
- `GET /api/library/issues` — List circulation active loans and history logs.
- `GET /api/library/my-library` — Student / Teacher personal library loans overview (PWA).
- `GET /api/library/reports/books` | `report/issued` | `report/overdue` | `report/lost` — Library reporting registers.

---

## 12. Bell Schedules & Auto Timetable Generator (`/api/bell-schedules`, `/api/timetable-generation`, `/api/subjects/periods`)

- `GET /api/bell-schedules` | `POST /api/bell-schedules` — List and bulk save bell schedule templates + periods (School Admin).
- `PATCH /api/bell-schedules/:id` | `DELETE /api/bell-schedules/:id` — Update or delete a bell schedule template.
- `PUT /api/subjects/periods` — Bulk update subject periods per week allocations per class or section override.
- `GET /api/timetable-generation/readiness` — Pre-flight readiness check (missing teachers, unset periods_per_week, teacher capacity overload).
- `POST /api/timetable-generation/run` — Trigger async non-blocking timetable generation job (`timetable_generation_jobs`).
- `GET /api/timetable-generation/:jobId` — Check generation job status and retrieve generated candidate draft schedule.
- `POST /api/timetable-generation/:jobId/confirm` — Confirm, collision-verify, and publish candidate timetable draft into live `timetables` database table inside a transaction.

---

## 13. 3D Anatomy Explorer Module (`/student/anatomy`, `/teacher/anatomy`)

- Isolated client-side PWA module (`pwa/src/modules/anatomy/`) running natively with `@react-three/fiber` & Three.js.
- Interactive 3D Human Anatomy Models: Heart, Brain, Lungs, Kidneys, Eye, Liver, Skeleton, Skin.
- Features: Touch camera orbit controls, 3D hotspot annotations, clinical considerations, system category filters, organ search, and self-assessment quizzes.

---

## 14. Teacher AI & RAG Question Paper Generator (`/api/teacher-ai`, `/api/rag/curriculum`)

- `POST /api/teacher-ai/generate` — Generate curriculum-aligned structured content (Question Papers with marking schemes, Lesson Plans, Summaries) using textbook RAG context & Gemini AI. Accessible by `school_admin`, `teacher`, and `super_admin`.
- `POST /api/teacher-ai/documents` — Save generated question papers and teaching drafts to the school library.
- `GET /api/teacher-ai/documents` — List saved teacher AI documents and question papers filtered by type (`type=question_paper`).
- `GET /api/teacher-ai/documents/:id` | `PUT /api/teacher-ai/documents/:id` | `DELETE /api/teacher-ai/documents/:id` — CRUD operations for saved question papers and teaching documents.
- `GET /api/rag/curriculum/subjects` — Retrieve distinct subjects with indexed textbook chapters for a board & grade.
- `GET /api/rag/curriculum/chapters` — Retrieve indexed syllabus chapters for a board, grade, and subject.
- `GET /api/rag/curriculum/grades` — Retrieve available ingested grades for a board.




