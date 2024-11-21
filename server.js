const path = require("path");
const express = require("express");
const http = require("http");

const dotenv = require("dotenv").config();
const cors = require("cors");

const dbConnect = require("./config/dbConnect");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoomRoutes");
const socketConnect = require("./config/socket");

dbConnect();
// socketConnect(server);

app.use(express.json());
app.use(cors());

const botName = "ReedlyChat Bot";

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} `);
});
