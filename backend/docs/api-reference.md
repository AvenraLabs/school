# API Reference Manual

This document details all REST endpoints and WebSocket protocols within the School ERP and Learning Platform.

## 📌 Global Specifications
- **Base URL**: `/api`
- **Authentication**: JWT token passed in the header as `Authorization: Bearer <token>` (for all non-public routes).
- **Multi-Tenant Scoping**: Automatically determined on the backend via the authenticated user's `school_id`.
- **Response Format**: All JSON responses follow the standard formats documented below.

---

## 🔑 Authentication Module
Endpoints for user session management, credentials switching, and password resets.

### `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "username": "username_here",
    "password": "password_here"
  }
  ```
- **Response (Success)**:
  ```json
  {
    "token": "JWT_TOKEN_STRING"
  }
  ```

### `POST /api/auth/change-password`
- **Access**: All Roles (Protected)
- **Request Body**:
  ```json
  {
    "old_password": "current_password",
    "new_password": "new_secure_password"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password updated successfully"
  }
  ```

### `POST /api/auth/switch-student`
- **Access**: Parent (Protected)
- **Request Body**:
  ```json
  {
    "student_id": 12
  }
  ```
- **Response**: Returns a new JWT token scoped to the selected child.

### `PATCH /api/auth/admin/users/:userId/reset-password`
- **Access**: School Admin (Protected)
- **Response**:
  ```json
  {
    "message": "Password reset to default credentials"
  }
  ```

---

## 🏫 Institutional Setup (Schools, Classes & Sections)
Endpoints for setting up classes, sections, and listing core institutional structures.

### `POST /api/schools`
- **Access**: Super Admin (Protected)
- **Request Body**:
  ```json
  {
    "name": "School Name",
    "address": "School Address (optional)"
  }
  ```

### `GET /api/schools`
- **Access**: Super Admin (Protected)
- **Response**: List of all schools in the system.

### `GET /api/classes`
- **Access**: School Admin, Teacher
- **Response**:
  ```json
  {
    "total": 5,
    "items": [
      {
        "id": 1,
        "class_name": "Class 6",
        "sections": [...]
      }
    ]
  }
  ```

### `POST /api/classes`
- **Access**: School Admin
- **Request Body**: `{ "class_name": "Class Name" }`

### `POST /api/sections`
- **Access**: School Admin
- **Request Body**: `{ "class_id": 1, "name": "A" }`

### `GET /api/sections/classes/:class_id/sections`
- **Access**: School Admin, Teacher
- **Response**: Lists all sections under the class.

---

## 🧑‍🎓 Student Workspace
Onboarding and profile management endpoints for students.

### `POST /api/students/complete-profile`
- **Access**: Student (First Login)
- **Request Body**:
  ```json
  {
    "name": "Student Full Name",
    "phone": "Contact Phone (optional)",
    "dob": "YYYY-MM-DD",
    "gender": "male|female|other",
    "blood_group": "A+",
    "father_name": "Father Name",
    "mother_name": "Mother Name"
  }
  ```

### `GET /api/students/me`
- **Access**: Student (Protected)
- **Response**: Current student profile, including class and section details.

### `GET /api/students/dashboard`
- **Access**: Student (Protected)
- **Response**: Learning analytics summary including attendance percentages, active homework counts, exam trends, and subject averages.

### `PATCH /api/students/profile/request`
- **Access**: Student (Protected)
- **Request Body**: Profile updates (profile pic, address, parents' details) submitted for teacher review.

---

## 👩‍🏫 Teacher Workspace & Assignments
Endpoints for teacher records, dashboard summaries, and mapping educators to classes.

### `POST /api/teachers/complete-profile`
- **Access**: Teacher (First Login)
- **Request Body**: `{ "name", "phone", "gender", "designation", "qualification" }`

### `GET /api/teachers/me`
- **Access**: Teacher (Protected)

### `GET /api/teachers/dashboard`
- **Access**: Teacher (Protected)
- **Response**: Unified statistics including AI token balances and counts of pending homework tasks and grading tasks.

### `POST /api/teacher-assignments`
- **Access**: School Admin
- **Request Body**:
  ```json
  {
    "teacher_id": 1,
    "class_id": 2,
    "section_id": 3,
    "subject_id": 4,
    "is_class_teacher": true
  }
  ```

---

## 📝 Exams, Grading & Report Cards
Endpoints for scheduling exams, entering student grades, and publishing report cards.

### `GET /api/exam-masters`
- **Access**: Admin, Teacher
- **Response**: List of global exam master definitions (e.g. "Term 1", "Finals").

### `POST /api/exams`
- **Access**: Admin, Teacher
- **Request Body**:
  ```json
  {
    "class_id": 1,
    "name": "Term 1 Midterm",
    "start_date": "2026-07-10",
    "end_date": "2026-07-20"
  }
  ```

### `PUT /api/exams/:id/subjects`
- **Access**: Admin, Teacher
- **Request Body**:
  ```json
  {
    "subject_id": 2,
    "exam_date": "2026-07-12",
    "syllabus": "Chapters 1 to 3"
  }
  ```

### `POST /api/exams/:id/lock`
- **Access**: School Admin
- **Request Body**: `{ "is_locked": true }`

### `POST /api/report-cards/:id/marks`
- **Access**: Admin, Teacher
- **Request Body**:
  ```json
  {
    "marks": [
      {
        "subject_id": 1,
        "marks_obtained": 85,
        "max_marks": 100
      }
    ]
  }
  ```

### `POST /api/report-cards/:id/publish`
- **Access**: Admin, Teacher
- **Request Body**: `{ "remarks": "Excellent progress overall." }`

---

## 📅 Attendance Tracker
Session and daily attendance logs.

### `POST /api/teachers/attendance`
- **Access**: Teacher
- **Request Body**:
  ```json
  {
    "teacher_class_session_id": 5,
    "records": [
      {
        "student_id": 10,
        "status": "present|absent|leave"
      }
    ]
  }
  ```

### `GET /api/teachers/attendance/summary`
- **Access**: Teacher
- **Query Params**: `class_id`, `section_id`, `from_date`, `to_date`

---

## 🧠 AI Capabilities & Token Accounting
Integrations with ChromaDB RAG and Google Gemini LLM API, with custom token limits.

### `POST /api/rag/ask`
- **Access**: Student, Teacher
- **Request Body**:
  ```json
  {
    "question": "What is friction?",
    "classLevel": "6",
    "subject": "Science"
  }
  ```
- **Response**: Returns a response retrieved exclusively from uploaded textbook chapters, along with precise page/chapter citations.

### `POST /api/teacher/ai`
- **Access**: Teacher
- **Request Body**:
  ```json
  {
    "aiType": "question_paper|summary",
    "payload": {
      "topic": "Photosynthesis",
      "marks": 50
    }
  }
  ```

### `GET /api/tokens/policies`
- **Access**: Super Admin
- **Response**: Role-based token ceilings for Students and Teachers.

### `POST /api/tokens/policies`
- **Access**: Super Admin
- **Request Body**:
  ```json
  {
    "role": "student|teacher",
    "monthly_tokens": 150000
  }
  ```

---

## 🔌 WebSockets (Socket.IO)

Clients connect to the Socket.IO server by passing their JWT token:
```javascript
const socket = io(SERVER_URL, {
  auth: { token: "JWT_TOKEN" }
});
```

### 🎮 Multiplayer Game Socket (`game.socket.js`)
- **`quiz:join`** (Client Emit): Join room. `{ sessionId }`
- **`quiz:joined`** (Server Emit): Confirmation. `{ sessionId, playerId, isHost }`
- **`quiz:start`** (Client Emit): Host starts challenge.
- **`quiz:question`** (Server Emit): Delivers question. `{ question, questionIndex, totalQuestions }`
- **`quiz:answer`** (Client Emit): Submit option index. `{ sessionId, questionId, selectedIndex }`

### 💬 Group Chat Socket (`group-chat.socket.js`)
- **`group:join`** (Client Emit): Join group chat room. `{ chatId }`
- **`group:message`** (Client Emit): Send text/image. `{ chatId, type, text, imageUrl }`
- **`group:message:new`** (Server Emit): Delivers incoming message to room members.

### 🔔 Notifications Socket (`notification.socket.js`)
- **`notification:connected`** (Server Emit): Fired on connection establishment. Scopes user into `school:<school_id>` channel.
