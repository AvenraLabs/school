import React, { useState, useEffect, useCallback } from "react";
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
  Chip,
  CircularProgress,
} from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";
import { useAuth } from "../auth/AuthProvider";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

/**
 * SiblingSelector — shows in AppHeader when a student has siblings in the same family.
 * Tapping swaps to that student's account via /auth/switch-student.
 */
export default function SiblingSelector() {
  const { user, switchStudent } = useAuth();
  const navigate = useNavigate();
  const [siblings, setSiblings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const fetchSiblings = useCallback(async () => {
    if (user?.role !== "student" || !user?.student_id) return;

    setLoading(true);
    try {
      const res = await api.get("/students/families/my-siblings");
      const items = res.data?.items || [];
      // Exclude self
      setSiblings(items.filter((s) => String(s.id) !== String(user?.student_id)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user?.role, user?.student_id]);

  useEffect(() => {
    fetchSiblings();
  }, [fetchSiblings]);

  const handleSwitch = async (targetId) => {
    setAnchorEl(null);
    setSwitching(true);
    try {
      await switchStudent(targetId);
      navigate("/student/dashboard", { replace: true });
      window.location.reload(); // Hard refresh to re-hydrate profile
    } catch (e) {
      console.error("Switch failed:", e);
    } finally {
      setSwitching(false);
    }
  };

  // Only show when there are siblings
  if (siblings.length === 0 || user?.role !== "student") return null;

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ color: "text.primary" }}
        aria-label="Switch student"
        disabled={switching}
      >
        {switching ? <CircularProgress size={20} /> : <SwapHoriz />}
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, minWidth: 200 } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="textSecondary" fontWeight="bold">
            SWITCH STUDENT
          </Typography>
        </Box>
        <Divider />
        {loading ? (
          <MenuItem disabled>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <ListItemText primary="Loading..." />
          </MenuItem>
        ) : (
          siblings.map((sibling) => (
            <MenuItem
              key={sibling.id}
              onClick={() => handleSwitch(sibling.id)}
              sx={{ gap: 1 }}
            >
              <ListItemAvatar sx={{ minWidth: 36 }}>
                <Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main", fontSize: 12 }}>
                  {sibling.user?.name?.[0]?.toUpperCase() || "S"}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={sibling.user?.name || "Student"}
                secondary={sibling.class?.class_name || ""}
                primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
                secondaryTypographyProps={{ variant: "caption" }}
              />
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
}
