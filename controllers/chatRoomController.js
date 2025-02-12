const User = require("../models/userModel");
const Message = require("../models/messageModel");
const ChatRoom = require("../models/chatRoomModel");
const listRooms = async (req, res) => {
  try {
    const rooms = await ChatRoom.find();
    // await rooms.populate({ path: "users", select: "_id username lastSeen" });
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

const joinRoom = async (userId, roomName) => {
  try {
    const room = await ChatRoom.findOne({ name: roomName });
    if (!room) {
      throw new Error("Room not found");
    }

    await User.updateOne({ _id: userId }, { online: true });

    // await room.populate({ path: "users", select: "_id username lastSeen" });
    const user = await User.findById({ _id: userId });
    if (!user) {
      throw new Error("User not found");
    }
    const currentUsers = room.users?.map((cUser) => cUser._id.toString());

    if (currentUsers?.includes(user._id.toString())) {
      return { roomId: room._id, username: user.username };
    } else {
      await ChatRoom.updateOne({ _id: room._id }, { $push: { users: user } });
      return { roomId: room._id, username: user.username, userId: user._id };
    }
    // await ChatRoom.updateOne({ _id: room._id }, { $push: { users: user } });
    // res.status(201).json({
    //   message: "Joined room successfully",
    //   roomId: room._id,
    //   username: user.username,
    // });
  } catch (error) {
    console.log(error);
    // res.status(500).json({ mesage: "Error joining room" });
    return new Error(error.message);
  }
};

const getChatUsers = async (id) => {
  try {
    const room = await ChatRoom.findOne({ _id: id });
    if (!room) {
      // return res.status(400).json({ message: "Room not found" });
      throw new Error("Room not found.");
    }
    await room.populate({
      path: "users",
      select: "_id username lastSeen online",
    });
    // res.status(200).json(room.users);
    return room.users;
  } catch (error) {
    console.log(error);
    // res.status(500).json({ message: "Error getting users" });
    return new Error(error.message);
  }
};

const getRoom = async (name) => {
  try {
    const room = await ChatRoom.findOne({ name });
    if (!room) {
      throw new Error("Room not found");
    }
    return room._id;
  } catch (error) {
    console.log(error);
    return new Error(error.message);
  }
};

// when user leaves a room, remove user from room users list and from the user's room list
//

const leaveRoom = async (userId, roomName) => {
  try {
    const room = await ChatRoom.findOne({ name: roomName });
    if (!room) {
      throw new Error("Room not found");
    }
    const user = await User.findById({ _id: userId });
    if (!user) {
      throw new Error("User not found");
    }

    const currentUsers = room.users?.map((cUser) => cUser._id.toString());

    if (currentUsers?.includes(user._id.toString())) {
      await ChatRoom.updateOne(
        { _id: room._id },
        { $pull: { users: user._id } }
      );
      return { roomId: room._id, username: user.username };
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
};

const getChatmessages = async (roomId) => {
  try {
    const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
    return messages;
  } catch (error) {
    console.log(error);
    return new Error(error.message);
  }
};

module.exports = {
  listRooms,
  createChatRoom,
  joinRoom,
  getChatUsers,
  getRoom,
  leaveRoom,
  getChatmessages,
};
