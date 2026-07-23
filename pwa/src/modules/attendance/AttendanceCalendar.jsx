import { Box, Grid, Stack, Typography, FormControl, Select, MenuItem } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import dayjs from "dayjs";
import { useMemo } from "react";

const STATUS_LABEL = {
  present: "P",
  absent: "A",
  leave: "L",
  on_duty: "OD",
};

const STATUS_COLOR = (theme, status) => {
  if (status === "present") return theme.palette.success.main;
  if (status === "absent") return theme.palette.error.main;
  if (status === "leave") return theme.palette.warning.main;
  if (status === "on_duty") return theme.palette.info.main;
  return theme.palette.divider;
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AttendanceCalendar({
  details = [],
  month,
  onMonthChange,
}) {
  const theme = useTheme();
  const currentMonth = month ? dayjs(month).startOf("month") : dayjs().startOf("month");

  const statusMap = details.reduce((acc, item) => {
    const dateKey = dayjs(item.date || item.created_at).format("YYYY-MM-DD");
    const status = (item.status || "").toLowerCase();
    if (!STATUS_LABEL[status]) return acc;

    const priority = { absent: 4, leave: 3, on_duty: 2, present: 1 };
    const current = acc[dateKey];
    if (!current || priority[status] > priority[current]) {
      acc[dateKey] = status;
    }
    return acc;
  }, {});

  const currentYear = dayjs().year();
  const months = useMemo(() => {
    const list = [];
    // Previous year (all 12 months)
    for (let m = 0; m < 12; m++) {
      list.push(dayjs().year(currentYear - 1).month(m).startOf("month"));
    }
    // Current year (up to current month)
    const currentMonthIdx = dayjs().month();
    for (let m = 0; m <= currentMonthIdx; m++) {
      list.push(dayjs().year(currentYear).month(m).startOf("month"));
    }
    // Sort descending (newest first)
    return list.sort((a, b) => b.valueOf() - a.valueOf());
  }, [currentYear]);

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ fontFamily: "'Outfit', sans-serif" }}>
            {currentMonth.format("MMMM YYYY")}
          </Typography>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={currentMonth.format("YYYY-MM")}
              onChange={(e) => {
                const next = months.find((m) => m.format("YYYY-MM") === e.target.value);
                if (next && onMonthChange) onMonthChange(next);
              }}
              sx={{
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 700,
                bgcolor: theme.palette.background.paper,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.divider,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              {months.map((m) => (
                <MenuItem
                  key={m.format("YYYY-MM")}
                  value={m.format("YYYY-MM")}
                  sx={{ fontSize: "12px", fontWeight: 600 }}
                >
                  {m.format("MMMM YYYY")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 0.5,
            mb: 1,
          }}
        >
          {WEEKDAYS.map((d) => (
            <Typography
              key={d}
              variant="caption"
              color="text.secondary"
              sx={{ textAlign: "center" }}
            >
              {d}
            </Typography>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 0.5,
          }}
        >
          {(() => {
            const start = currentMonth.startOf("month");
            const end = currentMonth.endOf("month");
            const daysInMonth = end.date();
            const startOffset = (start.day() + 6) % 7;
            const cells = [];
            for (let i = 0; i < startOffset; i += 1) {
              cells.push(null);
            }
            for (let d = 1; d <= daysInMonth; d += 1) {
              cells.push(start.date(d));
            }
            return cells.map((date, idx) => {
              if (!date) {
                return <Box key={`empty-${idx}`} sx={{ height: 52 }} />;
              }
              const dateKey = date.format("YYYY-MM-DD");
              const status = statusMap[dateKey];
              const color = STATUS_COLOR(theme, status);
              return (
                <Box
                  key={dateKey}
                  sx={{
                    height: 52,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: status ? alpha(color, 0.12) : theme.palette.background.default,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {date.date()}
                  </Typography>
                  {status ? (
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color }}>
                      {STATUS_LABEL[status]}
                    </Typography>
                  ) : (
                    <Typography variant="subtitle2" sx={{ color: "transparent" }}>
                      -
                    </Typography>
                  )}
                </Box>
              );
            });
          })()}
        </Box>
      </Box>
    </Stack>
  );
}
