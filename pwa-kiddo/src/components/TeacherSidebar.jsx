import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Divider, IconButton, Button } from "@mui/material";
import {
    School,
    Book,
    Assignment,
    Assessment,
    AutoAwesome,
    Close,
    Person,
    Palette,
    Logout,
    DirectionsBus,
    Chat,
    Search,
    Feedback,
    Info,
} from "@mui/icons-material";
import { useAuth } from "../auth/AuthProvider";
import { Link, useNavigate } from "react-router-dom";

export default function TeacherSidebar({ open, onClose }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
        onClose();
    };

    const menuItems = [
        { label: "Classes", icon: <School />, path: "/teacher/timetable" },
        { label: "Chat", icon: <Chat />, path: "/teacher/group-chat" },
        { label: "Approvals", icon: <Assignment />, path: "/teacher/approvals" },
        { label: "Exams & Reports", icon: <Assessment />, path: "/teacher/exams/create" },
        { label: "AI Tools", icon: <AutoAwesome />, path: "/teacher/ai-tools" },
        { label: "Lost & Found", icon: <Search />, path: "/teacher/lost-found" },
        { label: "Feedback", icon: <Feedback />, path: "/teacher/feedback" },
        { label: "Themes", icon: <Palette />, path: "/teacher/themes" },
        { label: "Profile", icon: <Person />, path: "/teacher/profile" },
        { label: "About", icon: <Info />, path: "/teacher/about" },
    ];

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: 280, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }
            }}
        >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">Menu</Typography>
                <IconButton onClick={onClose}><Close /></IconButton>
            </Box>

            <Link to="/teacher/profile" onClick={onClose} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <Box sx={{ px: 2, mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar src={user?.avatar_url || ""} sx={{ width: 48, height: 48, bgcolor: 'primary.main' }}>
                        {user?.name?.[0]}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">Teacher</Typography>
                    </Box>
                </Box>
            </Link>

            <Divider />

            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton onClick={() => handleNavigate(item.path)}>
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ p: 2, mt: 'auto' }}>
                <Button
                    onClick={handleLogout}
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<Logout />}
                    sx={{ borderRadius: 2 }}
                >
                    Log Out
                </Button>
            </Box>
        </Drawer>
    );
}

