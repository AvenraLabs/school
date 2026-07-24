import { io } from 'socket.io-client';
import { SOCKET_BASE_URL } from '../api/config';

let sharedSocket = null;

export function getSharedSocket(token) {
  if (sharedSocket) {
    if (token && sharedSocket.auth?.token !== token) {
      sharedSocket.auth = { token };
      if (!sharedSocket.connected) {
        sharedSocket.connect();
      }
    }
    return sharedSocket;
  }

  if (!token) return null;

  sharedSocket = io(SOCKET_BASE_URL, {
    path: '/api/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    autoConnect: true,
  });

  sharedSocket.on('connect', () => {
    console.log('[Socket] Connected successfully with ID:', sharedSocket.id);
  });

  sharedSocket.on('disconnect', (reason) => {
    console.warn('[Socket] Disconnected:', reason);
    if (reason === 'io server disconnect') {
      sharedSocket.connect();
    }
  });

  sharedSocket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  return sharedSocket;
}

export function disconnectSharedSocket() {
  if (sharedSocket) {
    console.log('[Socket] Teardown on user logout');
    sharedSocket.disconnect();
    sharedSocket = null;
  }
}
