const { DateTime } = require("luxon");

function formatMessage(username, text) {
  return {
    username,
    text,
    time: DateTime.now().toFormat("h:mm a"),
  };
}

module.exports = formatMessage;
