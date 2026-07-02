// src/socket/transport.socket.js

export function initTransportSocket(io) {
  io.on("connection", (socket) => {
    // Parent registers to listen for active student notifications
    socket.on("student:join", ({ studentId }) => {
      if (studentId) {
        socket.join(`student:${studentId}`);
        console.log(`Socket ${socket.id} joined student room: student:${studentId}`);
      }
    });

    socket.on("student:leave", ({ studentId }) => {
      if (studentId) {
        socket.leave(`student:${studentId}`);
        console.log(`Socket ${socket.id} left student room: student:${studentId}`);
      }
    });

    // Tracking coordinate broadcasts
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
