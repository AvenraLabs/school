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
import { useTheme, alpha } from "@mui/material/styles";
import { Add } from "@mui/icons-material";
import { useDiary } from "./useDiary";
import { useAuth } from "../../auth/AuthProvider";
import CreateHomeworkDialog from "./CreateHomeworkDialog";

function getSubjectThemeColor(name = "", theme) {
  const key = name.toLowerCase().trim();
  let role = "primary";

  if (key.includes("math")) {
    role = "primary";
  } else if (key.includes("science") || key.includes("biology") || key.includes("botany") || key.includes("zoology")) {
    role = "success";
  } else if (key.includes("english") || key.includes("history") || key.includes("civics") || key.includes("art")) {
    role = "info";
  } else if (key.includes("physics") || key.includes("chemistry") || key.includes("computer")) {
    role = "secondary";
  } else if (key.includes("geography") || key.includes("social") || key.includes("economics")) {
    role = "warning";
  } else if (key.includes("hindi") || key.includes("tamil") || key.includes("language")) {
    role = "error";
  } else {
    const charCode = key.charCodeAt(0) || 0;
    const roles = ["primary", "secondary", "info", "success", "warning"];
    role = roles[charCode % roles.length];
  }

  const paletteColor = theme.palette[role] || theme.palette.primary;
  return {
    bg: alpha(paletteColor.main, 0.05),
    accent: paletteColor.main,
    text: paletteColor.dark || paletteColor.main,
  };
}

// ── Due date label (no "Overdue" — just informational) ──────────────────────
function getDueLabel(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / 86400000);
  if (diff === 0) return { label: "Due Today",  color: "#f97316", bg: "#fff7ed" };
  if (diff === 1) return { label: "Tomorrow",   color: "#f59e0b", bg: "#fffbeb" };
  if (diff < 0)  return {
    label: `Due ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
    color: "#94a3b8",
    bg: "#f1f5f9",
  };
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

// ── Filter chip tabs ────────────────────────────────────────────
const FILTERS = ["Today", "Upcoming Due", "All Time"];

function isToday(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const t = new Date();
  return d.toDateString() === t.toDateString();
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

// ── Homework card ──────────────────────────────────────────────────────────
function HomeworkCard({ item }) {
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  const subjectName =
    item.Subject?.name || item.subject?.name || item.subject || "Subject";
  const dueDate = item.homework_date || item.due_date || "";
  const createdAt = item.created_at || item.createdAt || "";
  const className =
    item.Class?.class_name || item.class?.class_name || item.class?.name || "";
  const sectionName = item.Section?.name || item.section?.name || "";
  const teacherName =
    item.Teacher?.user?.name ||
    item.teacher?.user?.name ||
    item.teacher?.name ||
    "";

  const theme = useTheme();
  const colors = getSubjectThemeColor(subjectName, theme);
  const dueInfo = getDueLabel(dueDate);

  return (
    <Box
      sx={{
        display: "flex",
        borderRadius: "16px",
        overflow: "hidden",
        background: colors.bg,
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
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
        {!isStudent && (className || sectionName) && (
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

        {/* Footer: teacher + assigned date */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
          {teacherName ? (
            <Typography sx={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
              👤 {teacherName}
            </Typography>
          ) : <Box />}

          {createdAt && (
            <Typography sx={{ fontSize: "10px", color: "#94a3b8", fontWeight: 500 }}>
              Assigned: {new Date(createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DiaryPage() {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("Today");
  const sentinelRef = useRef(null);

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  const filterParams = useMemo(() => {
    if (activeFilter === "Today") {
      return { created_date: todayStr };
    }
    if (activeFilter === "Upcoming Due") {
      return { due_upcoming: true };
    }
    return {}; // All Time
  }, [activeFilter, todayStr]);

  const { items, total, loading, error, refresh, loadMore, hasMore, loadingMore } = useDiary(filterParams);
  const [showCreate, setShowCreate] = useState(false);

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

  // Group by assigned date
  const groupedEntries = useMemo(() => {
    return Object.entries(
      items.reduce((acc, item) => {
        const raw =
          item.created_at || item.createdAt || item.homework_date || "unknown";
        const dateKey =
          raw === "unknown" ? "unknown" : new Date(raw).toISOString().split("T")[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
      }, {})
    ).sort((a, b) => b[0].localeCompare(a[0]));
  }, [items]);

  return (
    <Container maxWidth="sm" sx={{ pt: 3, pb: 12 }}>
      {/* ── Header ── */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Box>
          <Typography
            variant="h5"
            fontWeight={900}
            sx={{ fontFamily: "'Outfit', sans-serif", color: "text.primary", lineHeight: 1 }}
          >
            Homework
          </Typography>
          {!loading && (
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              Showing {items.length} of {total} {total === 1 ? "entry" : "entries"}
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
              height: "32px",
              px: 0.5,
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.18s",
              ...(activeFilter === f
                ? {
                    background: (theme) =>
                      `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.dark})`,
                    color: "#fff",
                    boxShadow: (theme) =>
                      `0 3px 10px ${alpha(theme.palette.primary.main, 0.35)}`,
                  }
                : {
                    background: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#f1f5f9",
                    color: "text.secondary",
                    "&:hover": {
                      background: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "#e2e8f0",
                    },
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
      {!loading && !error && items.length === 0 && (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            px: 3,
            borderRadius: "20px",
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary?.main || theme.palette.primary.dark, 0.03)} 100%)`,
            border: (theme) =>
              `1px dashed ${alpha(theme.palette.primary.main, 0.25)}`,
            mt: 2,
          }}
        >
          <Typography sx={{ fontSize: "52px", mb: 1.5, lineHeight: 1 }}>📚</Typography>
          <Typography
            fontWeight={800}
            sx={{ fontSize: "17px", color: "primary.dark", fontFamily: "'Outfit', sans-serif" }}
          >
            {activeFilter === "Today"
              ? "No homework created today"
              : activeFilter === "Upcoming Due"
              ? "No upcoming homework due"
              : "No homework found"}
          </Typography>
          <Typography variant="body2" sx={{ color: "primary.main", mt: 0.5, opacity: 0.7 }}>
            {activeFilter === "Today"
              ? "Homework assigned by teachers today will appear here."
              : "Check back later or view All Time history."}
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
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <Typography
                  sx={{
                    fontSize: isRecent ? "16px" : "13px",
                    fontWeight: isRecent ? 900 : 700,
                    color: isRecent ? "text.primary" : "text.secondary",
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
                    sx={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500, mt: "2px" }}
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
      {!loading && <Box ref={sentinelRef} sx={{ height: 4, mt: 1 }} />}

      {/* ── Explicit Load More UI Button ── */}
      {hasMore && !loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
          <Box
            component="button"
            onClick={loadMore}
            disabled={loadingMore}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 3,
              py: 1.2,
              borderRadius: "12px",
              border: "1.5px solid",
              borderColor: "primary.main",
              bgcolor: "transparent",
              color: "primary.main",
              fontWeight: 700,
              fontSize: "13px",
              cursor: loadingMore ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            {loadingMore ? (
              <>
                <CircularProgress size={16} color="primary" />
                Loading more...
              </>
            ) : (
              `Load More (${items.length} of ${total})`
            )}
          </Box>
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
          You've seen all homework ({total} total) ✓
        </Typography>
      )}

      {/* ── Teacher FAB ── */}
      {canCreate && (
        <>
          <Box sx={{ position: "fixed", bottom: 88, right: 16, zIndex: 1000 }}>
            <Fab
              onClick={() => setShowCreate(true)}
              sx={{
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.dark})`,
                boxShadow: (theme) =>
                  `0 4px 20px ${alpha(theme.palette.primary.main, 0.45)}`,
                "&:hover": {
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary?.dark || theme.palette.primary.main})`,
                  boxShadow: (theme) =>
                    `0 6px 24px ${alpha(theme.palette.primary.main, 0.55)}`,
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
