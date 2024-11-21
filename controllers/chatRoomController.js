const User = require("../models/userModel");
const ChatRoom = require("../models/chatRoomModel");
const listRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error getting rooms" });
  }
};

const createChatRoom = async (req, res) => {
  try {
    const { name, userId } = req.body;
    if (!name || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const room = await ChatRoom.findOne({ name });
    if (room) {
      return res.status(400).json({ message: "Room already exists" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const newRoom = await ChatRoom.create({ name, roomAdmin: userId });
    await ChatRoom.updateOne({ _id: newRoom._id }, { $push: { users: user } });
    res.status(201).json(newRoom);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating room" });
  }
};

const joinRoom = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return res.status(400).json({ message: "Room not found" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (room.users.find((user) => user.id === userId)) {
      return res.status(400).json({ message: "User already in room" });
    }
    await ChatRoom.updateOne({ _id: roomId }, { $push: { users: user } });
    res.status(201).json({ message: "Joined room successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ mesage: "Error joining room" });
  }
};

const getChatUsers = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await ChatRoom.findOne({ _id: id }).populate({
      path: "users",
      select: "_id username lastSeen",
    });
    if (!room) {
      return res.status(400).json({ message: "Room not found" });
    }
    res.status(200).json(room);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error getting users" });
  }
};

module.exports = { listRooms, createChatRoom, joinRoom, getChatUsers };
