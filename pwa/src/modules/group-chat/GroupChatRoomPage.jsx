import { Box } from "@mui/material";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useGroupChatRoom } from "./useGroupChatRoom";
import GroupChatRoom from "./GroupChatRoom";
import { disconnectGroupChatSocket } from "./groupChat.socket";

export default function GroupChatRoomPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { messages, sendMessage, sendFileMessage } = useGroupChatRoom(id);

  return (
    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <GroupChatRoom
        messages={messages}
        onSend={sendMessage}
        onSendFile={sendFileMessage}
        meta={location.state?.group}
        onClose={() => {
          disconnectGroupChatSocket();
          navigate(-1);
        }}
      />
    </Box>
  );
}
