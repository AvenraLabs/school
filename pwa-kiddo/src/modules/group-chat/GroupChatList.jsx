import { useNavigate } from "react-router-dom";
import {
  List,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Paper,
  Typography,
  IconButton,
  Stack,
} from "@mui/material";
import { School, ArrowForwardIos, Delete } from "@mui/icons-material";
import { useAuth } from "../../auth/AuthProvider";

export default function GroupChatList({ groups, onDelete }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  if (!groups || groups.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
        <Typography color="text.secondary">No groups found.</Typography>
      </Paper>
    );
  }

  return (
    <List spacing={2}>
      {groups.map((group) => (
        <Paper
          key={group.chatId || group.id}
          sx={{
            mb: 2,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          <ListItemButton
            onClick={() =>
              navigate(`${group.chatId || group.id}`, {
                state: { group },
              })
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <School />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography fontWeight="bold">
                  {(() => {
                    if (isStudent) {
                      return group.subject?.name || 'Subject';
                    }
                    const className = group.class?.class_name || '';
                    const sectionName = group.section?.name || '';
                    const classSection = [className, sectionName].filter(Boolean).join('-');
                    return [group.subject?.name || 'Subject', classSection].filter(Boolean).join(' ');
                  })()}
                </Typography>
              }
              secondary={null}
            />
            <Stack direction="row" spacing={1} alignItems="center">
              {onDelete && (
                <IconButton
                  edge="end"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(group.chatId || group.id);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
              <ArrowForwardIos fontSize="small" sx={{ color: 'text.disabled' }} />
            </Stack>
          </ListItemButton>
        </Paper>
      ))}
    </List>
  );
}
