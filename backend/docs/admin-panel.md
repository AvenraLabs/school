API Reference (Frontend)

Base
Base URL: `/api`
Auth: `Authorization: Bearer <token>` (all protected routes)
School scope: derived from `req.user.school_id` unless explicitly noted (super_admin endpoints).
Pagination: `limit`, `offset` (query) where supported.

Auth
POST `/api/auth/login`
Roles: Public
Request: `{ "username": "string", "password": "string" }`
Response: `{ "token": "jwt" }`

POST `/api/auth/change-password`
Roles: Any authenticated user
Request: `{ "old_password": "string", "new_password": "string" }`
Response: `{ "message": "Password updated successfully" }`


Classes
POST `/api/classes`
Roles: school_admin
Request: `{ "class_name": "string" }`
Response: `{ "success": true, "data": { ... } }`

GET `/api/classes`
Roles: school_admin, teacher
Response: `{ "total": number, "items": [ { class + sections } ] }`

GET `/api/classes/login-roster`
Roles: school_admin
Query: `class_id` (optional), `section_id` (optional)
Response: `{ "success": true, "data": { "teachers": [...], "classes": [...] } }`

GET `/api/classes/:id`
Roles: school_admin, teacher
Response: `{ "success": true, "data": { ... } }`

PATCH `/api/classes/:id`
Roles: school_admin
Request: `{ "class_name": "string" }`
Response: `{ "success": true, "data": { ... } }`

DELETE `/api/classes/:id`
Roles: school_admin
Response: `{ "success": true, "message": "Class deleted successfully" }`

Sections
POST `/api/sections`
Roles: school_admin
Request: `{ "class_id": number, "name": "string" }`
Response: `{ "success": true, "data": { ... } }`

GET `/api/sections/classes/:class_id/sections`
Roles: school_admin, teacher
Response: `{ "total": number, "items": [ { ... } ] }`

PATCH `/api/sections/:id/status`
Roles: school_admin
Request: `{ "is_active": true|false }`
Response: `{ "success": true, "data": { ... } }`

Subjects
POST `/api/subjects`
Roles: school_admin
Request: `{ "name": "string" }`
Response: `{ "success": true, "data": { ... } }`

GET `/api/subjects`
Roles: school_admin, teacher
Response: `{ "total": number, "items": [ { ... } ] }`

PATCH `/api/subjects/:id`
Roles: school_admin
Request: `{ "name": "string" }`
Response: `{ "success": true, "data": { ... } }`

DELETE `/api/subjects/:id`
Roles: school_admin
Response: `{ "success": true, "message": "Subject deleted successfully" }`

Students (admin)
POST `/api/students`
Roles: school_admin
Request: `{ "class_id": number, "section_id": number }`
Response: `{ "created": 1, "student": { ... }, "students": [ ... ] }`

GET `/api/students`
Roles: school_admin
Query: `limit`, `offset`, `class_id?`, `section_id?`
Response: `{ "total": number, "items": [ { student + user + class + section } ] }`

GET `/api/students/options`
Roles: school_admin
Query: `class_id?`, `section_id?`
Response: `{ "total": number, "items": [ { id, class_id, section_id, roll_no, admission_no, user, class, section } ] }`

PATCH `/api/students/:id/move`
Roles: school_admin
Request: `{ "section_id": number }`
Response: `{ "message": "Student moved", "student": { ... } }`

PATCH `/api/students/:id/status`
Roles: school_admin
Request: `{ "is_active": true|false }`
Response: `{ "message": "Status updated", "student": { ... } }`

POST `/api/students/assign-section`
Roles: school_admin
Request: `{ "target_class_id": number, "target_section_id": number, "students": [ { "student_id": number, "roll_no": number } ] }`
Response: `{ "success": true, "message": "Students assigned successfully" }`


Teachers (admin)
POST `/api/teachers`
Roles: school_admin
Request: `{}` (username/password are ignored; username is auto-generated)
Response: `{ "teacher_id": number, "username": "string", "employee_id": "string", "password_hint": "username@123" }`

GET `/api/teachers`
Roles: school_admin
Query: `limit`, `offset`
Response: `{ "total": number, "items": [ { teacher + user } ] }`

GET `/api/teachers/options`
Roles: school_admin
Response: `{ "total": number, "items": [ { id, user_id, employee_id, approval_status, is_active, user } ] }`

PATCH `/api/teachers/:id/status`
Roles: school_admin
Request: `{ "is_active": true|false }`
Response: `{ "message": "Status updated", "teacher": { ... } }`


POST `/api/admin/teachers/:teacher_id/approve`
Roles: school_admin
Request: `{ "action": "approve|reject" }`
Response: `{ "teacher_id": number, "status": "approve|reject" }`

Teacher Bulk Approval
POST `/api/admin/teachers/bulk-approve`
Roles: school_admin
Request: `{ "teacher_ids": [number], "action": "approve|reject" }`
Response: `{ "processed": number }`

Parents (admin)
POST `/api/parents/parents`
Roles: school_admin
Request: `{ "student_id": number, "relation_type": "mother|father|guardian" }`
Response: `{ "parent_id": number, "username": "string", "student_id": number, "relation_type": "guardian", "password_hint": "username@123" }`

POST `/api/parents/parents/link`
Roles: school_admin
Request: `{ "parent_user_id": number, "student_id": number, "relation_type": "mother|father|guardian" }`
Response: `{ "parent_user_id": number, "student_id": number }`

GET `/api/parents/parents`
Roles: school_admin
Query: `limit`, `offset`, `approval_status` (pending|approved|rejected)
Response: `{ "total": number, "items": [ { parent + user + student (includes student.user) } ] }`

GET `/api/parents/parents/options`
Roles: school_admin
Response: `{ "total": number, "items": [ { id, username, name, phone, is_active } ] }`


POST `/api/admin/parents/:parent_id/approve`
Roles: school_admin
Request: `{ "action": "approve|reject" }`
Response: `{ "parent_id": number, "status": "approve|reject" }`

Parent Bulk Approval
POST `/api/admin/parents/bulk-approve`
Roles: school_admin
Request: `{ "parent_ids": [number], "action": "approve|reject" }`
Response: `{ "processed": number }`


GET `/api/admin/approvals/pending`
Roles: school_admin
Query: `limit`, `offset`, `from_date`, `to_date`
Response: `{ "teachers": { total, items }, "parents": { total, items } }`

POST `/api/admin/approvals/:type/:id/:action`
Roles: school_admin
Params: `type` = student|teacher|parent, `action` = approve|reject
Request: `{ "rejection_reason"?: "string" }`
Response: `{ "message": "Request processed successfully", "result": { ... } }`

Bulk Seeder
POST `/api/bulk/bulk-create`
Roles: school_admin
Request: `{ "classes": [ { "name": "Class 6", "sections": [ { "name": "A", "students": 30 } ] } ], "teacher_count"?: number }`
Response: `{ "message": "Data created successfully", "summary": { classes_created, teachers_created, students_created, ... } }`


Timetables
POST `/api/timetables`
Roles: school_admin, teacher
Request: `{ "class_id": number, "section_id": number, "day_of_week": "monday|tuesday|wednesday|thursday|friday|saturday", "entries": [ { "start_time": "HH:mm", "end_time": "HH:mm", "teacher_assignment_id"?: number, "title"?: "string", "is_break": boolean } ] }`
Response: `{ "success": true, "message": "Timetable saved successfully" }`

GET `/api/timetables/section`
Roles: any authenticated user
Query: `class_id`, `section_id`
Response: `{ "success": true, "data": { "monday": [ ... ], "tuesday": [ ... ] } }`

Teacher Assignments
POST `/api/teacher-assignments`
Roles: school_admin
Request: `{ "teacher_id": number, "class_id": number, "section_id": number, "subject_id": number, "is_class_teacher"?: boolean }`
Response: `{ "success": true, "data": { ... } }`

GET `/api/teacher-assignments`
Roles: school_admin
Query: `limit`, `offset`
Response: `{ "success": true, "total": number, "items": [ ... ] }`

GET `/api/teacher-assignments/teacher/:teacherId`
Roles: school_admin, teacher
Response: `{ "success": true, "data": [ ... ] }`

GET `/api/teacher-assignments/section/:sectionId`
Roles: school_admin, teacher (class teacher for that section)
Response: `{ "success": true, "data": [ ... ] }`

PATCH `/api/teacher-assignments/:id`
Roles: school_admin
Request: `{ "is_active"?: boolean, "is_class_teacher"?: boolean }`
Response: `{ "success": true, "data": { ... } }`

DELETE `/api/teacher-assignments/:id`
Roles: school_admin
Response: `{ "success": true, "message": "..." }`


Notifications
POST `/api/notifications`
Roles: school_admin, teacher
Request: `{ "title": "string", "message": "string", "target_role": "teacher|parent|student|all", "class_id"?: number, "section_id"?: number }`
Response: `{ "success": true, "data": { ... } }`

GET `/api/notifications`
Roles: any authenticated user
Response: `{ "success": true, "total": number, "items": [ ... ] }`

POST `/api/notifications/:id/acknowledge`
Roles: parent, teacher, student
Request: `{}` (no body)
Response: `{ "success": true, "message": "Acknowledged" }`

GET `/api/notifications/:id/acknowledgements`
Roles: school_admin, sender teacher
Response: `{ "success": true, "data": { count, rows } }`


AI Analytics
GET `/api/analytics/ai/school`
Roles: school_admin, super_admin
Query (super_admin): `school_id` (optional)
Response: `[ { total_calls, total_tokens, role } ]`

GET `/api/analytics/ai/school/users`
Roles: school_admin, super_admin
Query (super_admin): `school_id` (optional), `role` (optional)
Response: `[ { user_id, role, total_calls, total_tokens } ]`

GET `/api/analytics/ai/school/classes`
Roles: school_admin, super_admin
Query (super_admin): `school_id` (optional)
Response: `[ { class_id, class_name, total_calls, total_tokens } ]`


AI Tokens & Limits
Notes:
- Token unit = LLM tokens reported by Gemini `usageMetadata.totalTokenCount` (prompt + response).
- Each AI call deducts that token count from the user’s `token_accounts.balance`.
- Monthly token policy is stored in DB and can be set by super_admin.

GET `/api/tokens/policies`
Roles: super_admin
Response: `{ "success": true, "data": [ { role, monthly_tokens, updated_by } ] }`

POST `/api/tokens/policies`
Roles: super_admin
Request: `{ "role": "student|teacher", "monthly_tokens": number, "mode"?: "replace|add", "school_id"?: number }`
Response: `{ "success": true, "message": "Policy updated", "data": { role, monthly_tokens } }`

GET `/api/tokens/accounts`
Roles: super_admin
Query: `school_id` (optional), `role` (optional)
Response: `{ "success": true, "items": [ { user_id, balance, expires_at } ] }`

GET `/api/tokens/transactions`
Roles: super_admin
Query: `school_id` (optional), `user_id` (optional)
Response: `{ "success": true, "items": [ { user_id, type, change, balance_before, balance_after, created_at } ] }`

POST `/api/tokens/users/:userId/adjust`
Roles: super_admin
Request: `{ "amount": number, "mode"?: "add|set" }`
Response: `{ "success": true, "data": { user_id, balance } }`

Audit Logs
GET `/api/admin/audit-logs`
Roles: school_admin
Query: `entity_type`, `entity_id`, `from_date`, `to_date`, `limit`, `offset`
Response: `{ "total": number, "items": [ ... ] }`

Exams & Report Cards
POST `/api/exams`
Roles: school_admin, teacher
Request: `{ "class_id": number, "name": "string", "start_date"?: "YYYY-MM-DD", "end_date"?: "YYYY-MM-DD" }`
Response: `{ "success": true, "data": { ... } }`

POST `/api/exams/:id/lock`
Roles: school_admin
Request: `{ "is_locked": true }`
Response: `{ "success": true, "data": { ... } }`

GET `/api/exams`
Roles: student, parent, teacher
Query: `class_id` (required)
Response: `{ "success": true, "total": number, "items": [ ... ] }`

POST `/api/report-cards`
Roles: school_admin, teacher
Request: `{ "student_id": number, "exam_id": number }`
Response: `{ "success": true, "data": { ... } }`

POST `/api/report-cards/:id/marks`
Roles: school_admin, teacher
Request: `{ "marks": [ { "subject_id": number, "marks_obtained": number, "max_marks": number } ] }`
Response: `{ "success": true, "message": "Marks saved" }`

POST `/api/report-cards/:id/publish`
Roles: school_admin, teacher
Request: `{ "remarks"?: "string" }`
Response: `{ "success": true, "data": { ... } }`

GET `/api/report-cards/:id`
Roles: teacher, student, parent, school_admin
Response: `{ "success": true, "data": { ... } }`

Approvals Dashboard (Admin/Teacher)
GET `/api/teachers/approvals/pending` and `GET /api/admin/approvals/pending`
See Approvals section above.

Sockets (Socket.IO)
Auth: connect with `io(url, { auth: { token: "<jwt>" } })`

Notifications Socket (`notification.socket.js`)
On connect: server joins `school:<school_id>` room
Server emit: `notification:connected` `{ school_id }`
