import { getSharedSocket } from "../../../services/socket.service";

export function connectQuizSocket(token) {
  return getSharedSocket(token);
}

export function disconnectQuizSocket() {
  // Shared socket remains connected across pages; listeners are cleaned up by React components.
}

export function getQuizSocket() {
  return getSharedSocket();
}
