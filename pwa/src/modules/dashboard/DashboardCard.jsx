import { Card, CardContent, Typography, Avatar } from "@mui/material";

export default function DashboardCard({ title, value, subtitle, icon, iconColor, iconBg, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.01)",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: onClick ? "0 8px 20px rgba(0,0,0,0.10)" : "0 8px 16px rgba(0,0,0,0.06)",
          borderColor: "rgba(0,0,0,0.08)"
        }
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {icon && (
          <Avatar sx={{ bgcolor: iconBg, color: iconColor, mb: 1.5, width: 36, height: 36 }}>
            {icon}
          </Avatar>
        )}
        
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.secondary", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.5px", mb: 0.5 }}>
          {title}
        </Typography>

        <Typography variant="h5" sx={{ fontWeight: 900, color: "text.primary", mb: 0.5, fontFamily: "'Outfit', 'Inter', sans-serif" }}>
          {value}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1.3 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
