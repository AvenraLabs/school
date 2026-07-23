import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import {
  Home,
  Quiz,
  SmartToy,
  Chat,
  Person,
  HowToReg,
  Book,
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
          : "/student";

  const navItems = {
    student: [
      { label: "Home",    icon: <Home />,      path: `${base}/dashboard` },
      { label: "Quiz",    icon: <Quiz />,      path: `${base}/quiz` },
      { label: "AI Chat", icon: <SmartToy />,  path: `${base}/ai-chat` },
      { label: "Chat",    icon: <Chat />,      path: `${base}/group-chat` },
      { label: "Me",      icon: <Person />,    path: `${base}/profile` },
    ],
    teacher: [
      { label: "Home",       icon: <Home />,     path: `${base}/dashboard` },
      { label: "Attendance", icon: <HowToReg />, path: `${base}/attendance` },
      { label: "Homework",   icon: <Book />,     path: `${base}/diary` },
      { label: "Me",         icon: <Person />,   path: `${base}/profile` },
    ],
    driver: [
      { label: "Home",    icon: <Home />,    path: `${base}/dashboard` },
      { label: "Profile", icon: <Person />,  path: `${base}/profile` },
    ],
  };

  const items = navItems[user.role] || navItems.driver;

  // Highlight deepest matching tab (e.g. /student/quiz/123/play -> quiz tab)
  const activeValue =
    items.find((item) => location.pathname.startsWith(item.path))?.path ||
    location.pathname;

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
        pb: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <BottomNavigation
        value={activeValue}
        onChange={(_, newValue) => {
          setValue(newValue);
          navigate(newValue);
        }}
        showLabels
        sx={{
          "& .MuiBottomNavigationAction-root": {
            minWidth: "auto",
            padding: { xs: "6px 0", sm: "6px 12px" },
          },
          "& .MuiBottomNavigationAction-label": {
            fontSize: { xs: "9px", sm: "12px" },
            "&.Mui-selected": {
              fontSize: { xs: "10px", sm: "14px" },
            },
          },
        }}
      >
        {items.map((item) => (
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
