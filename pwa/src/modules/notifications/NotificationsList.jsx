import { Box } from "@mui/material";
import NotificationItem from "./NotificationItem";

export default function NotificationsList({
  items,
  onAcknowledge,
}) {
  return (
    <Box 
      sx={{ 
        bgcolor: "white", 
        borderRadius: "16px", 
        overflow: "hidden", 
        border: "1px solid", 
        borderColor: "grey.100",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
      }}
    >
      {items.map((item) => (
        <NotificationItem
          key={item.id}
          item={item}
          onAcknowledge={onAcknowledge}
        />
      ))}
    </Box>
  );
}
