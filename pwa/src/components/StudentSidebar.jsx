import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  IconButton,
} from "@mui/material";
import {
  FactCheck,
  Book,
  ReceiptLong,
  Close,
  CalendarMonth,
  Search,
  DirectionsBus,
  Assessment,
  LocalLibrary,
} from "@mui/icons-material";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { getAssetUrl } from "../utils/asset";

const SECTION_LABEL_SX = {
  px: 2,
  pt: 2,
  pb: 0.5,
  fontSize: "10px",
  fontWeight: 800,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  color: "text.disabled",
};

export default function StudentSidebar({ open, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const academicItems = [
    { label: "My Classes",        icon: <CalendarMonth />, path: "/student/timetable" },
    { label: "Attendance",       icon: <FactCheck />,     path: "/student/attendance" },
    { label: "Homework",         icon: <Book />,          path: "/student/diary" },
    { label: "Exams & Reports",  icon: <Assessment />,    path: "/student/report-cards" },
    { label: "Fees & Billing",   icon: <ReceiptLong />,   path: "/student/fees" },
    { label: "Library Books",    icon: <LocalLibrary />,  path: "/student/library" },
  ];

  const schoolLifeItems = [
    { label: "Lost & Found", icon: <Search />,        path: "/student/lost-found" },
    { label: "My Bus",       icon: <DirectionsBus />, path: "/student/transport" },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Outfit', sans-serif" }}>
          Menu
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      {/* Profile Preview � tapping navigates to profile */}
      <Box
        onClick={() => handleNavigate("/student/profile")}
        sx={{
          px: 2,
          pb: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          cursor: "pointer",
          borderRadius: "12px",
          mx: 1,
          mb: 0.5,
          "&:hover": { bgcolor: "action.hover" },
          transition: "background 0.15s",
        }}
      >
        <Avatar
          src={getAssetUrl(user?.avatar_url)}
          sx={{ width: 44, height: 44, bgcolor: "primary.main", fontWeight: 700 }}
        >
          {user?.name?.[0]}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight={800}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            View Profile ?
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Academics Section */}
      <Typography sx={SECTION_LABEL_SX}>Academics</Typography>
      <List dense>
        {academicItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              sx={{ borderRadius: "10px", mx: 0.5, my: 0.2 }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: "primary.main" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* School Life Section */}
      <Typography sx={SECTION_LABEL_SX}>School Life</Typography>
      <List dense>
        {schoolLifeItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              sx={{ borderRadius: "10px", mx: 0.5, my: 0.2 }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: "primary.main" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}


