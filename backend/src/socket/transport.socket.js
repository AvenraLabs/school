// src/socket/transport.socket.js

export function initTransportSocket(io) {
  io.on("connection", (socket) => {
    socket.on("trip:join", ({ tripId }) => {
      if (tripId) {
        socket.join(`trip:${tripId}`);
        console.log(`Socket ${socket.id} joined tracking room: trip:${tripId}`);
      }
    });

    socket.on("trip:leave", ({ tripId }) => {
      if (tripId) {
        socket.leave(`trip:${tripId}`);
        console.log(`Socket ${socket.id} left tracking room: trip:${tripId}`);
      }
    });
  });
}
