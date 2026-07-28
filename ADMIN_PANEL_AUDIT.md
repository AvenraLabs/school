# SchoolIQ Admin Panel System Audit & Architectural Specification

> **Document Version**: 1.0.0  
> **Target System**: SchoolIQ Multi-Tenant School ERP Platform  
> **Scope**: Admin Panel Frontend (`adminpanel`), Backend Services (`backend`), Database Architecture (`PostgreSQL / Sequelize`)  
> **Author**: Antigravity Technical Auditing & Architecture Team  

---

# 1. Project Overview

The **SchoolIQ Admin Panel** is a multi-tenant enterprise management application designed for primary, secondary, and higher-education institutions. It enables Super Administrators to manage tenant onboarding, API allocations, system-wide analytics, and token metrics, while empowering School Administrators to handle daily academic operations, student/teacher directories, timetabling, fee collections, transport logistics, library services, exam report cards, and substitute teacher scheduling.

### Tech Stack Specification

| Tier | Technologies / Libraries | Purpose & Implementation Details |
| :--- | :--- | :--- |
| **Frontend Framework** | React v19.2.6, Vite v8.0.12 | Modern SPA architecture with fast HMR build tooling. |
| **Styling & Icons** | Tailwind CSS v4.3.0, Lucide React v0.294.0 | Utility-first CSS styling, custom color palettes, modern icons. |
| **Routing** | React Router DOM v7.18.1 | Client-side routing with role-based route protection (`ProtectedRoute`). |
| **API Client** | Axios v1.6.0 | Custom HTTP client instance (`src/api/axios.js`) with request/response interceptors. |
| **Document Export** | html2canvas v1.4.1, jsPDF v4.2.1 | Client-side PDF rendering for student report cards and fee receipts. |
| **Backend Framework** | Node.js v24, Express.js v5.1.0 | RESTful API server with asynchronous route handlers and middleware. |
| **Database & ORM** | PostgreSQL, Sequelize ORM v6.37.7 | Relational database storage with schema migrations (`sequelize-cli`). |
| **Real-time Engine** | Socket.IO v4.8.3 | WebSockets for live transport tracking, game updates, notifications, chat. |
| **Caching & Storage** | Redis (ioredis v5.4.1), Multer v2.2.0 | Session/cache layer & local multipart file upload handling (`/uploads`, `/storage`). |
| **AI & Vector DB** | Google GenAI (`@google/genai`), ChromaDB v3.2.2 | RAG vector search, AI video generation, and teacher assistant features. |
| **Security & Auth** | Helmet v8.1.0, CORS v2.8.5, JSON Web Token (JWT) v9.0.2 | HTTP security headers, CORS origin verification, JWT session authentication. |

### Routing Structure

The application enforces strict role-based access control via `ProtectedRoute.jsx`:
- **Public Routes**: `/login` (Login), `/privacy` (Privacy Policy), `/terms` (Terms & Conditions).
- **Super Admin Route**: `/super-admin` (Single-page dashboard with tabbed navigation: School Settings, Billing & API Logs, AI Analytics, Tokens, Classes & Sections, Bulk Seeder, Feedback Management).
- **School Admin Layout (`DashboardLayout.jsx`)**: Responsive sidebar and header wrapping the following routes:
  - `/admin/dashboard` — Executive KPIs, quick actions, attendance counters, activity feeds.
  - `/admin/analytics` — Attendance trends, demographic distributions, performance metrics.
  - `/admin/fees` — Tabbed financial management (Dashboard, Fee Collect, Categories, Class Plans, Expenses, Reports).
  - `/admin/directory` — Master multi-filter search registry for students, teachers, and staff.
  - `/admin/bulk-seeder` — CSV/JSON batch data importing tool.
  - `/admin/classes` — Grade level and section creation & management.
  - `/admin/subjects` — Subject catalog and curriculum configuration.
  - `/admin/teachers` — Faculty profile management, status toggles, credentials.
  - `/admin/students` — Student profiles, parent contacts, enrollment management.
  - `/admin/login-roster` — Portal credential generator and access roster.
  - `/admin/approvals` — Pending teacher and student registration approval queue.
  - `/admin/assignments` — Teacher-to-class/subject mapping grid.
  - `/admin/timetables` — Class master timetable builder and grid viewer.
  - `/admin/timetables/substitutions` — Automated/manual teacher substitute assignment.
  - `/admin/transport` — Bus route, vehicle, driver, and stop management with live GPS status.
  - `/admin/notifications` — Campus announcements and push broadcast center.
  - `/admin/exams` — Exam schedule creation, master exam catalog, marks entry, report card publishing.
  - `/admin/academic-year` — Session term configuration and academic year setup.
  - `/admin/audit-logs` — System audit trail tracking admin mutations and security events.
  - `/admin/lost-found` — Campus lost & found item reporting and claim status manager.
  - `/admin/feedback` — In-app feedback submission tool.
  - `/admin/library` — Book cataloging, issue/return circulation, fine management, history, reports.
  - `/admin/about` — System version and institutional profile information.

### State Management
- **`AuthContext.jsx`**: Global authentication state handling `user` profile object, JWT `token`, role parsing (`school_admin`, `super_admin`), login/logout methods, and `localStorage` persistence.
- **`ToastContext.jsx`**: Application-wide alert notifications (success, error, warning, info toasts).
- **Local Component State**: `useState` and `useReducer` for modal visibility, form data, active tab selection, table pagination, search query strings, and filter criteria.

### API Architecture
- **Axios Base Instance**: Configured in `adminpanel/src/api/axios.js` targeting `http://localhost:3002/api` (dev) or environment endpoint.
- **Request Interceptor**: Automatically attaches `Authorization: Bearer <token>` header to outgoing HTTP requests.
- **Response Interceptor**: Intercepts `401 Unauthorized` responses to clear invalid/expired sessions and trigger redirect to `/login`.
- **Multi-Tenant Data Isolation**: Backend middleware automatically scopes Sequelize queries using `req.user.school_id` for school admin operations.

---

# 2. Complete Page Inventory

### 1. Login Page (`/login`)
- **Page Name**: System Login
- **Purpose**: Authenticates school admins, super admins, teachers, and students.
- **Who uses it**: All user roles.
- **Components used**: `LoginPage.jsx`, Tailwind form layout, custom input fields, SVG icons.
- **Main actions**: Submit credentials, toggle password visibility, remember login state.
- **API endpoints called**: `POST /api/auth/login`
- **Tables shown**: None.
- **Forms shown**: Login Form (Username/Email, Password, Role selector fallback).
- **Filters**: None.
- **Search**: None.
- **Export options**: None.
- **Buttons**: `Sign In`, Password reveal toggle.
- **Modals / Drawers**: None.
- **Empty states**: Invalid credentials toast banner.
- **Validation**: Required username & password check, pattern validation.
- **Loading states**: Spinner on `Sign In` button during authentication request.

---

### 2. Super Admin Dashboard (`/super-admin`)
- **Page Name**: Super Admin Governance Platform
- **Purpose**: Multi-tenant administration, school provisioning, API usage monitoring, token tracking, platform analytics, global feedback review.
- **Who uses it**: Super Administrators.
- **Components used**: `SuperAdminPage.jsx`, Tab navigation, modal dialogs, metrics cards.
- **Main actions**: Create school tenant, issue API tokens, update quota limits, generate bulk credentials, review platform feedback.
- **API endpoints called**: `GET /api/schools`, `POST /api/schools`, `PUT /api/schools/:id`, `GET /api/tokens`, `POST /api/tokens`, `GET /api/analytics`, `GET /api/feedback`, `POST /api/bulk/schools`.
- **Tables shown**: Schools Directory Table, API Tokens List, Platform Feedback Submissions.
- **Forms shown**: Create/Edit School Modal Form, Token Allocation Form, Global Seeder Form.
- **Filters**: School status filter (Active/Inactive), Plan filter.
- **Search**: Search schools by name/domain, search tokens.
- **Export options**: Download school credentials CSV, export usage logs.
- **Buttons**: `+ Create School`, `Generate Token`, `View Logs`, `Edit Tenant`, `Save Changes`.
- **Modals**: School Provisioning Modal, Token Creation Modal, Tenant Details Drawer.
- **Empty states**: "No schools registered yet", "No feedback submissions".
- **Validation**: Domain uniqueness check, email format, quota limits non-negative.
- **Loading states**: Skeleton row loaders on table render.

---

### 3. School Admin Dashboard (`/admin/dashboard`)
- **Page Name**: Executive School Dashboard
- **Purpose**: Overview of institutional statistics, quick access to administrative modules, daily attendance counters, recent activity streams.
- **Who uses it**: School Principal, Administrator, Office Staff.
- **Components used**: `Dashboard.jsx`, `StatsCard`, Quick Link Cards, Activity Stream, Attendance Gauges.
- **Main actions**: Quick navigation to fee collection, student registration, attendance summary view.
- **API endpoints called**: `GET /api/schools/my-school`, `GET /api/students/count`, `GET /api/teachers/count`, `GET /api/attendance/summary`, `GET /api/audit/recent`.
- **Tables shown**: Recent Audit Activity List, Today's Absence Summary Table.
- **Forms shown**: None.
- **Filters**: Date range filter for dashboard stats.
- **Search**: Quick global search input.
- **Export options**: Print dashboard summary (PDF).
- **Buttons**: `Collect Fees`, `Add Student`, `Manage Timetable`, `Broadcast Notification`.
- **Modals / Drawers**: Quick-action drawer.
- **Empty states**: "No recent audit activity found".
- **Validation**: N/A.
- **Loading states**: Animated pulse cards during initial statistics fetch.

---

### 4. School Analytics (`/admin/analytics`)
- **Page Name**: Institutional Analytics & Performance
- **Purpose**: Deep analysis of student enrollment distributions, gender ratios, academic performance trends, attendance percentages, AI module usage.
- **Who uses it**: School Leadership, Academic Directors.
- **Components used**: `SchoolAnalyticsPage.jsx`, Visual bar/pie chart containers, Metric breakdown grids.
- **Main actions**: Filter analytics by academic year, grade level, or section; export reports.
- **API endpoints called**: `GET /api/analytics/school-overview`, `GET /api/attendance/analytics`, `GET /api/ai/analytics`.
- **Tables shown**: Grade-wise Enrollment Breakdown, Attendance Percentage by Class.
- **Forms shown**: Date & Class Filter Form.
- **Filters**: Academic Year selector, Grade dropdown, Gender filter.
- **Search**: Class/Subject filter search.
- **Export options**: Export Chart Data to CSV, PDF Summary Download.
- **Buttons**: `Apply Filter`, `Reset`, `Download Analytics Report`.
- **Modals / Drawers**: Detailed Metric Breakdown Modal.
- **Empty states**: "No analytics data recorded for selected period".
- **Validation**: Valid date range selection.
- **Loading states**: Chart skeleton shimmer effects.

---

### 5. Fee Manager (`/admin/fees`)
- **Page Name**: Finance & Fee Management
- **Purpose**: Fee category creation, class fee structure setup, student fee collection, receipt generation, expense tracking, financial reports.
- **Who uses it**: Finance Officer, Accountant, School Admin.
- **Components used**: `FeeManager/index.jsx`, `FeeCollect.jsx`, `FeeCategories.jsx`, `FeeClassPlans.jsx`, `ExpenseManager.jsx`, `FeeReports.jsx`, `FinanceDashboard.jsx`.
- **Main actions**: Collect fee payment, print official receipt, create fee structure, record operational expense, view ledger reports.
- **API endpoints called**: `GET /api/fees/summary`, `GET /api/fees/collect`, `POST /api/fees/collect`, `GET /api/fees/categories`, `POST /api/fees/categories`, `GET /api/fees/plans`, `POST /api/fees/plans`, `GET /api/expenses`, `POST /api/expenses`, `GET /api/fees/reports`.
- **Tables shown**: Student Fee Ledger Table, Fee Categories List, Class Structure Grid, Expense Logs Table, Collection History.
- **Forms shown**: Fee Collection Form (Payment Mode, Discount, Fine, Amount), New Fee Category Form, Class Fee Plan Form, Expense Entry Form.
- **Filters**: Class/Section selector, Payment Status (Paid/Partial/Overdue), Payment Mode (Cash, UPI, Cheque, Bank Transfer).
- **Search**: Search student by admission number, name, or phone.
- **Export options**: Print PDF Fee Receipt, Export Collection Ledger to CSV.
- **Buttons**: `Collect Payment`, `Print Receipt`, `Add Category`, `Create Fee Plan`, `Log Expense`, `Export Ledger`.
- **Modals**: Payment Confirmation Modal, Fee Category Creation Modal, Expense Entry Modal.
- **Empty states**: "No pending fee records found", "No expenses logged this month".
- **Validation**: Amount collected cannot exceed pending balance; required payment mode.
- **Loading states**: Table spinner & button processing state.

---

### 6. School Registry / Directory (`/admin/directory`)
- **Page Name**: Master School Registry
- **Purpose**: Unified searchable database of all students, teachers, parents, and administrative staff with profile access.
- **Who uses it**: School Admin, Front Office Staff.
- **Components used**: `SchoolRegistry.jsx`, Grid/List view toggle, Search filter bar, User Card views.
- **Main actions**: Search directory, view profile card, edit user details, toggle account status.
- **API endpoints called**: `GET /api/students`, `GET /api/teachers`, `GET /api/users`.
- **Tables shown**: Master Registry Table (Name, Role, Class/Department, Phone, Email, Status).
- **Forms shown**: Quick Filter Form, Status Change Form.
- **Filters**: Role filter (Student/Teacher/Staff), Grade filter, Status (Active/Inactive).
- **Search**: Global text search input (matches Name, Phone, Email, ID).
- **Export options**: Export Directory List to CSV.
- **Buttons**: `Toggle View (Grid/Table)`, `Filter`, `Export CSV`, `View Profile`.
- **Modals**: User Profile Quick View Drawer / Modal.
- **Empty states**: "No registry records match the selected filters".
- **Validation**: N/A.
- **Loading states**: Shimmer card grid loaders.

---

### 7. Bulk Seeder (`/admin/bulk-seeder`)
- **Page Name**: Data Import & Bulk Operations
- **Purpose**: Batch upload student, teacher, class, and subject records using CSV or JSON templates.
- **Who uses it**: IT Administrator, Data Entry Staff.
- **Components used**: `BulkSeeder.jsx`, File Upload Drag-and-Drop, Data Preview Grid, Error Logger.
- **Main actions**: Download sample CSV templates, drag & drop data file, validate records, execute bulk import.
- **API endpoints called**: `POST /api/bulk/students`, `POST /api/bulk/teachers`, `POST /api/bulk/classes`.
- **Tables shown**: Batch Import Preview Grid, Validation Errors List.
- **Forms shown**: File Drag-and-Drop Upload Area, Entity Type Selector.
- **Filters**: Entity Type (Students, Teachers, Classes).
- **Search**: Search parsed CSV rows.
- **Export options**: Download Sample CSV Template, Export Error Log.
- **Buttons**: `Download Template`, `Choose File`, `Validate Data`, `Execute Import`.
- **Modals**: Import Results Summary Dialog.
- **Empty states**: "Drag and drop a CSV file here to begin import".
- **Validation**: Column matching validation, duplicate email/admission number check.
- **Loading states**: Progress bar indicator during batch record creation.

---

### 8. Classes Manager (`/admin/classes`)
- **Page Name**: Class & Section Management
- **Purpose**: Define academic classes (e.g., Grade 1 to 12) and assign sections (A, B, C) and class teachers.
- **Who uses it**: Vice Principal, Academic Coordinator, Admin.
- **Components used**: `ClassesManager.jsx`, Class Card Grid, Section List, Modal Form.
- **Main actions**: Add new class, add section, assign class teacher, update capacity limits.
- **API endpoints called**: `GET /api/classes`, `POST /api/classes`, `PUT /api/classes/:id`, `GET /api/sections`, `POST /api/sections`.
- **Tables shown**: Class & Section Directory Table (Class Name, Sections Count, Total Students, Class Teacher).
- **Forms shown**: Create Class Form, Add Section Form, Assign Class Teacher Selector.
- **Filters**: Academic Year selector.
- **Search**: Search classes by name.
- **Export options**: Export Class List to CSV.
- **Buttons**: `+ Add Class`, `+ Add Section`, `Edit Class`, `Assign Teacher`.
- **Modals**: Add/Edit Class Modal, Section Assignment Modal.
- **Empty states**: "No classes configured for this academic year".
- **Validation**: Class name required, section name unique within class.
- **Loading states**: Card loading skeleton.

---

### 9. Subjects Manager (`/admin/subjects`)
- **Page Name**: Subject & Curriculum Catalog
- **Purpose**: Manage academic subject catalog (Mathematics, Physics, English, etc.), subject codes, credits, and elective flags.
- **Who uses it**: Academic Coordinator, School Admin.
- **Components used**: `SubjectsManager.jsx`, Subject Table Grid, Form Modals.
- **Main actions**: Create subject, edit subject code, set subject category (Core/Elective/Lab).
- **API endpoints called**: `GET /api/subjects`, `POST /api/subjects`, `PUT /api/subjects/:id`, `DELETE /api/subjects/:id`.
- **Tables shown**: Subject Master List (Code, Title, Type, Class Mapping, Status).
- **Forms shown**: Subject Creation / Edit Form.
- **Filters**: Subject Type filter (Theory/Practical/Elective).
- **Search**: Search by subject name or subject code.
- **Export options**: Export Subject List to CSV.
- **Buttons**: `+ Add Subject`, `Edit`, `Delete`, `Filter`.
- **Modals**: Subject Form Modal, Delete Confirmation Dialog.
- **Empty states**: "No subjects added to catalog".
- **Validation**: Unique subject code check, title required.
- **Loading states**: Table loading spinner.

---

### 10. Teachers Manager (`/admin/teachers`)
- **Page Name**: Faculty & Staff Directory
- **Purpose**: Teacher onboarding, profile management, status activation, qualification details, contact mapping.
- **Who uses it**: HR Administrator, Principal, School Admin.
- **Components used**: `TeachersManager.jsx`, Faculty Grid/Table, Status Badges, Profile Modals.
- **Main actions**: Add teacher profile, activate/deactivate account, reset password, assign employee ID.
- **API endpoints called**: `GET /api/teachers`, `POST /api/teachers`, `PUT /api/teachers/:id`, `DELETE /api/teachers/:id`.
- **Tables shown**: Teachers Directory Table (Employee ID, Name, Qualification, Phone, Primary Subject, Status).
- **Forms shown**: Teacher Profile Form (Personal Info, Academic Credentials, Contact Details).
- **Filters**: Status filter (Active/Inactive), Subject specialization filter.
- **Search**: Search teacher by name, employee code, or email.
- **Export options**: Export Teacher Roster to CSV / PDF.
- **Buttons**: `+ Add Teacher`, `View Profile`, `Edit Credentials`, `Toggle Status`.
- **Modals**: Add/Edit Teacher Modal, Confirmation Dialog.
- **Empty states**: "No faculty members found".
- **Validation**: Email pattern check, employee ID uniqueness, required phone number.
- **Loading states**: Skeleton table rows.

---

### 11. Students Manager (`/admin/students`)
- **Page Name**: Student Information System (SIS)
- **Purpose**: Complete student lifecycle management, admission entry, profile updates, class assignment, parent details.
- **Who uses it**: Admissions Officer, School Admin, Office Clerks.
- **Components used**: `StudentsManager.jsx`, Student Data Grid, Profile Modals, Photo Uploader.
- **Main actions**: Register new student, edit student details, assign to class/section, record roll number.
- **API endpoints called**: `GET /api/students`, `POST /api/students`, `PUT /api/students/:id`, `DELETE /api/students/:id`.
- **Tables shown**: Master Student Roster (Admission No, Roll No, Name, Class & Section, Gender, Parent Phone, Status).
- **Forms shown**: Student Admission Form (Personal Details, Guardian Details, Academic Allocation).
- **Filters**: Class & Section dropdown filter, Gender filter, Status filter.
- **Search**: Search student by name, admission number, or phone.
- **Export options**: Export Student Directory to CSV / PDF.
- **Buttons**: `+ Add Student`, `Edit Profile`, `View ID Card`, `Promote Student`.
- **Modals**: Add/Edit Student Modal, Student Detail Card Drawer.
- **Empty states**: "No students enrolled in selected class".
- **Validation**: Admission number unique check, required guardian phone number.
- **Loading states**: Table row shimmer animation.

---

### 12. Login Roster (`/admin/login-roster`)
- **Page Name**: User Credential & Portal Roster
- **Purpose**: View generated login accounts for students, parents, and teachers; issue password reset links; audit portal access.
- **Who uses it**: IT Admin, System Administrator.
- **Components used**: `LoginRoster.jsx`, Credential Table, Reset Buttons, Copy Badges.
- **Main actions**: Search portal accounts, copy default credentials, force password resets, export user logins.
- **API endpoints called**: `GET /api/users`, `POST /api/auth/reset-password`.
- **Tables shown**: Login Account Roster (User ID, Name, Role, Username, Last Login Timestamp, Status).
- **Forms shown**: Password Reset Modal Form.
- **Filters**: Role filter (Student, Teacher, Parent, Admin), Account Status.
- **Search**: Search user by username, name, or role.
- **Export options**: Export Credential Roster to CSV.
- **Buttons**: `Reset Password`, `Copy Credentials`, `Export Roster`.
- **Modals**: Password Reset Confirmation Modal.
- **Empty states**: "No user accounts registered".
- **Validation**: Password strength minimum requirements.
- **Loading states**: Button spinner during reset execution.

---

### 13. Approvals (`/admin/approvals`)
- **Page Name**: Registration & Request Approvals
- **Purpose**: Review pending self-registrations or profile edit requests from teachers and students before committing to DB.
- **Who uses it**: Vice Principal, School Admin.
- **Components used**: `Approvals.jsx`, Approval Request Cards, Decision Buttons, Comparison Diff Modals.
- **Main actions**: Approve request, reject with reason, view request detail diff.
- **API endpoints called**: `GET /api/approvals/pending`, `POST /api/approvals/:id/approve`, `POST /api/approvals/:id/reject`.
- **Tables shown**: Pending Approvals Queue (Applicant Name, Request Type, Submitted Date, Target Role, Actions).
- **Forms shown**: Rejection Reason Form.
- **Filters**: Request Type filter (New Registration, Profile Update, Leave Application).
- **Search**: Search applicant name.
- **Export options**: None.
- **Buttons**: `Approve`, `Reject`, `View Details`.
- **Modals**: Rejection Reason Modal, Profile Changes Comparison Dialog.
- **Empty states**: "No pending approvals in queue".
- **Validation**: Rejection reason required when declining requests.
- **Loading states**: Card fade-out animation on approval/rejection.

---

### 14. Teacher Assignments (`/admin/assignments`)
- **Page Name**: Teacher Class & Subject Allocations
- **Purpose**: Map teachers to specific classes, sections, and subjects for the current academic session.
- **Who uses it**: Academic Coordinator, Timetable In-Charge.
- **Components used**: `TeacherAssignments.jsx`, Mapping Matrix Grid, Dropdown Selectors.
- **Main actions**: Assign teacher to subject/class, remove allocation, view teacher workload index.
- **API endpoints called**: `GET /api/teacher-assignments`, `POST /api/teacher-assignments`, `DELETE /api/teacher-assignments/:id`.
- **Tables shown**: Allocation Matrix (Class, Section, Subject, Assigned Teacher, Weekly Hours).
- **Forms shown**: New Assignment Selector Form.
- **Filters**: Class filter, Teacher filter.
- **Search**: Search by subject or teacher name.
- **Export options**: Export Allocation Matrix to CSV.
- **Buttons**: `+ Assign Teacher`, `Unassign`, `Export Matrix`.
- **Modals**: Assignment Modal Form, Workload Warning Dialog.
- **Empty states**: "No subject assignments configured for this class".
- **Validation**: Prevent allocating duplicate teachers to the same subject/section.
- **Loading states**: Matrix cell spinner.

---

### 15. Timetables (`/admin/timetables`)
- **Page Name**: Master Class Timetable Management
- **Purpose**: Create weekly class period schedules, assign time slots, prevent period overlap conflicts.
- **Who uses it**: Timetable Coordinator, Academic Admin.
- **Components used**: `Timetables.jsx`, Weekly Timetable Grid, Period Cards, Conflict Highlighters.
- **Main actions**: Create period schedule, assign subject & teacher to period, detect schedule collisions, print timetable.
- **API endpoints called**: `GET /api/timetables/class/:classId`, `POST /api/timetables`, `PUT /api/timetables/:id`, `DELETE /api/timetables/:id`.
- **Tables shown**: Weekly Schedule Grid (Days Mon-Sat vs Period Time Slots 1-8).
- **Forms shown**: Period Entry Form (Day, Slot, Subject, Teacher, Room No).
- **Filters**: Class & Section dropdown selector.
- **Search**: None.
- **Export options**: Print PDF Class Timetable, Download Timetable Image.
- **Buttons**: `+ Add Period Slot`, `Edit Period`, `Auto-Detect Conflicts`, `Print Timetable`.
- **Modals**: Add/Edit Period Slot Modal, Conflict Alert Modal.
- **Empty states**: "Select a class and section to view or create timetable".
- **Validation**: Automatic overlap check for teacher and room availability.
- **Loading states**: Grid cell loading indicator.

---

### 16. Substitute Teachers (`/admin/timetables/substitutions`)
- **Page Name**: Emergency Teacher Substitutions
- **Purpose**: Manage absent teacher periods and automatically/manually assign free teachers as substitutes.
- **Who uses it**: Vice Principal, Daily Operational Admin.
- **Components used**: `SubstituteTeachers.jsx`, Absentee List, Available Substitutes Selector, Notification Trigger.
- **Main actions**: Select absent teacher, view affected periods, pick free substitute teacher, send instant push alert to substitute.
- **API endpoints called**: `GET /api/timetables/substitutions/free-teachers`, `POST /api/timetables/substitutions`, `GET /api/timetables/substitutions/today`.
- **Tables shown**: Today's Substitutions Roster (Absent Teacher, Period Slot, Class/Section, Assigned Substitute, Status).
- **Forms shown**: Substitution Assignment Modal Form.
- **Filters**: Date filter, Period slot filter.
- **Search**: Search free teachers by availability.
- **Export options**: Print Daily Substitution Sheet.
- **Buttons**: `Find Substitutes`, `Assign & Notify`, `Print Daily Roster`.
- **Modals**: Substitute Selection Drawer / Modal.
- **Empty states**: "No teacher absences reported for today".
- **Validation**: Only free teachers with no assigned class during that slot can be selected.
- **Loading states**: Live match calculation loading state.

---

### 17. Transport Manager (`/admin/transport`)
- **Page Name**: Fleet & Transport Logistics
- **Purpose**: Fleet management, route mapping, bus stops, driver assignments, live vehicle status monitoring.
- **Who uses it**: Transport Manager, Administrative Officer.
- **Components used**: `TransportManager.jsx`, Fleet Status Cards, Route Table, Vehicle Map View, Stop List.
- **Main actions**: Create bus route, add vehicle details, assign driver & route helper, configure stops and timings.
- **API endpoints called**: `GET /api/transport/routes`, `POST /api/transport/routes`, `GET /api/transport/vehicles`, `POST /api/transport/vehicles`, `GET /api/transport/drivers`.
- **Tables shown**: Transport Routes Table (Route Code, Start/End Point, Bus No, Driver, Total Students Enrolled), Vehicles Table.
- **Forms shown**: Route Creation Form, Vehicle Entry Form, Driver Assignment Form.
- **Filters**: Vehicle Status filter (On Route, Maintenance, Idle).
- **Search**: Search route code, driver name, or bus number.
- **Export options**: Export Route Manifest to CSV / PDF.
- **Buttons**: `+ Add Route`, `+ Add Vehicle`, `Assign Driver`, `View Stop Schedule`.
- **Modals**: Route Entry Modal, Vehicle Form Modal, Driver Modal.
- **Empty states**: "No transport routes configured".
- **Validation**: License number verification, unique route code requirement.
- **Loading states**: Map placeholder shimmer.

---

### 18. Notifications (`/admin/notifications`)
- **Page Name**: Campus Announcement & Push Broadcast
- **Purpose**: Send push notifications, SMS alerts, and platform announcements to target audiences (All, Teachers, Parents, Students, Specific Class).
- **Who uses it**: School Principal, Admin, Communication Desk.
- **Components used**: `Notifications.jsx`, Announcement Feed, Broadcast Form, Delivery Status Badges.
- **Main actions**: Compose announcement, attach document/image, select target audience group, send broadcast.
- **API endpoints called**: `GET /api/notifications`, `POST /api/notifications`, `DELETE /api/notifications/:id`.
- **Tables shown**: Sent Notifications History (Title, Target Audience, Sent Date, Delivery Count, Priority).
- **Forms shown**: Broadcast Composition Form (Title, Body, Target Role, Priority: Low/Normal/Urgent).
- **Filters**: Target Audience filter (Teachers, Students, Parents, All).
- **Search**: Search notification title or text.
- **Export options**: None.
- **Buttons**: `+ New Announcement`, `Send Broadcast`, `Delete Notice`.
- **Modals**: Compose Notification Modal, View Full Announcement Dialog.
- **Empty states**: "No announcements posted yet".
- **Validation**: Title and body text required; target audience selected.
- **Loading states**: Sending indicator button animation.

---

### 19. Exams Manager (`/admin/exams`)
- **Page Name**: Examination & Report Card Center
- **Purpose**: Configure term examinations, master exam catalogs, marks entry tables, grade boundaries, and publish report cards.
- **Who uses it**: Examination Controller, Academic Coordinator.
- **Components used**: `ExamsManager.jsx`, Term Selector, Marks Entry Grid, Grade Boundary Cards, Report Card Generator.
- **Main actions**: Create exam master (Term 1, Final), enter student subject marks, compute grades, publish results.
- **API endpoints called**: `GET /api/exams`, `POST /api/exams`, `GET /api/exam-masters`, `POST /api/report-cards/generate`, `GET /api/report-cards/class/:classId`.
- **Tables shown**: Exams Schedule Table, Student Marks Entry Grid (Student Name, Roll No, Max Marks, Marks Obtained, Grade, Remarks).
- **Forms shown**: Exam Creation Form, Marks Entry Form, Grade Scale Configuration Form.
- **Filters**: Academic Year, Term selector, Class & Section filter.
- **Search**: Search student by name or roll number.
- **Export options**: Print PDF Student Report Cards, Export Marks Sheet to CSV.
- **Buttons**: `+ Schedule Exam`, `Enter Marks`, `Generate Report Cards`, `Publish Results`.
- **Modals**: Add Exam Modal, Marks Verification Dialog.
- **Empty states**: "No examinations scheduled for selected term".
- **Validation**: Marks obtained cannot exceed maximum marks; numerical entry check.
- **Loading states**: Marks saving indicator.

---

### 20. Academic Year Manager (`/admin/academic-year`)
- **Page Name**: Session & Academic Term Configuration
- **Purpose**: Define academic year cycles (e.g. 2026-2027), term start/end dates, active session toggle, annual session transition.
- **Who uses it**: School Admin, Director.
- **Components used**: `AcademicYearManager.jsx`, Term Timeline Cards, Active Badge, Form Dialogs.
- **Main actions**: Add academic year, mark current active session, define terms (Quarter 1, Midterm, Final).
- **API endpoints called**: `GET /api/academic-years`, `POST /api/academic-years`, `PUT /api/academic-years/:id/set-active`.
- **Tables shown**: Academic Years Roster (Session Code, Start Date, End Date, Terms Count, Status).
- **Forms shown**: Academic Year Creation Form, Term Boundary Form.
- **Filters**: Status filter (Active/Archived/Upcoming).
- **Search**: None.
- **Export options**: None.
- **Buttons**: `+ New Academic Year`, `Set as Active Session`, `Edit Session`.
- **Modals**: New Session Modal Form, Session Transition Confirmation Dialog.
- **Empty states**: "No academic years configured".
- **Validation**: Start date must precede end date; only one active session allowed at a time.
- **Loading states**: Status update spinner.

---

### 21. Audit Logs (`/admin/audit-logs`)
- **Page Name**: Security & System Audit Logs
- **Purpose**: Immutable audit log of administrative mutations, security logins, IP addresses, resource access, and configuration changes.
- **Who uses it**: Compliance Officer, IT Security Admin.
- **Components used**: `AuditLogs.jsx`, Log Table Grid, JSON Viewer Modal, Search Filter Bar.
- **Main actions**: Filter logs by actor, action type, date range; view JSON payload diffs.
- **API endpoints called**: `GET /api/audit/logs`.
- **Tables shown**: Audit Log Table (Timestamp, User / Actor, Action Code, Resource Target, IP Address, Status).
- **Forms shown**: Date Range & User Filter Form.
- **Filters**: Action Type filter (CREATE, UPDATE, DELETE, LOGIN, EXPORT), User Role filter.
- **Search**: Search logs by username, IP, or resource ID.
- **Export options**: Export Security Audit Log to CSV.
- **Buttons**: `Filter Logs`, `View JSON Payload`, `Export Audit Trail`.
- **Modals**: Payload Detail JSON Viewer Modal.
- **Empty states**: "No audit log entries matching filter criteria".
- **Validation**: Valid date range verification.
- **Loading states**: Log table shimmer lines.

---

### 22. Lost & Found Manager (`/admin/lost-found`)
- **Page Name**: Campus Lost & Found Registry
- **Purpose**: Log misplaced or found student items (water bottles, bags, books), upload images, record claim status.
- **Who uses it**: Front Desk Manager, Security In-Charge.
- **Components used**: `LostFoundManager.jsx`, Item Card Grid, Claim Modal, Category Tags.
- **Main actions**: Report found item, mark item as claimed, upload item picture, notify owner.
- **API endpoints called**: `GET /api/lost-found`, `POST /api/lost-found`, `PUT /api/lost-found/:id/claim`.
- **Tables shown**: Lost & Found Items Directory (Item Code, Title, Category, Found Location, Date, Status, Claimant).
- **Forms shown**: Report Item Form, Claim Entry Form.
- **Filters**: Item Category filter, Status filter (Unclaimed/Claimed/Disposed).
- **Search**: Search item title or description.
- **Export options**: None.
- **Buttons**: `+ Report Item`, `Mark Claimed`, `Upload Photo`.
- **Modals**: Report Item Modal, Claim Verification Modal.
- **Empty states**: "No lost & found items reported".
- **Validation**: Title and location required.
- **Loading states**: Card grid loader.

---

### 23. Feedback Submit (`/admin/feedback`)
- **Page Name**: System Feedback & Issue Reporter
- **Purpose**: Allow school admins to report software bugs, feature requests, or UI issues directly to super administrators.
- **Who uses it**: School Admin, Office Staff.
- **Components used**: `FeedbackSubmit.jsx`, Feedback Form, Submitted History List.
- **Main actions**: Submit feedback form, rate satisfaction, view past submission responses.
- **API endpoints called**: `GET /api/feedback/my-submissions`, `POST /api/feedback`.
- **Tables shown**: Past Submissions History Table (Ticket ID, Category, Subject, Status, Admin Response).
- **Forms shown**: Feedback Submission Form (Category: Bug/Feature/General, Rating, Subject, Detailed Message).
- **Filters**: Status filter (Open, In Progress, Resolved).
- **Search**: None.
- **Export options**: None.
- **Buttons**: `Submit Feedback`, `View Ticket`.
- **Modals**: Feedback Ticket Detail Modal.
- **Empty states**: "No previous feedback tickets submitted".
- **Validation**: Subject and message required (minimum 10 characters).
- **Loading states**: Submission progress spinner.

---

### 24. Library Manager (`/admin/library`)
- **Page Name**: Central Library Circulation System
- **Purpose**: Book cataloging (ISBN, author, copies), book issue/return tracking, student fine management, borrowing history, circulation reports.
- **Who uses it**: School Librarian, Assistant Librarian, Admin.
- **Components used**: `LibraryManager/index.jsx`, `LibraryBooks.jsx`, `LibraryIssue.jsx`, `LibraryReturn.jsx`, `LibraryHistory.jsx`, `LibraryReports.jsx`, `LibrarySettings.jsx`.
- **Main actions**: Catalog new book, issue book to student/teacher, process book return, calculate fine for overdue books, manage library settings.
- **API endpoints called**: `GET /api/library/books`, `POST /api/library/books`, `POST /api/library/issue`, `POST /api/library/return`, `GET /api/library/history`, `GET /api/library/reports`, `PUT /api/library/settings`.
- **Tables shown**: Book Catalog Table, Active Borrowed Books Grid, Return Processing Table, Circulation History Ledger.
- **Forms shown**: Book Cataloging Form, Book Issue Form (Book Accession No, Borrower Barcode, Due Date), Book Return Form (Fine Paid toggle), Library Rules Settings Form.
- **Filters**: Category filter, Availability Status (Available/Issued), Overdue status.
- **Search**: Search book by ISBN, Title, Author, or Accession Number.
- **Export options**: Export Catalog to CSV, Print Circulation Report PDF.
- **Buttons**: `+ Add Book`, `Issue Book`, `Return Book`, `Collect Fine`, `Save Rules`.
- **Modals**: Add Book Modal, Issue Confirmation Modal, Return Fine Modal.
- **Empty states**: "No books available in library catalog".
- **Validation**: Cannot issue book if borrower has overdue books or reached maximum borrowing quota.
- **Loading states**: Circulation action spinner.

---

### 25. About Admin (`/admin/about`)
- **Page Name**: System Profile & System Information
- **Purpose**: Display platform build details, active license key, server uptime, database status, support contacts.
- **Who uses it**: School Admin, IT Lead.
- **Components used**: `AboutAdmin.jsx`, System Info Cards, License Badges.
- **Main actions**: Check system version, copy license code, view technical documentation link.
- **API endpoints called**: `GET /api/schools/my-school`.
- **Tables shown**: Institutional Configuration Summary Table.
- **Forms shown**: None.
- **Filters**: None.
- **Search**: None.
- **Export options**: None.
- **Buttons**: `Copy License Key`, `View Docs`, `Contact Support`.
- **Modals / Drawers**: None.
- **Empty states**: N/A.
- **Validation**: N/A.
- **Loading states**: None.

---

# 3. Sidebar Structure

The primary navigation menu is implemented in `Sidebar.jsx` with collapsible section groups:

```
SchoolIQ Admin Portal
│
├── Executive Overview
│   └── 📊 Dashboard (/admin/dashboard)
│   └── 📈 Analytics (/admin/analytics)
│
├── Financial Management
│   └── 💰 Finance & Fees (/admin/fees)
│
├── Master Directories
│   └── 🗂️ School Registry (/admin/directory)
│   └── 📥 Bulk Seeder (/admin/bulk-seeder)
│
├── Academic Management
│   └── 🏫 Classes & Sections (/admin/classes)
│   └── 📚 Subjects Catalog (/admin/subjects)
│   └── 📅 Academic Year (/admin/academic-year)
│
├── Staff & Students
│   └── 👨‍🏫 Faculty Directory (/admin/teachers)
│   └── 🎓 Student Directory (/admin/students)
│   └── 🔑 Login Roster (/admin/login-roster)
│   └── ✅ Approvals Queue (/admin/approvals)
│
├── Scheduling & Operations
│   └── 📌 Teacher Assignments (/admin/assignments)
│   └── 🗓️ Class Timetables (/admin/timetables)
│   └── 🔄 Substitute Teachers (/admin/timetables/substitutions)
│
├── Logistics & Resources
│   └── 🚌 Transport Manager (/admin/transport)
│   └── 📖 Library System (/admin/library)
│   └── 📝 Examinations (/admin/exams)
│   └── 🔍 Lost & Found (/admin/lost-found)
│   └── 📢 Announcements (/admin/notifications)
│
└── Governance & Support
    └── 🛡️ Audit Logs (/admin/audit-logs)
    └── 💬 Submit Feedback (/admin/feedback)
    └── ℹ️ System About (/admin/about)
```

---

# 4. Backend API Inventory

Below is the complete REST API catalog grouped by domain module:

### Authentication (`/api/auth`)
| Method | Endpoint | Purpose | Request Body | Response | Auth | Validation | Used By Page |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | `{ username, password }` | `{ token, user }` | Public | Username/Password required | Login |
| `GET` | `/api/auth/me` | Fetch authenticated user context | None | `{ user }` | Bearer | Token required | Global App Layout |

### Schools (`/api/schools`)
| Method | Endpoint | Purpose | Request Body | Response | Auth | Validation | Used By Page |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/schools` | List all school tenants | None | `[ { id, name, domain } ]` | Super Admin | Role Check | Super Admin |
| `POST` | `/api/schools` | Provision new school tenant | `{ name, domain, adminEmail }` | `{ school, adminUser }` | Super Admin | Domain unique, email format | Super Admin |
| `GET` | `/api/schools/my-school` | Fetch current school profile | None | `{ school }` | School Admin | Tenant scoping | Dashboard, About |

### Students (`/api/students`)
| Method | Endpoint | Purpose | Request Body | Response | Auth | Validation | Used By Page |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/students` | List students with filters | None | `[ { id, name, roll_no, class } ]` | School Admin | Tenant scoping | Students Manager, Directory |
| `POST` | `/api/students` | Register new student | `{ name, class_id, section_id, parent_phone }` | `{ student }` | School Admin | Unique admission no | Students Manager |
| `PUT` | `/api/students/:id` | Update student profile | `{ name, class_id, status }` | `{ updatedStudent }` | School Admin | ID exists | Students Manager |
| `DELETE` | `/api/students/:id` | Soft-delete student record | None | `{ message }` | School Admin | ID exists | Students Manager |

### Teachers (`/api/teachers`)
| Method | Endpoint | Purpose | Request Body | Response | Auth | Validation | Used By Page |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/teachers` | List faculty members | None | `[ { id, name, employee_code } ]` | School Admin | Tenant scoping | Teachers Manager, Directory |
| `POST` | `/api/teachers` | Add faculty member | `{ name, email, phone, subject }` | `{ teacher }` | School Admin | Email unique | Teachers Manager |
| `PUT` | `/api/teachers/:id` | Update faculty details | `{ name, subject, status }` | `{ updatedTeacher }` | School Admin | ID exists | Teachers Manager |

### Classes & Sections (`/api/classes`, `/api/sections`)
| Method | Endpoint | Purpose | Request Body | Response | Auth | Validation | Used By Page |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/classes` | Get classes hierarchy | None | `[ { id, name, sections: [] } ]` | School Admin | Tenant scoping | Classes Manager |
| `POST` | `/api/classes` | Create academic class | `{ name, numeric_order }` | `{ class }` | School Admin | Name required | Classes Manager |
| `POST` | `/api/sections` | Create class section | `{ class_id, name }` | `{ section }` | School Admin | Unique within class | Classes Manager |

### Finance & Fees (`/api/fees`, `/api/expenses`)
| Method | Endpoint | Purpose | Request Body | Response | Auth | Validation | Used By Page |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/fees/summary` | Financial KPIs summary | None | `{ total_collected, pending }` | School Admin | Tenant scoping | Fee Manager |
| `POST` | `/api/fees/collect` | Collect student fee | `{ student_id, amount, mode }` | `{ transaction, receipt_no }` | School Admin | Amount <= pending | Fee Manager |
| `POST` | `/api/fees/categories` | Add fee category | `{ title, code, description }` | `{ category }` | School Admin | Code unique | Fee Manager |
| `POST` | `/api/expenses` | Log operational expense | `{ title, amount, category, date }` | `{ expense }` | School Admin | Amount > 0 | Fee Manager |

### Library (`/api/library`)
| Method | Endpoint | Purpose | Request Body | Response | Auth | Validation | Used By Page |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/library/books` | Search library catalog | None | `[ { id, title, isbn, copies } ]` | School Admin | Tenant scoping | Library Manager |
| `POST` | `/api/library/books` | Catalog new book | `{ title, isbn, author, quantity }` | `{ book }` | School Admin | ISBN format | Library Manager |
| `POST` | `/api/library/issue` | Issue book to borrower | `{ book_id, user_id, due_date }` | `{ issueRecord }` | School Admin | Check availability | Library Manager |
| `POST` | `/api/library/return` | Process book return | `{ issue_id, fine_amount }` | `{ returnRecord }` | School Admin | Issue ID active | Library Manager |

---

# 5. Database Usage

### Database Schema Mapping per Page

| Page Route | Primary Database Tables | Sequelize Models | Key Foreign Keys & Relationships |
| :--- | :--- | :--- | :--- |
| `/super-admin` | `schools`, `users`, `tokens`, `feedbacks` | `School`, `User`, `Token`, `Feedback` | `School.hasMany(User)`, `School.hasMany(Token)` |
| `/admin/dashboard` | `schools`, `students`, `teachers`, `audit_logs` | `School`, `Student`, `Teacher`, `AuditLog` | Scoped by `school_id` |
| `/admin/analytics` | `students`, `attendances`, `ai_logs` | `Student`, `Attendance`, `AiLog` | `Student.hasMany(Attendance)` |
| `/admin/fees` | `fee_categories`, `fee_structures`, `fee_payments`, `expenses` | `FeeCategory`, `FeeStructure`, `FeePayment`, `Expense` | `FeeStructure.belongsTo(FeeCategory)`, `FeePayment.belongsTo(Student)` |
| `/admin/directory` | `users`, `students`, `teachers` | `User`, `Student`, `Teacher` | `Student.belongsTo(User)`, `Teacher.belongsTo(User)` |
| `/admin/classes` | `classes`, `sections`, `teachers` | `Class`, `Section`, `Teacher` | `Class.hasMany(Section)`, `Section.belongsTo(Teacher)` |
| `/admin/subjects` | `subjects`, `classes` | `Subject`, `Class` | `Subject.belongsToMany(Class)` |
| `/admin/teachers` | `teachers`, `users`, `subjects` | `Teacher`, `User`, `Subject` | `Teacher.belongsTo(User)` |
| `/admin/students` | `students`, `users`, `classes`, `sections` | `Student`, `User`, `Class`, `Section` | `Student.belongsTo(Class)`, `Student.belongsTo(Section)` |
| `/admin/timetables` | `timetables`, `classes`, `sections`, `subjects`, `teachers` | `Timetable`, `Class`, `Section`, `Subject`, `Teacher` | `Timetable.belongsTo(Teacher)`, `Timetable.belongsTo(Subject)` |
| `/admin/transport` | `transport_routes`, `vehicles`, `drivers`, `bus_stops` | `TransportRoute`, `Vehicle`, `Driver`, `BusStop` | `TransportRoute.hasMany(BusStop)`, `Vehicle.belongsTo(Driver)` |
| `/admin/notifications` | `notifications`, `users` | `Notification`, `User` | `Notification.belongsTo(User, as: 'sender')` |
| `/admin/exams` | `exams`, `exam_masters`, `marks`, `students`, `subjects` | `Exam`, `ExamMaster`, `Mark`, `Student`, `Subject` | `Mark.belongsTo(Student)`, `Mark.belongsTo(Exam)` |
| `/admin/library` | `library_books`, `book_issues`, `users` | `LibraryBook`, `BookIssue`, `User` | `BookIssue.belongsTo(LibraryBook)`, `BookIssue.belongsTo(User)` |

---

# 6. User Flows

### Workflow 1: Student Onboarding & Fee Structure Allocation
```
Login (/login)
  ↓
Student Directory (/admin/students)
  ↓
Click "+ Add Student" Button
  ↓
Fill Admission Modal Form (Personal info, Parent Phone, Select Class & Section)
  ↓
Submit Form (Executes POST /api/students)
  ↓
System auto-generates Login Credentials in Login Roster (/admin/login-roster)
  ↓
Navigate to Fee Manager (/admin/fees)
  ↓
Assign Class Fee Plan to Student (Executes POST /api/fees/plans)
  ↓
Complete Onboarding
```

### Workflow 2: Daily Fee Collection & Receipt Printing
```
Dashboard (/admin/dashboard)
  ↓
Navigate to Finance & Fees (/admin/fees)
  ↓
Select "Collect Fees" Tab
  ↓
Search Student by Admission No or Name
  ↓
View Pending Fee Breakdown & Total Balance
  ↓
Enter Collection Amount, Payment Mode (Cash/UPI), & Discount
  ↓
Click "Process Payment" (Executes POST /api/fees/collect)
  ↓
System generates Official Tax Receipt PDF (via html2canvas & jsPDF)
  ↓
Click "Print Receipt" & Return to Ledger
```

### Workflow 3: Emergency Teacher Substitution
```
Timetables Hub (/admin/timetables)
  ↓
Navigate to Substitutions (/admin/timetables/substitutions)
  ↓
Select Date & Absent Teacher
  ↓
View Affected Period Slots for the day
  ↓
System auto-queries free available teachers for each slot (GET /api/timetables/substitutions/free-teachers)
  ↓
Select Available Substitute Teacher
  ↓
Click "Assign & Send Push Alert" (Executes POST /api/timetables/substitutions)
  ↓
Substitute Teacher receives WebSocket & Push Notification on App
```

### Workflow 4: Exam Schedule Creation & Report Card Generation
```
Exams Center (/admin/exams)
  ↓
Click "+ Schedule Exam" -> Select Master Term (e.g., "Term 1 Mid-Year")
  ↓
Map Class, Subjects, Exam Date, & Max Marks
  ↓
Click "Save Exam Schedule" (POST /api/exams)
  ↓
Open Marks Entry Grid -> Enter Subject Marks for each Student
  ↓
Click "Submit Marks" -> System computes Total Marks, Percentage, & Letter Grades
  ↓
Click "Generate Class Report Cards" (POST /api/report-cards/generate)
  ↓
Batch print or publish student report cards to Parent Portal
```

---

# 7. Components Inventory

### Layout & Architecture Components
- **`DashboardLayout.jsx`**: Main shell containing fixed left sidebar, dynamic header bar with user profile menu, breadcrumb tracker, and main content viewport.
- **`Sidebar.jsx`**: Collapsible vertical menu tree with role-based link filtering, quick brand header, and active route indicators.
- **`ProtectedRoute.jsx`**: Route guard component evaluating JWT token validity and user role permissions.

### Common UI Components (`src/components/common`)
- **`Modal.jsx`**: Accessible modal overlay component featuring backdrop blur, header, scrollable body, action buttons, and ESC key listener.
- **`ConfirmDialog.jsx`**: Specialized confirmation modal for destructive operations (delete, deactivate, reset).
- **`StatsCard.jsx`**: Metric card component supporting trend percentage indicators, icon containers, and color accents.
- **`StatusBadge.jsx`**: Color-coded pill badge rendering statuses like `Active`, `Pending`, `Paid`, `Overdue`, `Rejected`.

### Pattern-Based Form & Table Elements
- **`SearchBar`**: Custom input wrapper with search icon, debounce delay, and clear button.
- **`FilterBar`**: Multi-dropdown filter container used in registry and audit screens.
- **`DataTable`**: Standardized HTML table wrapper with column sorting, hover rows, and skeleton pulse states.

---

# 8. Current UX Problems

> [!WARNING]
> **Critical Code Bugs & UX Violations Identified During Audit**:

1. **Fatal JavaScript Crash on `/admin/fees`**:
   - **Root Cause**: `FinanceDashboard.jsx` references an undefined variable `netCash` on lines 158, 162, and 163.
   - **User Impact**: Page crashes with a blank white screen / unhandled runtime exception upon navigation.

2. **Violation of Material UI Framework Rule**:
   - **Issue**: Project style guidelines specify Material UI (MUI), but the codebase relies entirely on raw HTML elements styled with Tailwind CSS v4.
   - **User Impact**: Inconsistent UI feel compared to standard enterprise MUI design system.

3. **Excessive Click Depth for Core Workflows**:
   - **Issue**: Fee Collection and Library Circulation require nested tab switches inside single page components without URL sub-routing.
   - **User Impact**: Office staff cannot bookmark direct tabs (e.g. direct link to "Collect Fee" or "Issue Book").

4. **Missing Pagination on High-Volume Tables**:
   - **Issue**: Student Directory (`/admin/students`), Directory (`/admin/directory`), and Audit Logs (`/admin/audit-logs`) render large arrays directly into the DOM.
   - **User Impact**: Severe browser lag and DOM sluggishness when displaying school directories exceeding 500+ records.

5. **Monolithic Form Modals**:
   - **Issue**: Student Admission and Teacher Registration forms contain 15+ inputs in a single long scrolling modal.
   - **User Impact**: High cognitive load and accidental modal closes leading to data loss.

6. **Inconsistent Responsive Mobile Navigation**:
   - **Issue**: Complex data tables (Timetable Grid, Marks Entry Grid) lack horizontal scroll hints or mobile card transforms.
   - **User Impact**: Table overflow breaks layout on mobile devices and tablets.

---

# 9. Missing Enterprise Features

Based on enterprise SaaS standards for modern school ERPs, the following capabilities are currently absent:

1. **Payment Gateway Integration**: No native Razorpay, Stripe, or UPI gateway SDK integration for online parent fee payments.
2. **Automated WhatsApp / SMS Gateway**: Lacks direct Twilio / WhatsApp Business API trigger integration for attendance alerts and fee reminders.
3. **Granular Role-Based Permission Matrix (RBAC)**: Currently uses hardcoded binary roles (`school_admin`, `super_admin`) rather than fine-grained permissions (e.g., "Accountant", "Librarian", "Receptionist").
4. **Excel / CSV Export Engine**: Missing export capabilities on key tables (Audit Logs, Timetables, Exam Marks).
5. **Dark Mode Theme Support**: UI lacks dark mode color tokens.
6. **Audit Diff Viewer**: Audit log displays raw JSON instead of visual before/after field comparisons.

---

# 10. Design Complexity Matrix

| Page / Route | Complexity Rating | Justification |
| :--- | :--- | :--- |
| `/login` | **Simple** | Single login card with standard validation. |
| `/admin/about` | **Simple** | Static informational cards and system status. |
| `/admin/feedback` | **Simple** | Standard ticket submission form and basic history list. |
| `/admin/lost-found` | **Simple** | Basic grid cards with status toggles. |
| `/admin/classes` | **Medium** | Nested class and section creation logic. |
| `/admin/subjects` | **Medium** | Catalog management with subject code validation. |
| `/admin/teachers` | **Medium** | Multi-field user profile forms and credential reset options. |
| `/admin/login-roster` | **Medium** | User search and password generation utility. |
| `/admin/approvals` | **Medium** | Queue management with approve/reject modal workflows. |
| `/admin/notifications` | **Medium** | Target group selection and multi-channel broadcast form. |
| `/admin/academic-year` | **Medium** | Session lifecycle management and active term toggles. |
| `/admin/audit-logs` | **Medium** | High-volume log table with JSON payload viewing modal. |
| `/admin/dashboard` | **Complex** | Real-time aggregate counters, quick links, activity feed, attendance widgets. |
| `/admin/analytics` | **Complex** | Interactive chart visualizations, demographic filters, metrics calculations. |
| `/admin/directory` | **Complex** | Unified multi-model search index across students, teachers, and staff. |
| `/admin/bulk-seeder` | **Complex** | Client-side CSV parsing, column mapping, row-by-row validation engine. |
| `/admin/students` | **Complex** | Full SIS lifecycle, class/section mapping, parent contacts, photo uploads. |
| `/admin/assignments` | **Complex** | Matrix mapping of faculty to class-subject combinations. |
| `/admin/transport` | **Complex** | Bus route configuration, stop scheduling, vehicle fleet status management. |
| `/super-admin` | **Very Complex** | Multi-tenant school provisioning, token management, API quota monitoring. |
| `/admin/fees` | **Very Complex** | Multi-tab financial management, ledger collection, receipts, categories, expenses. |
| `/admin/timetables` | **Very Complex** | Weekly multi-period grid matrix with conflict collision detection. |
| `/admin/timetables/substitutions` | **Very Complex** | Real-time free teacher matching engine for period substitutions. |
| `/admin/exams` | **Very Complex** | Term master creation, marks entry grid, grade calculations, PDF report card printing. |
| `/admin/library` | **Very Complex** | Cataloging, circulation workflow, overdue fine engine, book history tracking. |

---

# 11. Most Used Screens (Office Staff Daily Operational Ranking)

Based on daily administrative school workflows, office staff will spend the majority of their operational time on the following top 7 screens:

1. **Rank 1: Fee Manager (`/admin/fees`)** — Constant daily usage for fee collections, parent receipt issuance, and cash register closing.
2. **Rank 2: Student Manager (`/admin/students`)** — Daily student record updates, new admissions, attendance checks, and parent contact lookups.
3. **Rank 3: Substitute Teachers (`/admin/timetables/substitutions`)** — Morning operational task to handle teacher leave requests and assign substitute periods.
4. **Rank 4: Master Registry / Directory (`/admin/directory`)** — Front office lookup tool for student, teacher, and parent inquiries.
5. **Rank 5: Library Manager (`/admin/library`)** — Daily circulation counter usage for issuing and returning books.
6. **Rank 6: Notifications & Announcements (`/admin/notifications`)** — Posting daily campus announcements, circulars, and emergency push alerts.
7. **Rank 7: Exams & Report Cards (`/admin/exams`)** — Peak periodic usage during term exams for marks entry and report card printing.

---

# 12. Redesign Priority Roadmap

> [!RECOMMENDATION]
> **Recommended Step-by-Step UI/UX Overhaul Roadmap**:

### Priority 1: High Urgency (Bug Fixes & Core Stability)
- **Fix Runtime Crash on `/admin/fees`**: Define `netCash` or replace with calculated net balance variable in `FinanceDashboard.jsx`.
- **Implement Table Pagination & Virtualization**: Add server-side pagination to `StudentsManager`, `Directory`, and `AuditLogs` to prevent DOM freeze.

### Priority 2: Medium Urgency (Workflow & Navigation UX)
- **Sub-Route Navigation for Tabbed Modules**: Replace internal state tabs in Fee Manager and Library Manager with explicit sub-routes (`/admin/fees/collect`, `/admin/fees/reports`, `/admin/library/issue`).
- **Multi-Step Wizard Forms**: Break long single-page modal forms (Student Admission, Teacher Entry) into 3-step wizard flows (Basic Info -> Academic Allocation -> Guardian Details).
- **Global Keyboard Shortcuts**: Add shortcuts (e.g. `Ctrl + K` to open global search, `Ctrl + F` to open fee collect).

### Priority 3: Enhancements & Enterprise Polish
- **Material UI Component Alignment**: Migrate raw HTML inputs and tables to standardized Material UI components as outlined in project rules.
- **Visual Audit Diff Viewer**: Replace raw JSON modal in Audit Logs with side-by-side field diff highlight component.
- **Export to Excel Across All Grids**: Implement generic CSV/Excel export button on every table header.

---
