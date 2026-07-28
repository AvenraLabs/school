# SchoolIQ Admin Panel User Workflow Documentation

> **Document Version**: 1.0.0  
> **Target System**: SchoolIQ Multi-Tenant School ERP Platform  
> **Scope**: Administrative End-to-End User Workflows  

---

## Overview

This document specifies step-by-step user interaction flows for all key administrative workflows in the SchoolIQ Admin Panel. Each flow documents the exact sequence of screens, user actions, data inputs, system validations, and completion states from initial login to task finalization.

---

## 1. Fee Collection Workflow

**Goal**: Search for a student, calculate pending fee balance, accept payment, and issue a printable official tax receipt.

```
Login Page (/login)
   ↓
School Admin Dashboard (/admin/dashboard)
   ↓
Click "Finance & Fees" in Sidebar (/admin/fees)
   ↓
Select "Collect Fee" Tab
   ↓
Enter Student Admission No or Name in Search Input
   ↓
System fetches student ledger & displays pending fee structure
   ↓
Select Fee Items to collect (Tuition, Transport, Sports)
   ↓
Enter Payment Details: Amount, Payment Mode (Cash/UPI/Cheque), Reference No
   ↓
Click "Process & Collect Payment"
   ↓
System records payment transaction (POST /api/fees/collect)
   ↓
Modal displays generated Official Tax Receipt PDF
   ↓
Click "Print Receipt"
   ↓
Return to Fee Collection Search
```

---

## 2. Student Onboarding Workflow

**Goal**: Register a new student, assign class/section, enter parent details, and issue portal credentials.

```
Dashboard (/admin/dashboard)
   ↓
Click "Students" in Sidebar (/admin/students)
   ↓
Click "+ Add Student" Header Button
   ↓
Open Student Admission Modal Form
   ↓
Enter Personal Details: Full Name, DOB, Gender, Blood Group
   ↓
Select Academic Allocation: Academic Year, Grade/Class, Section
   ↓
Enter Parent/Guardian Details: Father Name, Mother Name, Emergency Contact Phone
   ↓
Upload Student Photograph (Optional)
   ↓
Click "Submit Admission" (POST /api/students)
   ↓
System validates unique admission number & generates record
   ↓
System auto-creates portal user account in Login Roster (/admin/login-roster)
   ↓
Toast notification displays "Student Enrolled Successfully"
```

---

## 3. Student Promotion Workflow

**Goal**: Promote eligible students to the next class grade for a new academic year session.

```
Dashboard (/admin/dashboard)
   ↓
Click "Students" in Sidebar (/admin/students)
   ↓
Click "Promote Students" Action Button
   ↓
Select Source Class (e.g. Grade 5-A) & Target Class (e.g. Grade 6-A)
   ↓
System loads student list with promotion checkboxes
   ↓
Uncheck students who are repeating or leaving
   ↓
Click "Execute Class Promotion"
   ↓
System updates student class allocations in database
   ↓
Return to Student Directory with updated class list
```

---

## 4. Faculty Onboarding & Class Assignment Workflow

**Goal**: Register a new faculty member, allocate primary subjects, and assign class teacher responsibilities.

```
Dashboard (/admin/dashboard)
   ↓
Click "Teachers" in Sidebar (/admin/teachers)
   ↓
Click "+ Add Teacher" Button
   ↓
Enter Teacher Details: Name, Employee Code, Qualification, Email, Phone
   ↓
Click "Save Profile" (POST /api/teachers)
   ↓
Navigate to Teacher Assignments (/admin/assignments)
   ↓
Click "+ Assign Subject"
   ↓
Select Teacher, Target Class, Section, & Subject (e.g. Mathematics)
   ↓
Click "Confirm Assignment" (POST /api/teacher-assignments)
   ↓
Navigate to Classes Manager (/admin/classes)
   ↓
Assign Teacher as "Class Teacher" for Class 6-A
   ↓
Complete Faculty Setup
```

---

## 5. Master Timetable Creation Workflow

**Goal**: Construct the weekly period schedule for a class and eliminate teacher period collisions.

```
Dashboard (/admin/dashboard)
   ↓
Click "Timetables" in Sidebar (/admin/timetables)
   ↓
Select Target Class & Section (e.g. Grade 8, Section B)
   ↓
Grid displays Days (Monday to Saturday) vs Periods (Slot 1 to Slot 8)
   ↓
Click an empty period cell (e.g. Monday - Period 3)
   ↓
Open Period Entry Modal
   ↓
Select Subject & Assigned Teacher
   ↓
System runs collision detection check (Verifies teacher is free in Slot 3)
   ↓
Click "Save Slot" (POST /api/timetables)
   ↓
Cell updates with Subject & Teacher name
   ↓
Repeat for remaining slots & Click "Publish Class Timetable"
```

---

## 6. Daily Teacher Substitution Workflow

**Goal**: Identify absent teachers during morning roll call and allocate available free teachers as substitutes.

```
Dashboard (/admin/dashboard)
   ↓
Click "Substitutions" in Sidebar (/admin/timetables/substitutions)
   ↓
Select Date (Today) & Click "Report Absent Teacher"
   ↓
Select Absent Teacher Name (e.g. Mr. John Doe)
   ↓
System displays list of periods Mr. John Doe was scheduled to teach today
   ↓
For Period 2 (Grade 7-A): System lists free available teachers during Slot 2
   ↓
Select Available Substitute Teacher (e.g. Ms. Sarah Smith)
   ↓
Click "Assign & Send Alert"
   ↓
System sends instant WebSocket push notification to Ms. Sarah Smith
   ↓
Click "Print Daily Substitution Roster" for staff noticeboard
```

---

## 7. Examination Scheduling & Report Card Generation Workflow

**Goal**: Configure an exam session, enter student marks, compute grades, and generate printable PDF report cards.

```
Dashboard (/admin/dashboard)
   ↓
Click "Exams" in Sidebar (/admin/exams)
   ↓
Click "+ Schedule Exam" Button
   ↓
Select Master Exam Term (e.g. "Term 1 Mid-Year Examination")
   ↓
Select Class, Subject, Exam Date, Duration, & Max Marks (e.g. 100)
   ↓
Click "Save Exam Schedule" (POST /api/exams)
   ↓
After exams occur: Select Exam -> Click "Enter Marks"
   ↓
Marks Entry Grid displays student list -> Input marks obtained for each student
   ↓
Click "Submit Marks" (POST /api/exams/marks)
   ↓
System automatically calculates Total Marks, Percentage, & Letter Grades (A+, A, B, etc.)
   ↓
Click "Generate Report Cards"
   ↓
Preview & Download Class Report Cards PDF
```

---

## 8. Library Book Issue & Return Workflow

**Goal**: Issue a library book to a student, track due dates, process returns, and collect overdue fines.

### Sub-Flow A: Book Issue
```
Dashboard (/admin/dashboard)
   ↓
Click "Library" in Sidebar (/admin/library)
   ↓
Select "Issue Book" Tab
   ↓
Enter Book Accession Number or ISBN (or scan barcode)
   ↓
Enter Student Admission Number / Borrower Barcode
   ↓
System checks borrower eligibility (Verifies no overdue books or unpaid fines)
   ↓
Set Return Due Date (Default: 14 days)
   ↓
Click "Issue Book" (POST /api/library/issue)
   ↓
Print Issue Slip
```

### Sub-Flow B: Book Return
```
Library Manager (/admin/library)
   ↓
Select "Return Book" Tab
   ↓
Enter Book Accession Number
   ↓
System displays active loan details, borrower info, & days overdue
   ↓
If Overdue: System auto-calculates Overdue Fine (e.g. $5.00)
   ↓
Select Fine Payment Status (Paid / Waived)
   ↓
Click "Process Return" (POST /api/library/return)
   ↓
Book status updates to "Available" in catalog
```

---

## 9. Campus Transport Route Setup Workflow

**Goal**: Configure a transport bus route, add stops, assign a vehicle and driver, and enroll students.

```
Dashboard (/admin/dashboard)
   ↓
Click "Transport" in Sidebar (/admin/transport)
   ↓
Click "+ Add Transport Route" Button
   ↓
Enter Route Code (e.g. Route 12 - North Sector), Start Point, & End Point
   ↓
Add Bus Stops & Estimated Pick-up Timings (Stop A: 07:15 AM, Stop B: 07:30 AM)
   ↓
Assign Vehicle (Bus No. KA-01-F-1234) & Driver
   ↓
Click "Save Route" (POST /api/transport/routes)
   ↓
Select Route -> Click "Enroll Students"
   ↓
Search student name & select pick-up stop
   ↓
Click "Save Student Route Mapping"
```

---

## 10. Campus Announcement & Notification Broadcast Workflow

**Goal**: Compose an urgent circular or notification and send push alerts to targeted user groups.

```
Dashboard (/admin/dashboard)
   ↓
Click "Notifications" in Sidebar (/admin/notifications)
   ↓
Click "+ New Announcement" Button
   ↓
Enter Announcement Title & Message Body
   ↓
Select Priority Level (Low / Normal / Urgent)
   ↓
Select Target Audience: "All Parents & Students of Grade 10"
   ↓
Attach Circular PDF Document (Optional)
   ↓
Click "Send Broadcast" (POST /api/notifications)
   ↓
System dispatches real-time WebSockets & push alerts to target users
   ↓
View delivery count in Sent History Table
```

---

## 11. Bulk Data Import Workflow

**Goal**: Batch import large numbers of student or teacher records using sample CSV templates.

```
Dashboard (/admin/dashboard)
   ↓
Click "Bulk Seeder" in Sidebar (/admin/bulk-seeder)
   ↓
Select Entity Type: "Students"
   ↓
Click "Download Sample CSV Template"
   ↓
Fill student data in CSV template file
   ↓
Drag and Drop completed CSV file into upload area
   ↓
Click "Validate File Data"
   ↓
System parses rows & displays preview grid with error highlights (e.g. invalid phone format)
   ↓
Fix invalid rows or click "Proceed Import Valid Records"
   ↓
Progress bar shows batch creation status (POST /api/bulk/students)
   ↓
Summary Modal displays "350 Students Imported Successfully"
```

---

## 12. Super Admin Multi-Tenant Provisioning Workflow

**Goal**: Provision a brand new school tenant instance, create tenant database scope, issue API token, and dispatch admin credentials.

```
Login as Super Admin (/login -> superadmin / admin123)
   ↓
Super Admin Governance Platform (/super-admin)
   ↓
Click "+ Provision New School" Button
   ↓
Enter Institution Name (e.g. "St. Jude International Academy")
   ↓
Enter Subdomain Code (e.g. "stjude") & Principal Email Address
   ↓
Select Subscription Tier (Standard / Enterprise) & Token Quota Limit
   ↓
Click "Create Tenant" (POST /api/schools)
   ↓
System provisions tenant record in database & creates initial School Admin account
   ↓
Navigate to "Tokens" Tab -> Click "Generate API Key" for tenant
   ↓
Click "Send Welcome & Credential Email" to Principal
   ↓
New school tenant is active and visible in Schools Directory
```

---
