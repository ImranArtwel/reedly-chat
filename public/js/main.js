const socket = io();
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const leaveRoomBtn = document.getElementById("leave-room");

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
console.log("before joining room", username, room);
socket.emit("joinRoom", { username, room });
socket.on("message", (msg) => {
  outputMessage(msg, username);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputRoomUsers(users);
});

// listen for form submission
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = chatForm.querySelector("#msg").value;
  socket.emit("chatMessage", { username, room, msg });
  chatForm.querySelector("#msg").value = "";
  chatForm.querySelector("#msg").focus();
});

leaveRoomBtn.addEventListener("click", () => {
  socket.emit("leaveRoom", username, room);
  window.location.href = "index.html";
});

function outputMessage(msg, currentUser) {
  const message = document.createElement("div");

  if (senderIsCurrentUser(msg, currentUser)) {
    message.classList.add("current-user-message");
  } else {
    message.classList.add("message");
  }
  if (msg.username === "ReedlyChat Bot") {
    message.style.backgroundColor = "#5dc9714a";
  }

  const meta = document.createElement("p");
  meta.classList.add("meta");
  const formattedUsername = senderIsCurrentUser(msg, currentUser)
    ? "Me"
    : msg.username.charAt(0).toUpperCase() + msg.username.slice(1);
  meta.innerHTML = `${formattedUsername} <span>${msg.time}</span>`;

  const text = document.createElement("p");
  text.classList.add("text");
  text.innerHTML = msg.text;
  message.appendChild(meta);
  message.appendChild(text);
  document.querySelector(".chat-messages").appendChild(message);
}

function outputRoomName(room) {
  const roomName = document.querySelector("#room-name");
  roomName.innerHTML = room;
}

function outputRoomUsers(users) {
  const usersList = document.querySelector("#users");
  usersList.innerHTML = "";
  users.forEach((user) => {
    const userLi = document.createElement("li");
    // capitalize first letter of username
    const curUser =
      user.username.charAt(0).toUpperCase() + user.username.slice(1);
    userLi.innerHTML = curUser;
    usersList.appendChild(userLi);
  });
}

function senderIsCurrentUser(msg, currentUser) {
  return msg.username === currentUser;
}
