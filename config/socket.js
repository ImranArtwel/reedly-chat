const socket = require("socket.io");

const socketConnect = (server) => {
  const io = socket(server);
  io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, room }) => {
      const user = userJoin(socket.id, username, room);
      socket.join(user.room);

      socket.emit("message", formatMessage(botName, "Welcome to Reedly Chat"));

      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          formatMessage(botName, `${user?.username} has joined the chat`)
        );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    });

    socket.on("chatMessage", ({ username, msg }) => {
      const user = getCurrentUser(socket.id);
      io.to(user?.room).emit("message", formatMessage(user?.username, msg));
    });

    socket.on("disconnect", () => {
      const user = userLeave(socket.id);
      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage(botName, `${user.username} has left the chat`)
        );
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });
};

module.exports = socketConnect;
