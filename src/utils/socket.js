const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  //accepting socket connection
  io.on("connection", (socket) => {
    //handling socket events
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      // we need to create a room for each two people
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " Room joined: " + roomId);
      socket.join(roomId);
    });
    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        // save message to database
        try {
          //now we need to send the message to the target user
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(firstName + " sent message: " + text);
          // find the chat where participants are userId and targetUserId

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });
          if (!chat) {
            // create a new chat
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }
          // add the message to the chat
          chat.messages.push({
            senderId: userId,
            text,
          });
          // save the chat
          await chat.save();
          // Get the last message added, which contains the Mongoose timestamp
          const savedMessage = chat.messages[chat.messages.length - 1];
          // send message to the target user
          io.to(roomId).emit("messageReceived", {
            firstName,
            lastName,
            text,
            senderId: userId,
            timestamp: savedMessage.createdAt,
          });
        } catch (err) {
          console.log(err);
        }
        // send message to the target user
      }
    );
    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
