import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "../../api/config";

let socket;

export function connectTransportSocket(token) {
  if (socket) return socket;

  socket = io(SOCKET_BASE_URL, {
    path: "/api/socket.io",
    auth: { token },
  });

  return socket;
}

export function disconnectTransportSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getTransportSocket() {
  return socket;
}
