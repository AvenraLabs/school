# Workspace Agent Rules & Design Guidelines

## 1. Page Header & Layout Rule
- **Top Bar Priority**: Page title and breadcrumbs are ALREADY rendered in the top navbar. Do NOT render redundant dark blue/indigo hero banners or giant text descriptions on top of subpages.
- **Compact Page Header / Action Bar**: If a page needs a header toolbar, keep it ultra-compact with title and action buttons on a single row:
  ```jsx
  <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-4 shadow-xs flex items-center justify-between gap-4">
    <h2 className="font-display font-bold text-base text-[#14213D]">[Compact Title / Context]</h2>
    {/* Action Buttons */}
  </div>
  ```
- **Design Tokens Only**: Always maintain warm neutral background (`#FAFAF8`), white card surfaces (`#FFFFFF`), `#E4E1D8` warm neutral borders, `#2F6F5E` signature teal accents, and `#14213D` primary text.
- **NO Blue OS Dropdowns / Focus Rings**: All inputs, textareas, checkboxes, buttons, and `<Select>` dropdown menus MUST use our custom `Select` component from `src/components/ui/Input.jsx` which highlights hovered/selected items in signature soft teal (`#EAF3F0` / `#2F6F5E`) with checkmarks, completely overriding default OS blue highlighting.
- **NO Unnecessary Text Badges**: Do NOT add superfluous UI label pills like "Counter Mode · Auto Focus Enabled". Keep card headers clean and focused.
- **NO dead code or inline `style={{ ... }}` objects**. Always use Tailwind token utilities.
- **Use shared primitives**: `Button`, `Card`, `Input`, `Select`, `Textarea`, `Table`, `StatusBadge`, `EmptyState`, `Modal`, `ConfirmDialog`, `StatsCard`.

## 2. Mandatory Documentation Sync Rule
- **Root Documentation Files**: The workspace maintains three core architectural blueprints in the root folder:
  1. [`ER_DIAGRAM.md`](file:///c:/Users/nessi/Desktop/schooliq/ER_DIAGRAM.md) — Complete database schema, tables, fields, data types, indexes, and entity relationships.
  2. [`SYSTEM_ARCHITECTURE.md`](file:///c:/Users/nessi/Desktop/schooliq/SYSTEM_ARCHITECTURE.md) — High-level system architecture, multi-tenancy, authentication, WebSockets, RAG engine, and subsystem designs.
  3. [`API_DOCUMENTATION.md`](file:///c:/Users/nessi/Desktop/schooliq/API_DOCUMENTATION.md) — Comprehensive API endpoint specifications, route parameters, payload schemas, and RBAC rules.
- **Mandatory Update Trigger**: Whenever you introduce a new module, add/modify/remove a database model, change table schemas, add/update API endpoints, or modify system architecture:
  - You MUST immediately update `ER_DIAGRAM.md`, `SYSTEM_ARCHITECTURE.md`, and `API_DOCUMENTATION.md` to keep them fully synchronized with the codebase.
  - Never leave documentation stale or out of sync.

## 3. Database Schema & Migration Rule
- **NO Raw DDL SQL Queries in `server.js`**: NEVER write inline `db.query("ALTER TABLE...")` or raw DDL schema mutations inside `server.js` or application controllers.
- **Use Migration Scripts in `backend/migrations/`**: All database schema changes, new columns, table alterations, indexes, or custom DDL scripts MUST be placed in individual, timestamped `.cjs` migration files inside `backend/migrations/` (e.g., `20260807000000-add-wamid-to-whatsapp-logs.cjs`).
- **Automated Boot Runner**: The system automatically executes pending migrations in `backend/migrations/` on server boot via `runPendingMigrations()`.
