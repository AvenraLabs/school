#  School ERP - Comprehensive Platform Features Guide
## Executive Product Catalog & Institutional Capabilities

---

### Executive Summary

 **AI-Powered Unified School Management & Interactive Learning Platform** designed to connect administrators, teachers, students, parents, and drivers in a single, secure ecosystem. 

Powered by advanced artificial intelligence (Retrieval-Augmented Generation textbook tutor and Google Gemini), real-time WebSockets, automated communication channels, and a high-performance Progressive Web App (PWA) client, Kiddo modernizes day-to-day school operations, automates teacher workloads, offers parents visual real-time progress tracking, and delivers a customized AI-guided tutor for students.

---

### Core Value Proposition

1. **Zero-Hallucination AI Textbook Tutor**: Integrates semantic vector database searches (ChromaDB) with Google Gemini APIs to restrict answers strictly to board-approved CBSE textbooks, complete with chapter citations.
2. **Real-time Safety & GPS Bus Tracking**: Real-time driver-to-parent location streaming without the need for expensive third-party GPS hardware.
3. **Automated Parent Communication**: Direct delivery of critical academic logs, timetables, and report cards to parents via automated WhatsApp dispatchers.
4. **Teacher Co-Pilot Automation**: Instantly drafts CBSE-aligned worksheets, lesson plans, and exam papers based on customized difficulty settings, exporting directly to PDF.
5. **Multi-Tenant Architecture**: A single secure installation supporting multiple schools, fully isolated via rigorous row-level database scopes.
6. **Token-Budget Economy**: Full administrative control over cloud expenses with configurable monthly AI credit token allowances for teachers and students.

---

### Platform Portals & User Personas

Kiddo delivers customized dashboards across **six user roles** split into distinct front-end clients:

| Portal | Target Roles | Key Benefit |
| :--- | :--- | :--- |
| **Super Admin Console** | Board Members / Platform Owners | Multi-tenant school creation, billing scopes, token policies, and global AI resource usage analytics. |
| **School Admin Panel** | Principals / Office Staff | School setup, class/subject registry, bulk seeder pipelines, approvals workflows, teacher assignments, and dispatcher logs. |
| **Teacher PWA** | Subject & Class Teachers | Live class timers, one-click attendance registry, digital homework managers, real-time subject chat rooms, exam grading, and AI lesson planners. |
| **Student PWA** | Students | RAG AI textbook tutor, interactive voice avatar tutor, personal schedule tracker, homework submissions, and classroom quiz lobbies. |
| **Parent PWA** | Parents / Guardians | Multi-child summary switcher, monthly attendance calendar, real-time bus location tracking map, exam performance charts, and PDF report card downloads. |
| **Driver App** | Transport Staff | One-click GPS transit stream and boarding/deboarding student checklist. |

---

## Detailed Feature Directory

### 1. Super Admin & Platform Operations
* **Multi-Tenant Onboarding**: Easily spin up and register new tenant schools. Customize basic metadata, domains, and branding controls.
* **Token Budget Manager**: Define maximum monthly token allowances for both students and teachers at a school-wide level. Monitor credit usage in real-time.
* **AI Analytics Dashboard**: Keep track of total API calls, token counts consumed, prompt logs, response logs, and overall operational cloud expenses.

### 2. Institutional Setup & School Admin Panel
* **Academic Year & Promotions Engine**:
  * Set up multiple academic years with clear start and end dates.
  * Preview year-over-year student promotion pipelines (e.g. promoting Class 6 Section A to Class 7 Section A) before triggering roll-over actions.
  * Auto-archives past years' grades, timetables, and attendance logs.
* **Multi-Modal Bulk Seeding**: Upload single CSV templates to import thousands of records in seconds, including classes, sections, subjects, teachers, student rosters, parent links, and schedules.
* **Master Timetable Scheduler**: Build detailed daily and weekly schedules. Resolves classroom teacher double-bookings automatically.
* **Onboarding Approval Pipeline**: Track and approve student profile edits, teacher onboardings, and parent-student linkages before they receive data permissions.
* **Notification Dispatcher**: Create rich notifications and alerts targeted at specific groups (e.g. all parents of Class 10, all teachers, or the entire school).
* **Automated WhatsApp Alerts**: Integrate notification channels to auto-deliver exam timetables, grade announcements, and student absence alerts straight to parents' mobile numbers.
* **Family & Sibling Registry**: Associate siblings under unified parent accounts so parents can switch profiles with one tap.

### 3. Teacher Dashboard & Workspace
* **Live Class Session Manager**: Teachers start scheduled periods from their timetable. Displays a live elapsed duration timer to keep teachers aligned.
* **One-Tap Attendance Register**: Take class attendance in under 30 seconds. System logs values (Present, Absent, Leave) with instant audit trails of who took the attendance and when it was modified.
* **AI Teaching Co-Pilot**:
  * *CBSE Question Paper Generator*: Generate CBSE-compliant question sheets by choosing a subject, topic, difficulty level (Easy/Medium/Hard), and target mark count.
  * *Lesson Summary Planner*: Draft outline summaries, lesson targets, and key homework takeaways based on CBSE chapters.
  * *One-Click PDF Exporter*: Download beautifully styled worksheets or plans directly to PDF format for printing.
* **Digital Homework Manager**: Assign digital homework, view student submission states, mark homework as complete, and track aggregate class completion statistics.
* **Real-time Subject Chat Rooms**: Subject teachers chat directly with their sections in locked-down class chat channels.
* **CBSE Grading Suite**: Set up midterm, pre-board, or final exams. Enter split scores (Theory + Practical + Internal) and control report card publishing states.

### 4. Student Personal Learning Companion (PWA)
* **Zero-Hallucination AI Textbook Tutor**:
  * Powered by **Retrieval-Augmented Generation (RAG)**.
  * Answers questions using ONLY the official textbooks uploaded to the school's vector database.
  * Includes direct references showing exactly which chapter and page the answer came from (e.g. *"Source: Class 8 Science, Chapter 4"*).
  * Automatically filters response complexity to match the student's current grade.
* **Interactive Voice Tutor**: A voice-enabled conversational robot avatar that listens to student queries, displays animated "Listening", "Thinking", and "Speaking" visual states, and speaks responses aloud.
* **Interactive Timetable & Deadlines**: View daily class periods and upcoming homework task checklists.
* **Single & Multiplayer Quiz Lobbies**: Play CBSE-aligned classroom quiz games. Join live multiplayer lobbies hosted by teachers or practice alone in single-player training mode.

### 5. Parent Dashboard & Analytics (PWA)
* **Unified Multi-Child Switcher**: Parents with multiple children in the school can toggle between summaries in one tap without needing different logins.
* **Monthly Attendance Calendar**: View colour-coded calendars highlighting presences, absences, and leaves, alongside month-by-month attendance percentages.
* **Homework Progress Charts**: Interactive radial graphs showing homework pending vs. completed status.
* **Real-Time School Bus Tracker**: A live Google Maps integration showing the active bus's GPS location, speed, route progress, and calculated ETA directly on the parent dashboard.
* **Official Report Cards**: Download beautifully typeset official school report cards in PDF format, featuring detailed grade splits and remarks.

### 6. Geolocation & Driver Tracking App
* **One-Click Streaming Trigger**: Drivers tap "Start Route" to begin streaming real-time geolocation coordinates directly to parents' maps.
* **Transit Checklist**: Check off students as they board or deboard the bus, automatically sending instant notifications to their parents.

---

## Technical Architecture & Security Features

* **Progressive Web App (PWA) Capabilities**: Offline capabilities, home screen installation, fast caching, and push notifications for a native app feel on iOS and Android.
* **WebSocket Framework**: Powered by **Socket.io** to synchronize live class timers, multiplayer quiz lobbies, group chats, and GPS location streams in sub-second intervals.
* **CBSE Core Syllabus Integration**: Pre-loaded database mapping standard classes, subjects, grading formats, and CBSE assessment weightages.
* **Security & Access Control**:
  * Row-level multi-tenancy ensures complete database isolation of client data.
  * Strict JWT token verification on every request.
  * API-level validation schemas check request bodies, headers, and query variables before executing db transactions.
  * System-wide audit logging tracks modifications on critical resources.

---

*For client inquiries, customization requests, or deployment walkthroughs, please contact the Kiddo ERP Sales and Integration Team.*
