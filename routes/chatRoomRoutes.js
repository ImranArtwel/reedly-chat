const express = require("express");
const router = express.Router();
const {
  listRooms,
  createChatRoom,
  joinRoom,
  getChatUsers,
} = require("../controllers/chatRoomController");

router.get("/", listRooms);
router.get("/:id/users", getChatUsers);
router.post("/", createChatRoom);
router.post("/join", joinRoom);

module.exports = router;
