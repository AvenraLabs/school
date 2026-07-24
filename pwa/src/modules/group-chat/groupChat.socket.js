import { getSharedSocket } from "../../services/socket.service";

export function connectGroupChatSocket(token) {
  return getSharedSocket(token);
}

export function disconnectGroupChatSocket() {
  // Shared socket remains connected across pages; listeners are cleaned up by React components.
}

export function getGroupChatSocket() {
  return getSharedSocket();
}
