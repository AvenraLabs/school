import { useState, useEffect, useRef, useMemo } from "react";
import {
  Container,
  CircularProgress,
  Typography,
  Box,
  Stack,
  Chip,
  Fab,
  Skeleton,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useDiary } from "./useDiary";
import { useAuth } from "../../auth/AuthProvider";
import CreateHomeworkDialog from "./CreateHomeworkDialog";

// ── Subject colour palette ──────────────────────────────────────────────────
const SUBJECT_COLORS = {
  mathematics: { bg: "#fff7ed", accent: "#f97316", text: "#9a3412" },
  math:        { bg: "#fff7ed", accent: "#f97316", text: "#9a3412" },
  maths:       { bg: "#fff7ed", accent: "#f97316", text: "#9a3412" },
  science:     { bg: "#f0fdf4", accent: "#10b981", text: "#065f46" },
  english:     { bg: "#eef2ff", accent: "#6366f1", text: "#3730a3" },
  history:     { bg: "#fffbeb", accent: "#f59e0b", text: "#78350f" },
  geography:   { bg: "#f7fee7", accent: "#84cc16", text: "#3a5c13" },
  physics:     { bg: "#eff6ff", accent: "#3b82f6", text: "#1e3a8a" },
  chemistry:   { bg: "#fdf4ff", accent: "#a855f7", text: "#581c87" },
  biology:     { bg: "#f0fdf4", accent: "#22c55e", text: "#14532d" },
  social:      { bg: "#fff7ed", accent: "#fb923c", text: "#7c2d12" },
  computer:    { bg: "#f0f9ff", accent: "#0ea5e9", text: "#0c4a6e" },
  hindi:       { bg: "#fef2f2", accent: "#ef4444", text: "#7f1d1d" },
  tamil:       { bg: "#fef2f2", accent: "#dc2626", text: "#7f1d1d" },
  default:     { bg: "#f5f3ff", accent: "#8b5cf6", text: "#4c1d95" },
};

function getSubjectColor(name = "") {
  const key = name.toLowerCase().trim();
  return (
    SUBJECT_COLORS[key] ||
    Object.entries(SUBJECT_COLORS).find(([k]) => key.includes(k))?.[1] ||
    SUBJECT_COLORS.default
  );
}

// ── Due date helpers ────────────────────────────────────────────────────────
function getDueLabel(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / 86400000);
  if (diff < 0)  return { label: "Overdue",    color: "#ef4444", bg: "#fef2f2" };
  if (diff === 0) return { label: "Due Today",  color: "#f97316", bg: "#fff7ed" };
  if (diff === 1) return { label: "Tomorrow",   color: "#f59e0b", bg: "#fffbeb" };
  return {
    label: `Due ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
    color: "#64748b",
    bg: "#f1f5f9",
  };
}

// ── Date group header label ─────────────────────────────────────────────────
function formatGroupDate(dateKey) {
  if (dateKey === "unknown") return { label: "No Date", sub: "" };
  const d = new Date(dateKey);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((today - d) / 86400000);
  if (diff === 0) return { label: "Today", sub: d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) };
  if (diff === 1) return { label: "Yesterday", sub: d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) };
  return {
    label: d.toLocaleDateString(undefined, { weekday: "long" }),
    sub: d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }),
  };
}

// ── Filter chip tabs ─────────────────────────────────────────────────────────
const FILTERS = ["All", "Today", "This Week", "Overdue"];

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const t = new Date();
  return d.toDateString() === t.toDateString();
}

function isThisWeek(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  return d >= startOfWeek && d < endOfWeek;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return d < t;
}

// ── Skeleton card ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <Box
      sx={{
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid rgba(0,0,0,0.05)",
        mb: 1.5,
        display: "flex",
      }}
    >
      <Box sx={{ width: 4, flexShrink: 0, bgcolor: "#e2e8f0" }} />
      <Box sx={{ flex: 1, p: 2 }}>
        <Skeleton variant="rounded" width={80} height={22} sx={{ mb: 1.5, borderRadius: "8px" }} />
        <Skeleton variant="text" width="90%" height={16} />
        <Skeleton variant="text" width="60%" height={16} />
        <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
          <Skeleton variant="rounded" width={70} height={20} sx={{ borderRadius: "8px" }} />
          <Skeleton variant="rounded" width={60} height={20} sx={{ borderRadius: "8px" }} />
        </Box>
      </Box>
    </Box>
  );
}

// ── Homework card ─────────────────────────────────────────────────────────
function HomeworkCard({ item }) {
  const subjectName =
    item.Subject?.name || item.subject?.name || item.subject || "Subject";
  const dueDate = item.homework_date || item.due_date || "";
  const className =
    item.Class?.class_name || item.class?.class_name || item.class?.name || "";
  const sectionName = item.Section?.name || item.section?.name || "";
  const teacherName =
    item.Teacher?.user?.name ||
    item.teacher?.user?.name ||
    item.teacher?.name ||
    "";

  const colors = getSubjectColor(subjectName);
  const dueInfo = getDueLabel(dueDate);
  const isOverdueItem = dueInfo?.label === "Overdue";

  return (
    <Box
      sx={{
        display: "flex",
        borderRadius: "16px",
        overflow: "hidden",
        background: colors.bg,
        border: isOverdueItem
          ? `1.5px solid ${colors.accent}40`
          : "1px solid rgba(0,0,0,0.05)",
        boxShadow: isOverdueItem
          ? `0 0 0 3px ${colors.accent}15`
          : "0 1px 4px rgba(0,0,0,0.04)",
        mb: 1.5,
        transition: "box-shadow 0.2s, transform 0.15s",
        "&:active": { transform: "scale(0.99)" },
      }}
    >
      {/* Left accent bar */}
      <Box
        sx={{
          width: "5px",
          flexShrink: 0,
          background: colors.accent,
          borderRadius: "0 0 0 0",
        }}
      />

      {/* Content */}
      <Box sx={{ flex: 1, p: "14px 16px 12px" }}>
        {/* Top row: subject chip + due badge */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Chip
            label={subjectName}
            size="small"
            sx={{
              fontWeight: 800,
              fontSize: "11px",
              height: "22px",
              bgcolor: colors.accent,
              color: "#fff",
              borderRadius: "7px",
              letterSpacing: "0.01em",
            }}
          />
          {dueInfo && (
            <Chip
              label={dueInfo.label}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "10px",
                height: "20px",
                bgcolor: dueInfo.bg,
                color: dueInfo.color,
                borderRadius: "7px",
                border: `1px solid ${dueInfo.color}30`,
              }}
            />
          )}
        </Stack>

        {/* Class + section */}
        {(className || sectionName) && (
          <Typography
            sx={{
              fontSize: "11px",
              fontWeight: 600,
              color: colors.accent,
              opacity: 0.75,
              mb: 0.5,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            {[className, sectionName].filter(Boolean).join(" · ")}
          </Typography>
        )}

        {/* Description */}
        {item.description && (
          <Typography
            sx={{
              fontSize: "14px",
              fontWeight: 450,
              color: "#334155",
              lineHeight: 1.55,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {item.description}
          </Typography>
        )}

        {/* Footer: teacher */}
        {teacherName && (
          <Typography
            sx={{
              fontSize: "11px",
              color: "#94a3b8",
              mt: 1,
              fontWeight: 500,
            }}
          >
            👤 {teacherName}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DiaryPage() {
  const { user } = useAuth();
  const { items, loading, error, refresh, loadMore, hasMore, loadingMore } = useDiary();
  const [showCreate, setShowCreate] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const sentinelRef = useRef(null);

  const canCreate = user?.role === "teacher" || user?.role === "school_admin";

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) loadMore();
      },
      { rootMargin: "100px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMore]);

  // Filter items
  const filtered = useMemo(() => {
    if (activeFilter === "All") return items;
    const dateField = (item) => item.homework_date || item.due_date || item.created_at || item.createdAt;
    if (activeFilter === "Today")     return items.filter((i) => isToday(dateField(i)));
    if (activeFilter === "This Week") return items.filter((i) => isThisWeek(dateField(i)));
    if (activeFilter === "Overdue")   return items.filter((i) => isOverdue(dateField(i)));
    return items;
  }, [items, activeFilter]);

  // Group by date
  const groupedEntries = useMemo(() => {
    return Object.entries(
      filtered.reduce((acc, item) => {
        const raw =
          item.created_at || item.createdAt || item.homework_date || "unknown";
        const dateKey =
          raw === "unknown" ? "unknown" : new Date(raw).toISOString().split("T")[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
      }, {})
    ).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <Container maxWidth="sm" sx={{ pt: 3, pb: 12 }}>
      {/* ── Header ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Box>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ fontFamily: "'Outfit', sans-serif", color: "#0f172a", lineHeight: 1 }}
          >
            Homework
          </Typography>
          {!loading && (
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 500 }}>
              {items.length} {items.length === 1 ? "entry" : "entries"}
            </Typography>
          )}
        </Box>
      </Stack>

      {/* ── Filter Chips ── */}
      <Box
        sx={{
          display: "flex",
          gap: 1,
          overflowX: "auto",
          pb: 0.5,
          mb: 3,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {FILTERS.map((f) => (
          <Chip
            key={f}
            label={f}
            onClick={() => setActiveFilter(f)}
            sx={{
              flexShrink: 0,
              fontWeight: 700,
              fontSize: "12px",
              height: "30px",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.18s",
              ...(activeFilter === f
                ? {
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff",
                    boxShadow: "0 3px 10px rgba(99,102,241,0.35)",
                  }
                : {
                    background: "#f1f5f9",
                    color: "#64748b",
                    "&:hover": { background: "#e2e8f0" },
                  }),
            }}
          />
        ))}
      </Box>

      {/* ── Loading skeleton ── */}
      {loading && (
        <Box>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </Box>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            px: 3,
            borderRadius: "16px",
            bgcolor: "#fef2f2",
            border: "1px solid #fecaca",
          }}
        >
          <Typography sx={{ fontSize: "32px", mb: 1 }}>⚠️</Typography>
          <Typography fontWeight={700} color="#dc2626">Failed to load homework</Typography>
          <Typography variant="body2" color="#ef4444" sx={{ mt: 0.5 }}>{error}</Typography>
        </Box>
      )}

      {/* ── Empty state ── */}
      {!loading && !error && filtered.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 3,
            borderRadius: "20px",
            background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
            border: "1px dashed rgba(139,92,246,0.25)",
            mt: 2,
          }}
        >
          <Typography sx={{ fontSize: "52px", mb: 1.5, lineHeight: 1 }}>
            {activeFilter === "Overdue" ? "✅" : "📚"}
          </Typography>
          <Typography
            fontWeight={800}
            sx={{ fontSize: "17px", color: "#4c1d95", fontFamily: "'Outfit', sans-serif" }}
          >
            {activeFilter === "Overdue"
              ? "No overdue homework!"
              : activeFilter === "Today"
              ? "Nothing due today"
              : "All caught up!"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#7c3aed", mt: 0.5, opacity: 0.7 }}>
            {activeFilter === "All"
              ? "No homework has been assigned yet."
              : `No homework matches the "${activeFilter}" filter.`}
          </Typography>
        </Box>
      )}

      {/* ── Grouped homework feed ── */}
      {!loading && !error && groupedEntries.map(([dateKey, dayItems]) => {
        const { label, sub } = formatGroupDate(dateKey);
        const isRecent = label === "Today" || label === "Yesterday";

        return (
          <Box key={dateKey} sx={{ mb: 3 }}>
            {/* Date group header */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  sx={{
                    fontSize: isRecent ? "16px" : "13px",
                    fontWeight: isRecent ? 900 : 700,
                    color: isRecent ? "#0f172a" : "#475569",
                    fontFamily: "'Outfit', sans-serif",
                    lineHeight: 1,
                  }}
                >
                  {label}
                  {label === "Today" && (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-block",
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: "#22c55e",
                        ml: 1,
                        verticalAlign: "middle",
                        mb: "1px",
                        boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
                      }}
                    />
                  )}
                </Typography>
                {sub && (
                  <Typography
                    sx={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontWeight: 500,
                      mt: "2px",
                    }}
                  >
                    {sub}
                  </Typography>
                )}
              </Box>
              <Box sx={{ flex: 1, height: "1px", bgcolor: "#e2e8f0" }} />
              <Chip
                label={dayItems.length}
                size="small"
                sx={{
                  fontWeight: 800,
                  fontSize: "11px",
                  height: "20px",
                  bgcolor: "#f1f5f9",
                  color: "#64748b",
                  borderRadius: "7px",
                  minWidth: "28px",
                }}
              />
            </Stack>

            {/* Cards */}
            {dayItems.map((item) => (
              <HomeworkCard key={item.id} item={item} />
            ))}
          </Box>
        );
      })}

      {/* ── IntersectionObserver sentinel ── */}
      {!loading && (
        <Box ref={sentinelRef} sx={{ height: 4, mt: 1 }} />
      )}

      {/* ── Load more spinner ── */}
      {loadingMore && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={22} sx={{ color: "#8b5cf6" }} />
        </Box>
      )}

      {/* ── End of feed ── */}
      {!hasMore && items.length > 0 && !loading && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            color: "#cbd5e1",
            fontWeight: 600,
            pt: 2,
            pb: 1,
          }}
        >
          You've seen all homework ✓
        </Typography>
      )}

      {/* ── Teacher FAB ── */}
      {canCreate && (
        <>
          <Box sx={{ position: "fixed", bottom: 88, right: 16, zIndex: 1000 }}>
            <Fab
              onClick={() => setShowCreate(true)}
              sx={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.45)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  boxShadow: "0 6px 24px rgba(99,102,241,0.55)",
                },
                transition: "all 0.2s",
              }}
            >
              <Add sx={{ color: "#fff" }} />
            </Fab>
          </Box>

          <CreateHomeworkDialog
            open={showCreate}
            onClose={() => setShowCreate(false)}
            onSuccess={() => {
              setShowCreate(false);
              if (refresh) refresh();
            }}
          />
        </>
      )}
    </Container>
  );
}
