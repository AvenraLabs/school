import { getSharedSocket } from "../../services/socket.service";

export function connectTransportSocket(token) {
  return getSharedSocket(token);
}

export function disconnectTransportSocket() {
  // Shared socket remains connected across pages; listeners are cleaned up by React components.
}

export function getTransportSocket() {
  return getSharedSocket();
}
