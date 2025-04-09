import Message from "../models/Message.js";

const roomUsers = new Map();

const configureSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("joinRoom", async ({ roomId, username }) => {
      // Check if username is already taken in this room
      const existingUsers = roomUsers.get(roomId);
      if (
        existingUsers &&
        Array.from(existingUsers.values()).includes(username)
      ) {
        socket.emit("error", "Username already taken in this room, please choose another one.");
        return;
      }

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.username = username;

      if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
      roomUsers.get(roomId).set(socket.id, username);

      const messages = await Message.find({ roomId })
        .sort({ createdAt: 1 })
        .limit(50);
      socket.emit("previousMessages", messages);

      emitUsers(roomId);
    });

    socket.on("sendMessage", async ({ roomId, message }) => {
      const msg = new Message({
        roomId,
        senderId: socket.id,
        username: socket.data.username,
        message,
      });
      await msg.save();

      io.to(roomId).emit("receiveMessage", {
        senderId: socket.id,
        username: socket.data.username,
        message,
        timestamp: msg.createdAt,
      });
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      roomUsers.get(roomId)?.delete(socket.id);
      emitUsers(roomId);
    });

    socket.on("disconnect", () => {
      const roomId = socket.data.roomId;
      if (roomId) {
        socket.leave(roomId);
        roomUsers.get(roomId)?.delete(socket.id);
        emitUsers(roomId);
      }
    });
  });
  const emitUsers = (roomId) => {
    const users = Array.from(roomUsers.get(roomId)?.values() || []);
    io.to(roomId).emit("users", users); // send array of usernames
  };
};

export default configureSocket;
