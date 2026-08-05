# UI Guidelines & Design System Memory

> **Scope**: Applies to all frontend development across `adminpanel` and `pwa`.
> **Primary Objective**: Ensure production-grade, enterprise-quality, accessible, and visually stunning UI that follows a consistent design language.

---

## 1. Core Color Palette & Design Tokens

Always stick to the official warm-neutral palette. Do NOT use generic saturated blues, bright purples, or unstyled native browser inputs.

| Token Purpose | Color Hex | Tailwind / Utility Usage |
| :--- | :--- | :--- |
| **Page Background** | `#FAFAF8` | `bg-[#FAFAF8]` (Warm neutral canvas) |
| **Card / Surface** | `#FFFFFF` | `bg-white` |
| **Borders & Dividers** | `#E4E1D8` | `border-[#E4E1D8]` |
| **Primary Text** | `#14213D` | `text-[#14213D]` |
| **Secondary Text** | `#64748B` | `text-[#64748B]` or `text-slate-500` |
| **Signature Accent** | `#2F6F5E` | `bg-[#2F6F5E]`, `text-[#2F6F5E]`, `border-[#2F6F5E]` (Signature Teal) |
| **Accent Hover/Soft** | `#EAF3F0` | `bg-[#EAF3F0]` (Hover, active selection highlight) |
| **Danger / Destructive**| `#EF4444` | `bg-red-500`, `text-red-600`, `bg-red-50` |
| **Success Status** | `#10B981` | `bg-emerald-500`, `text-emerald-600`, `bg-emerald-50` |
| **Warning Status** | `#F59E0B` | `bg-amber-500`, `text-amber-600`, `bg-amber-50` |

---

## 2. Page Headers & Action Bars

- **Top Navbar Handles Titles**: Page title and main breadcrumbs are ALREADY rendered in the top application navbar.
- **NO Redundant Hero Banners**: Do NOT add dark blue, indigo, or dark teal gradient hero boxes or giant text descriptions at the top of subpages.
- **Compact Action Toolbar Pattern**:
  If a page needs page-level actions or search/filters, use an ultra-compact single-row card header:

```jsx
<div className="bg-white border border-[#E4E1D8] rounded-[10px] p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
  <div className="flex items-center gap-3">
    <h2 className="font-display font-bold text-base text-[#14213D]">Module Title</h2>
    {/* Optional count badge or short context */}
  </div>
  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
    {/* Action Buttons */}
  </div>
</div>
```

---

## 3. UI Component Standardization

### 3.1 Shared Primitives
Always import UI components from `src/components/ui/` rather than creating custom elements:
- `Button` — Primary (`bg-[#2F6F5E]`), Secondary, Outline, Danger, Ghost.
- `Card` — Surface container with `bg-white border border-[#E4E1D8] rounded-[10px] p-5 shadow-xs`.
- `Input` & `Select` & `Textarea` — Custom styled inputs overriding native browser focus rings.
- `Table` — Standardized data table container with pagination and sticky actions.
- `StatusBadge` — Soft-colored pill badges for active/inactive/pending states.
- `EmptyState` — Illustrated/Icon-based empty view with descriptive message & primary action button.
- `Modal` & `ConfirmDialog` — Accessible dialogs for forms & destructive action confirmations.
- `StatsCard` — Compact metric cards for dashboards.

### 3.2 Custom Dropdowns & Focus Rules
- **NO Native Blue Focus Rings or OS Dropdown Highlights**: All dropdowns, selects, text inputs, and checkboxes MUST use custom styling highlighting hovered/selected items in signature soft teal (`#EAF3F0` / `#2F6F5E`) with checkmarks.
- **NO Superfluous Badges**: Do NOT pollute card headers with unnecessary technical pills like "Counter Mode · Auto Focus Enabled". Keep UI clean, readable, and intentional.

---

## 4. Mandatory Page & Component States

Every page, dashboard module, or data feature MUST implement all 6 essential UX states:

1. **Loading State**: Use skeleton loaders matching the layout structure (e.g., `<Skeleton className="h-10 w-full rounded-md" />`), not raw text "Loading...".
2. **Empty State**: Show `<EmptyState>` with a clear icon, title, description, and primary CTA button when datasets have 0 items.
3. **Error State**: Render inline error alert with retry button when API requests fail.
4. **Success Feedback**: Provide immediate toast or alert feedback on successful updates/creations.
5. **Confirmation Dialog**: Prompt via `<ConfirmDialog>` before executing any destructive action (delete, archive, deactivate).
6. **Form Saving State**: Disable submit buttons and show loading spinners (`isSubmitting`) to prevent duplicate submissions.

---

## 5. Table Layout & Data List Rules

All tables in `adminpanel` and `pwa` must support:
- **Search & Filters**: Top bar search input + clear filter reset.
- **Sorting**: Clickable table headers with column direction arrows.
- **Pagination**: Bottom bar showing `Page X of Y`, rows-per-page selector, and Previous/Next buttons.
- **Sticky Actions Column**: Keep the last column (`Actions`) fixed to the right on wide scrollable tables.
- **Responsive Layout**: Table containers must have `overflow-x-auto` to prevent horizontal breaking on tablets or mobile web.

---

## 6. PWA Mobile Responsive Guidelines

- **Touch Target Sizes**: Minimum `44px` height for all primary clickable buttons and inputs on mobile viewports.
- **Adaptive Layouts**: Use responsive breakpoints (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` or `flex-col md:flex-row`).
- **Dialogs & Modals**: Convert standard modals into bottom-sheet drawups or full-screen overlays on small screens (`< md`).

---

## 7. Clean Code & Architecture Rules

- **No Raw Inline `style={{ ... }}`**: Always use Tailwind utilities or CSS tokens unless calculating dynamic pixel offsets.
- **No Direct `fetch()` Calls**: Always call API endpoints through the application's central `apiService` layer.
- **Grid Spacing System**: Follow an 8px grid system (`gap-2`, `gap-4`, `gap-6`, `p-4`, `p-6`).
- **No Duplicated UI Logic**: Move repeated UI blocks into small, reusable components.
