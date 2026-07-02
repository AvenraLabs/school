#  AI-Powered Unified School Management & Learning Platform
## Executive Product Catalog & Feature Guide

---

### Executive Summary

This is a school management and interactive learning platform designed to bridge the gap between administrators, teachers, students, and parents. Powered by advanced artificial intelligence (RAG vector searches and Google Gemini), real-time WebSockets, and a fast, responsive Progressive Web App (PWA) client, it streamlines day-to-day school operations, automates teacher workloads, provides parents with transparent insights, and delivers a customized AI-guided tutor for students.

---

### Key Platform Dimensions & User Portals

The platform is divided into four primary software clients supporting six distinct user roles:

| User Portal | Target Roles | Primary Focus |
| :--- | :--- | :--- |
| **School Admin Panel** | School Administrators | Institutional setup (classes, sections, subjects), user onboarding, approval workflows, scheduling, and exam registry. |
| **Teacher PWA / Portal** | Subject & Class Teachers | Day-to-day class session tracking, student attendance, digital homework, real-time classroom chat, exam scheduling and grading, and AI-enabled teaching aids. |
| **Student PWA** | Students | RAG-based AI textbook tutoring, text & voice interactive learning, homework tracker, weekly timetables, and textbook-based RAG single and multiplayer quizzes. |
| **Parent PWA** | Parents / Guardians | Real-time multi-child overview, homework completion metrics, monthly attendance calendar, school bus GPS tracking, performance analytics, and digital report cards. |
| **Driver Portal / Role** | Bus Drivers | Real-time GPS location sharing and route tracking. |

---

### Comprehensive Feature Directory by User Persona



#### 2. School Admin Workspace (Institutional Setup)
The administrative engine allows school admins to fully register, schedule, and monitor academic functions.
* **Core Curriculum Configuration**: Define the school's structure by adding Classes (e.g., Class 6, Class 7), Sections, and academic Subjects (e.g., Mathematics, Science, English).
* **Multi-Modal User Seeding (Bulk Ingestion)**: Upload CSV files to bulk-register students, teachers, parents, and subjects in seconds, automatically creating login rosters.
* **Class & Subject Teacher Assignments**: Map subject specialists to specific sections and select a designated **Class Teacher** for each section.
* **Master Timetable Scheduler**: Construct daily and weekly class schedules that automatically distribute to student, parent, and teacher agendas.
* **Bulletproof Profile Verification Pipeline**: Track and approve student profile updates, teacher onboarding, and parent-student links before they access sensitive academic data.
* **Unified Notification Dispatcher**: Send announcements, notices, and emergency alerts to specific target roles (e.g., all parents, all teachers).
* **Automated WhatsApp Integration**: Instant delivery of exam schedules, exam results, and absent notifications directly to parents' registered WhatsApp numbers.

#### 3. Teacher Workspace (Integrated Class Management)
The Teacher Dashboard empowers educators by automating administrative tasks and offering AI assistant tools.
* **Live Class Sessions & Timer**: Start a class session directly from the timetable. The system displays a live session timer tracking class duration.
* **One-Click Live Attendance**: Take student attendance instantly at the start of a class session. Mark students as Present, Absent, or on Leave.
* **Digital Homework & Analytics**: Create and distribute homework assignments for specific subject-sections. Review submissions and track analytics (e.g., completion rates, late submissions).
* **AI Teaching Co-Pilot**:
  * *AI Question Paper Generator*: Create customized, CBSE-compliant homework sheets and exam question papers by selecting a topic, difficulty, and target marks.
  * *AI Lesson Summary Builder*: Instantly generate lesson plans, course summaries, and key takeaways for any chapter.
  * *PDF Exporter*: Download generated question papers and summaries as beautifully styled PDF files for printing and distribution.
* **Classroom Chat Rooms**: Engage with students in real-time, subject-specific class chat rooms scoped by teacher, section, and subject.
* **CBSE-Aligned Grading Suite**: Create exams, enter marks for theory and practical split assessments, and transition report cards from draft status to published parent views.

#### 4. Student Portal (Personal Learning Companion)
The Student PWA is optimized for mobile and desktop, acting as a virtual school desk.
* **RAG-based AI Textbook Tutor**:
  * *Zero-Hallucination Search*: Query the AI tutor on any subject. The system runs a semantic vector search (via ChromaDB) across uploaded CBSE textbooks.
  * *Source Citation*: All responses provide direct references (e.g., "Source: Class 6 Science - Chapter 3") so students can check the material.
  * *Grade-Level Context Filter*: The AI automatically adjusts its language and complexity based on the logged-in student's class level.
* **Interactive Voice Tutor**: Ask questions using voice chat. The tutor responds audibly with a synchronized visual robot/avatar indicating whether it is listening, thinking, or speaking.
* **Timetable & Daily Schedule**: View today's classes, subjects, timings, and active homework tasks.
* **Homework Submissions**: View assigned tasks, track deadlines, and mark assignments as completed.
* **Live Classroom Challenges**: Take part in multiplayer quiz lobbies hosted by teachers, or play single-player quiz modes to reinforce classroom concepts.

#### 5. Parent Dashboard (Student Progress Analytics)
The Parent PWA gives parents a transparent, visual summary of their child's academic journey.
* **Multi-Child Unified Access**: Seamlessly switch profiles to view details for multiple children linked to the same guardian.
* **Homework Completion Tracker**: Track the ratio of pending versus completed homework assignments with interactive cards.
* **Detailed Monthly Attendance logs**: View attendance summaries, month-by-month percentages, and a chronological log of presence, absences, or leaves.
* **Real-Time School Bus Tracking**: View the live GPS location, route progress, and ETA of the child's school bus directly on the parent dashboard.
* **Digital Academics & Report Cards**:
  * Select specific exams (e.g., midterm, pre-board) and view subject-wise scores.
  * View grade calculations, theory-practical splits, and remarks.
  * Download official, formatted PDF report cards.

#### 6. Driver Workspace (GPS Tracking)
The Driver Portal enables real-time location streaming for student safety and transit transparency.
* **Live Route & GPS Streaming**: Log in, start/stop active bus routes, and stream real-time GPS location details.
* **Transit Status Reporting**: Mark student boarding/deboarding alerts.

---

### Core Technology Stack & Innovations

* **Vector Search Engine (RAG)**: Integrates **ChromaDB** with **Google Gemini APIs** to run private textbook lookups, ensuring learning content is completely restricted to approved textbooks.
* **Dynamic Token Economy**: A custom credit system tracking AI transactions (tokens). Administrators set monthly budgets for students and teachers to control cloud operational expenses.
* **Real-Time Collaboration**: Utilizes **WebSockets (Socket.io)** for instant group chat notifications, live class sessions, and real-time quiz lobbies.
* **Responsive Mobile Experience**: Built as a Progressive Web App (PWA) using **React** and **Material-UI (MUI)**, ensuring a native app-like experience with fast load times and responsive desktop grids.
* **Geolocation & Notification APIs**: Geolocation GPS tracking for drivers, and API integration for automated WhatsApp notification dispatches.
