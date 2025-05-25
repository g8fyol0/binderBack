const express = require("express");
const { Chat } = require("../models/chat");
const { userAuth } = require("../middlewares/auth");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;
  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName createdAt",
    });

    //no chat found case - create new chat
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [], // Explicitly set empty messages array
      });
      await chat.save();

      // Populate the senderId fields for consistency (even though messages is empty)
      await chat.populate({
        path: "messages.senderId",
        select: "firstName lastName createdAt",
      });
    }

    return res.json(chat);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to fetch or create chat" });
  }
});

module.exports = chatRouter;
