import React, { useState } from "react";
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import { SwapHoriz, Add } from "@mui/icons-material";
import { useAuth } from "../auth/AuthProvider";
import { useNavigate } from "react-router-dom";

/**
 * SiblingSelector — client-side switcher for multiple logged in student/user accounts.
 */
export default function SiblingSelector() {
  const { user, accounts, switchAccount, addAccount } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleSwitch = (userId) => {
    setAnchorEl(null);
    setSwitching(true);
    try {
      switchAccount(userId);
      const targetUser = accounts.find((a) => String(a.user.id) === String(userId))?.user;
      const basePath = targetUser?.role === "teacher" ? "/teacher" : "/student";
      navigate(`${basePath}/dashboard`, { replace: true });
      window.location.reload(); // Hard refresh to re-hydrate profile
    } catch (e) {
      console.error("Switch failed:", e);
    } finally {
      setSwitching(false);
    }
  };

  const handleAddAccount = () => {
    setAnchorEl(null);
    addAccount();
    navigate("/login", { replace: true });
  };

  // Only show switcher option if user is logged in
  if (!user) return null;

  // Filter out the current user
  const otherAccounts = accounts.filter((acc) => String(acc.user.id) !== String(user.id));

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ color: "text.primary" }}
        aria-label="Switch account"
        disabled={switching}
      >
        {switching ? <CircularProgress size={20} /> : <SwapHoriz />}
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 220 } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="textSecondary" fontWeight="bold">
            ACCOUNTS
          </Typography>
        </Box>
        <Divider />
        
        {/* List other active accounts */}
        {otherAccounts.map((acc) => (
          <MenuItem
            key={acc.user.id}
            onClick={() => handleSwitch(acc.user.id)}
            sx={{ gap: 1 }}
          >
            <ListItemAvatar sx={{ minWidth: 36 }}>
              <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main", fontSize: 12 }}>
                {acc.user.name?.[0]?.toUpperCase() || "U"}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={acc.user.name || acc.user.username || "User"}
              secondary={acc.user.role === "student" ? "Student" : "Teacher"}
              primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
              secondaryTypographyProps={{ variant: "caption" }}
            />
          </MenuItem>
        ))}

        {otherAccounts.length > 0 && <Divider />}

        {/* Add Account Option */}
        <MenuItem onClick={handleAddAccount} sx={{ gap: 1, py: 1 }}>
          <ListItemAvatar sx={{ minWidth: 36, display: "flex", justifyContent: "center" }}>
            <Add fontSize="small" color="primary" />
          </ListItemAvatar>
          <ListItemText
            primary="Add Account"
            primaryTypographyProps={{ variant: "body2", color: "primary", fontWeight: 600 }}
          />
        </MenuItem>
      </Menu>
    </>
  );
}
