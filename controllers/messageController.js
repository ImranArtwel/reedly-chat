const Message = require("../models/messageModel");
const createMessage = async (senderId, roomId, text) => {
  try {
    const message = new Message({
      text,
      roomId,
      senderId,
    });
    const savedMessage = await message.save();
    return savedMessage;
  } catch (error) {
    console.log(error);
    return new Error(error.message);
  }
};

module.exports = { createMessage };
