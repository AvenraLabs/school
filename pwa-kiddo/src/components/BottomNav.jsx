import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import {
  Home,
  CalendarMonth,
  Chat,
  School,
  Person,
  Timer,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useEffect, useState } from "react";

export default function BottomNav() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = useState(location.pathname);
  useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);

  if (!user) return null;

  const base =
    user.role === "student"
      ? "/student"
      : user.role === "teacher"
        ? "/teacher"
        : user.role === "driver"
          ? "/driver"
          : "/student"; // fallback

  const navItems = {
    student: [
      { label: "Home", icon: <Home />, path: `${base}/dashboard` },
      { label: "Timetable", icon: <CalendarMonth />, path: `${base}/timetable` },
      { label: "Chat", icon: <Chat />, path: `${base}/group-chat` },
      { label: "Profile", icon: <Person />, path: "SIDEBAR_STUDENT" },
    ],
    teacher: [
      { label: "Home", icon: <Home />, path: `${base}/dashboard` },
      { label: "Classes", icon: <School />, path: `${base}/timetable` },
      { label: "Sessions", icon: <Timer />, path: `${base}/class-sessions` },
      { label: "Chat", icon: <Chat />, path: `${base}/group-chat` },
      { label: "Profile", icon: <Person />, path: "SIDEBAR_TRIGGER" },
    ],
    driver: [
      { label: "Home", icon: <Home />, path: `${base}/dashboard` },
      { label: "Profile", icon: <Person />, path: `${base}/profile` },
    ],
  };

  return (
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        overflow: "hidden",
        zIndex: 1200,
      }}
    >
      <BottomNavigation
        value={value}
        onChange={(_, newValue) => {
          if (newValue === "SIDEBAR_TRIGGER") {
            window.dispatchEvent(new Event("toggle-teacher-sidebar"));
            return;
          }
          if (newValue === "SIDEBAR_STUDENT") {
            window.dispatchEvent(new Event("toggle-student-sidebar"));
            return;
          }
          setValue(newValue);
          navigate(newValue);
        }}
        showLabels
      >
        {navItems[user.role].map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            value={item.path}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
