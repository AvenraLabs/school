# SchoolIQ Enterprise System Architecture

## 1. System Overview

SchoolIQ is a multi-tenant, enterprise-grade AI-powered School Management ERP system. It consists of three primary tiers:
1. **Backend API & Real-time Server** (`/backend`): Node.js + Express 5, Sequelize ORM, PostgreSQL, Redis, Socket.io, Google Gemini 2.5/Flash AI, and ChromaDB.
2. **School Admin & Super Admin Panel** (`/adminpanel`): React 18 + Vite, TailwindCSS, Material UI components, Axios layer.
3. **Student, Teacher & Parent PWA / Mobile App** (`/pwa`): React 18 + Vite, TailwindCSS, Capacitor (Cross-platform iOS/Android), Web Sockets.

---

## 2. Architectural Diagram

```
+-----------------------------------------------------------------------+
|                             CLIENT LAYER                              |
|                                                                       |
|  +-----------------------------------+   +-------------------------+  |
|  | Admin Panel (React 18 / Vite)     |   | PWA / Mobile (React/Cap)|  |
|  | Admin Management Console          |   | Teachers, Students      |  |
|  +-----------------------------------+   +-------------------------+  |
+-----------------------------------||----------------------------------+
                                    || HTTPS / WSS
                                    \/
+-----------------------------------------------------------------------+
|                          API & REALTIME GATEWAY                       |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | Express 5 Gateway (CORS, Helmet, Rate Limiter, Morgan, JWT Auth)  |  |
|  +-----------------------------------------------------------------+  |
|                                   |                                   |
|       +---------------------------+---------------------------+       |
|       |                           |                           |       |
|       v                           v                           v       |
|  [HTTP Controllers]     [Socket.io Realtime Engine]   [Cron Schedulers]  |
|  - Multi-tenant Scoping  - Live Transport Tracking     - Library Overdue |
|  - Role Middleware       - Group Chat Messaging        - Fee Collection  |
|  - Zod Validation        - Multiplayer Quiz Games      - Annual AI Quotas|
|                          - Push Alerts Notification                   |
+-----------------------------------||----------------------------------+
                                    ||
                                    \/
+-----------------------------------------------------------------------+
|                          PERSISTENCE & INFRA                      |
|                                                                       |
|  +------------------------+  +-------------------+  +---------------+ |
|  | PostgreSQL (Sequelize) |  | Redis (ioredis)   |  | Vector DB     | |
|  | Relational Schema      |  | Identity Caching  |  | ChromaDB      | |
|  | Foreign Keys & Scopes  |  | Realtime Cache    |  | RAG Contexts  | |
|  +------------------------+  +-------------------+  +---------------+ |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | External Integrations: Google Gemini 2.5, Google Vertex AI (Veo 3), WhatsApp |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

---

## 3. Core Architecture Concepts

### Multi-Tenancy Strategy
- **School Scoping**: Every database entity (except `super_admin` system configs and global RAG textbook chapters) is strictly tied to `school_id`.
- **Middleware Isolation**: The `protect` middleware resolves the user identity from Redis/DB and attaches `req.user.school_id`. All controllers enforce `school_id` scoping in query predicates (`where: { school_id }`).

### Authentication & Authorization
- **Dual Token JWT Architecture**: Short-lived Access Tokens (`JWT_EXPIRES_IN=15m`) containing `id`, `role`, `school_id`, `school_board`, and profile claims (`teacher_id`, `student_id`, `driver_id`), paired with long-lived Refresh Tokens (`REFRESH_TOKEN_EXPIRES_IN=30d`) stored in a multi-device database table (`refresh_tokens`).
- **Silent Token Rotation & Revocation**: Client apps (`adminpanel` & `pwa`) use automated Axios interceptors to silently exchange refresh tokens for new access tokens upon HTTP `401`. Refresh tokens are stored per device/session in `refresh_tokens`, rotated on each exchange, and revoked immediately on logout, password changes, or admin password resets.
- **Role-based Access Control (RBAC)**: `allowRoles("super_admin", "school_admin", "teacher", "student", "driver")` middleware guards endpoints.
- **Identity Caching**: Auth identities are cached in Redis (`auth:identity:<userId>`) for 5 minutes to ensure high performance without database spam.

### Real-Time Communications & Dual Push Architecture
Powered by `socket.io` and standard **VAPID Web Push API**:
1. `initGameSocket(io)` — Multiplayer live Kahoot-style classroom quiz competition.
2. `initGroupChatSocket(io)` — Real-time class, subject, and section group messaging with media attachments.
3. `initNotificationSocket(io)` — Active foreground real-time socket broadcasts and poster popups (`notification:new`).
4. `initTransportSocket(io)` — High-frequency live GPS vehicle location streaming for bus tracking.
5. **Background Web Push (VAPID)** — True offline/background PWA system notifications powered by `web-push` library, custom Service Worker `sw-push.js` event listeners (`push` and `notificationclick`), and PostgreSQL `push_subscriptions` endpoint store. Automatically cleans up expired/revoked (404/410) push tokens.


### AI & RAG Engine Architecture
1. **Curriculum Knowledge Ingestion**: Textbook PDFs (CBSE/State Board) parsed and chunked via `pdfjs-dist` into `textbook_chapters` metadata table and `ChromaDB` vector embeddings.
2. **Teacher AI Tools**: AI Question Paper generator, Lesson Planner, Lesson Summarizer leveraging `@google/genai` (Gemini Flash & Pro models).
3. **AI Video Generation**: Google Vertex AI (Veo 3: `veo-3.0-fast-001`) integration for generating educational topic videos asynchronously.
4. **Token Economics**: Token quotas, accounts, policies, and ledger transactions per school/role to control AI API costs.

---

## 4. Subsystems & Services

1. **Finance Subsystem**: Fee definitions, class/individual student fees, concessions, partial payments, receipt counter, void tracking, and expense vouchers.
2. **Academic & Examination Subsystem**: Academic years, term promotion wizard, Exam Master templates, Exam scheduling, subject marks entry, grading scale mapping, report card generators.
3. **Library Subsystem**: Cataloging, multi-copy availability, loan issuing, automated overdue fine calculation and in-app notification reminder cron jobs.
4. **Transport Subsystem**: Drivers, vehicles, student transport allocations, live trip sessions, high-frequency GPS logging, change request approvals.
5. **Approval Workflow Subsystem**: Teacher & student registration approvals, profile update requests, audit logging.
6. **WhatsApp Cloud API Integration**: Meta Graph API `v21.0` business-initiated message templates (`absent_alert`, `general_announcement`, `fee_receipt`), quota limits, and live Webhook status callback handling (`wamid` tracking for `sent`, `delivered`, `read`, `failed`).
7. **Multi-Tenant Module Feature Toggles**: Dynamic per-school feature suite locking (`schools.enabled_modules` JSONB column) enforced via `requireModuleEnabled(moduleKey)` route middleware and dynamic UI filtering across 7 core modules (`transport`, `library`, `finance`, `ai_tutor`, `ai_tools`, `ai_video`, `whatsapp`).
8. **Auto Timetable Generator Subsystem**: Multi-tenant, year-scoped bell schedule templates, periods-per-week section rules, weak-subject inverse recommendation engine, pre-flight readiness checks, async non-blocking generation jobs (`timetable_generation_jobs`), in-memory CSP solver, and admin preview-and-confirm bulk transaction writer.

