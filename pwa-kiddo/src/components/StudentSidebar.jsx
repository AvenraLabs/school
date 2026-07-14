import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Divider, IconButton } from "@mui/material";
import {
  FactCheck,
  Book,
  ReceiptLong,
  Person,
  Close,
  Palette,
  Logout,
  CalendarMonth,
  Chat,
  Search,
  Feedback,
  Info,
} from "@mui/icons-material";
import { useAuth } from "../auth/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { getAssetUrl } from "../utils/asset";

export default function StudentSidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { label: "Attendance", icon: <FactCheck />, path: "/student/attendance" },
    { label: "Classes", icon: <CalendarMonth />, path: "/student/timetable" },
    { label: "Chat", icon: <Chat />, path: "/student/group-chat" },
    { label: "Homework", icon: <Book />, path: "/student/diary" },
    { label: "Exams", icon: <ReceiptLong />, path: "/student/report-cards" },
    { label: "Lost & Found", icon: <Search />, path: "/student/lost-found" },
    { label: "Feedback", icon: <Feedback />, path: "/student/feedback" },
    { label: "Themes", icon: <Palette />, path: "/student/themes" },
    { label: "Profile", icon: <Person />, path: "/student/profile" },
    { label: "About", icon: <Info />, path: "/student/about" },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    const nextUser = await logout();
    if (nextUser) {
      let basePath = "/student";
      if (nextUser.role === "teacher") {
        basePath = "/teacher";
      } else if (nextUser.role === "driver") {
        basePath = "/driver";
      }
      window.location.href = `${basePath}/dashboard`;
    } else {
      window.location.href = "/login";
    }
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 280, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 } }}
    >
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight="bold">Menu</Typography>
        <IconButton onClick={onClose}><Close /></IconButton>
      </Box>

      <Link to="/student/profile" onClick={onClose} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <Box sx={{ px: 2, mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar src={getAssetUrl(user?.avatar_url)} sx={{ width: 48, height: 48, bgcolor: "primary.main" }}>
            {user?.name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">Student</Typography>
          </Box>
        </Box>
      </Link>

      <Divider />

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => handleNavigate(item.path)}>
              <ListItemIcon sx={{ minWidth: 40, color: "primary.main" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mt: 1 }} />

      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: 40, color: "error.main" }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}
