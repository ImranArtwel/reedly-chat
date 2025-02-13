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

const getCurrentUser = async (username) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    return new Error(error.message);
  }
};

const getUserById = async (id) => {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    return new Error(error.message);
  }
};

const updateUserLastSeen = async (userId, lastSeen) => {
  try {
    const user = await User.findById({ _id: userId });
    if (!user) {
      throw new Error("User not found");
    }
    await User.updateOne(
      { _id: user._id },
      { lastSeen, online: false },
      { new: true }
    );
    return { userId: user._id, username: user.username };
  } catch (error) {
    return new Error(error.message);
  }
};

module.exports = {
  getUser,
  getUsers,
  getCurrentUser,
  getUserById,
  updateUserLastSeen,
};
