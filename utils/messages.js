const { DateTime } = require("luxon");
const { botName } = require("../config/constants");

function formatMessage(username, message) {
  const formattedUsername =
    username.charAt(0).toUpperCase() + username.slice(1);
  return {
    id: username === botName ? generateRandomMessageid() : message._id,
    username: formattedUsername,
    text: username === botName ? message : message.text,
    time:
      username === botName
        ? DateTime.now().toFormat("h:mm a")
        : DateTime.fromJSDate(message.createdAt).toFormat("h:mm a"),
  };
}

const generateRandomMessageid = () => {
  return Math.random().toString(36).substring(2, 15);
};

module.exports = {
  formatMessage,
  generateRandomMessageid,
};
