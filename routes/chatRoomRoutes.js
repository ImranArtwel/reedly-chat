const express = require("express");
const router = express.Router();
const {
  listRooms,
  createChatRoom,
  // joinRoom,
  getChatUsers,
} = require("../controllers/chatRoomController");
const verifyToken = require("../middlewares/authMiddleware");

router.get("/", listRooms);
router.get("/:id/users", getChatUsers);
router.post("/", createChatRoom);
// router.post("/leave", leaveRoom);

module.exports = router;
