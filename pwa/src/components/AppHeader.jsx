import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Badge,
} from "@mui/material";
import { Notifications } from "@mui/icons-material";
import { useAuth } from "../auth/AuthProvider";
import { getAssetUrl } from "../utils/asset";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../modules/notifications/useNotifications";
import SiblingSelector from "./SiblingSelector";

export default function AppHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { items } = useNotifications();
  const unreadCount = items?.filter?.((n) => !n.is_acknowledged)?.length || 0;

  const basePath =
    user?.role === "student"
      ? "/student"
      : user?.role === "teacher"
        ? "/teacher"
        : "/student";

  function handleProfileClick() {
    if (!user) return;
    if (user.role === "teacher") {
      window.dispatchEvent(new Event("toggle-teacher-sidebar"));
      return;
    }
    if (user.role === "student") {
      window.dispatchEvent(new Event("toggle-student-sidebar"));
      return;
    }
    navigate(`${basePath}/profile`);
  }

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={1}
      sx={{ pt: "env(safe-area-inset-top, 0px)" }}
    >
      <Toolbar sx={{ display: "flex", gap: 2 }}>
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>
          SchoolIQ
        </Typography>
        {user && (
          <>
            <SiblingSelector />
            <IconButton
              size="small"
              onClick={() => navigate(`${basePath}/notifications`)}
              sx={{ mr: 1, color: "text.primary" }}
              aria-label="Notifications"
            >
              <Badge color="error" badgeContent={unreadCount || 0} overlap="circular">
                <Notifications />
              </Badge>
            </IconButton>

            <IconButton
              size="small"
              onClick={handleProfileClick}
              sx={{
                p: 0,
                mr: 1,
              }}
              aria-label="Open profile"
            >
              <Avatar
                src={getAssetUrl(user?.avatar_url) || ""}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontSize: 14,
                }}
              >
                {user.name?.[0]?.toUpperCase() ||
                  user.role?.[0]?.toUpperCase() ||
                  "U"}
              </Avatar>
            </IconButton>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
