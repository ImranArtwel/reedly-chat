const User = require("../models/userModel");
const ChatRoom = require("../models/chatRoomModel");

const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error getting user" });
  }
};

const getUsers = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(400).json({ message: "Room not found" });
    }
    const users = room.users;
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error getting users" });
  }
};

module.exports = { getUser, getUsers };
