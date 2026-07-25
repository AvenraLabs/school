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
  School,
  Assignment,
  Assessment,
  AutoAwesome,
  Close,
  Chat,
  Search,
  LocalLibrary,
  Person,
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

export default function TeacherSidebar({ open, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const teachingItems = [
    { label: "My Classes",       icon: <School />,      path: "/teacher/timetable" },
    { label: "Approvals",     icon: <Assignment />,  path: "/teacher/approvals" },
    { label: "Exams & Reports", icon: <Assessment />, path: "/teacher/exams/create" },
  ];

  const schoolLifeItems = [
    { label: "Group Chat",   icon: <Chat />,   path: "/teacher/group-chat" },
    { label: "Lost & Found", icon: <Search />, path: "/teacher/lost-found" },
    { label: "Library Books", icon: <LocalLibrary />, path: "/teacher/library" },
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

      {/* Profile Preview */}
      <Box
        onClick={() => handleNavigate("/teacher/profile")}
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
          src={getAssetUrl(user?.avatar_url) || ""}
          sx={{ width: 44, height: 44, bgcolor: "primary.main", fontWeight: 700 }}
        >
          {user?.name?.[0]}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight={800}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            View Profile →
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Teaching Section */}
      <Typography sx={SECTION_LABEL_SX}>Teaching</Typography>
      <List dense>
        {teachingItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              onClick={() => handleNavigate(item.path)}
              sx={{ borderRadius: "10px", mx: 1, my: 0.4, py: 0.8 }}
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
              sx={{ borderRadius: "10px", mx: 1, my: 0.4, py: 0.8 }}
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

