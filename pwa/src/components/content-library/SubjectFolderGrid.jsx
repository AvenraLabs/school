import React from "react";
import { Box, Card, CardContent, Typography, useTheme, alpha } from "@mui/material";
import { OndemandVideo, Add } from "@mui/icons-material";
import { tokens } from "../../theme/tokens";

export default function SubjectFolderGrid({
  subjectFolders = [],
  teacherVideos = [],
  onSelectSubject,
  onCreateNew,
  isTeacher = false,
}) {
  const theme = useTheme();

  // Combine subject list from backend counts and any active videos
  const folderMap = new Map();
  subjectFolders.forEach((sf) => folderMap.set(sf.subject_name, sf.count));
  teacherVideos.forEach((v) => {
    const name = v.subject_name || "General";
    if (!folderMap.has(name)) folderMap.set(name, 1);
  });

  const subjectList = Array.from(folderMap.entries());

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1.5 }}>
      {/* Teacher shortcut tile to create new content */}
      {isTeacher && onCreateNew && (
        <Card
          onClick={onCreateNew}
          sx={{
            borderRadius: `${tokens.radius.lg}px`,
            border: `1.5px dashed ${theme.palette.primary.main}`,
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            cursor: "pointer",
            minHeight: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease-in-out",
            "&:active": {
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              transform: "scale(0.98)",
            },
          }}
        >
          <CardContent sx={{ p: 2, textAlign: "center", "&:last-child": { pb: 2 } }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: `${tokens.radius.md}px`,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1,
              }}
            >
              <Add sx={{ fontSize: 24 }} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: theme.palette.primary.main, fontSize: "0.85rem" }}>
              Create AI Lesson
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Subject Folders */}
      {subjectList.map(([subj, count]) => (
        <Card
          key={subj}
          onClick={() => onSelectSubject(subj)}
          sx={{
            borderRadius: `${tokens.radius.lg}px`,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.paper,
            cursor: "pointer",
            minHeight: "100px",
            transition: "all 0.15s ease-in-out",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            "&:active": {
              transform: "scale(0.98)",
              borderColor: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.04),
            },
          }}
        >
          <CardContent sx={{ p: 2, textAlign: "center", "&:last-child": { pb: 2 } }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: `${tokens.radius.md}px`,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1,
              }}
            >
              <OndemandVideo sx={{ fontSize: 22 }} />
            </Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: theme.palette.text.primary,
                fontSize: "0.85rem",
                lineHeight: 1.2,
              }}
              noWrap
            >
              {subj}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontWeight: 600,
                fontSize: "0.725rem",
                mt: 0.25,
                display: "block",
              }}
            >
              {count} {count === 1 ? "item" : "items"}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
