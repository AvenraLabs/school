import { Paper, Typography, Box } from "@mui/material";

export default function DashboardCard({ title, value, subtitle }) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2.5,
        borderRadius: 4,
        minHeight: "115px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        border: "1px solid #f1f5f9"
      }}
    >
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {title}
        </Typography>

        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5, color: "#1e1b4b" }}>
          {value}
        </Typography>
      </Box>

      <Box>
        {subtitle ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "11px" }}>
            {subtitle}
          </Typography>
        ) : (
          <Typography variant="caption" sx={{ display: "block", fontSize: "11px", color: "transparent", select: "none" }}>
            Spacer
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
