const socket = require("socket.io");
const {
  getChatUsers,
  joinRoom,
  getRoom,
  leaveRoom,
  getChatmessages,
} = require("../controllers/chatRoomController");
const { formatMessage } = require("../utils/messages");
const { botName } = require("./constants");
const {
  getUserById,
  updateUserLastSeen,
} = require("../controllers/userController");
const { createMessage } = require("../controllers/messageController");

const socketConnect = (server) => {
  const io = socket(server, {
    pingInterval: 5000, // Sends a ping every 5 seconds
    pingTimeout: 10000, // Disconnects if no response in 10 seconds
    cors: {
      origin: process.env.WEBAPP_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    socket.on("joinRoom", async ({ room }) => {
      if (!room || !userId || userId === "undefined") {
        return socket.emit("error", "Missing required fields");
      }

      const { roomId, username } = await joinRoom(userId, room);
      socket.join(roomId.toString());

      socket.emit("message", formatMessage(botName, `Welcome to ${room} Chat`));

      const fomatttedUsername =
        username.charAt(0).toUpperCase() + username.slice(1);

      const chatMessages = await getChatmessages(roomId);

      chatMessages.forEach(async (message) => {
        const sender = await getUserById(message.senderId);
        const formattedSender =
          sender.username.charAt(0).toUpperCase() + sender.username.slice(1);
        socket.emit("message", formatMessage(formattedSender, message));
      });

      socket.broadcast
        .to(roomId.toString())
        .emit(
          "message",
          formatMessage(botName, `${fomatttedUsername} has joined the chat`)
        );

      const chatUsers = await getChatUsers(roomId.toString());

      io.to(roomId.toString()).emit("roomUsers", {
        room: room,
        roomId: roomId,
        users: chatUsers,
      });
    });

    socket.on("chatMessage", async ({ room, msg }) => {
      const roomId = await getRoom(room);
      const message = await createMessage(userId, roomId, msg);
      io.to(roomId.toString()).emit(
        "message",
        formatMessage(user?.username, message)
      );
    });

    socket.on("leaveRoom", async ({ roomName: room }) => {
      const { roomId, username } = await leaveRoom(userId, room);
      const fomatttedUsername =
        username.charAt(0).toUpperCase() + username.slice(1);
      socket.broadcast
        .to(roomId?.toString())
        .emit(
          "message",
          formatMessage(botName, `${fomatttedUsername} has left the chat`)
        );
      const chatUsers = await getChatUsers(roomId.toString());
      io.to(roomId?.toString()).emit("roomUsers", {
        room: room,
        users: chatUsers,
      });
    });

    socket.on("browserDisconnect", async () => {
      console.log("attempting to disconnect");
    });

    socket.on("disconnect", async () => {
      const now = Date.now();
      await updateUserLastSeen(userId, now);

      socket.broadcast.emit("userStatusUpdate", {
        userId,
        online: false,
        lastSeen: now,
      });
    });
  });
};

module.exports = socketConnect;
