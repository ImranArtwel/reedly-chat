const path = require("path");
const express = require("express");
const http = require("http");
const socket = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const PORT = 3000 || process.env.PORT;
const io = socket(server);

const botName = "ReedlyChat Bot";

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

app.use(express.static(path.join(__dirname, "public")));

server.listen(PORT, () => {
  console.log("Server is running on port 3000");
});
