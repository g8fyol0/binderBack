const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const requestsRouter = express.Router();

const sendEmail = require("../utils/sendEmail");

requestsRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id; //this is from user who is sending the request
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid Status Type : " + status,
        });
      }

      //check if there is no duplicate connection request or pending connction both condtion will be checked
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      //if toUserId exists or not
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (existingConnectionRequest) {
        return res.status(400).send({
          message: "connection request already exists!!",
        });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      const emailRes = await sendEmail.run(
        "YOU got a new connection request from " + req.user.firstName,
        req.user.firstName + " is " + status + " in " + toUser.firstName
      );
      console.log(emailRes);

      res.json({
        message:
          req.user.firstName + " is " + status + " in " + toUser.firstName,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

requestsRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;

      //TODO what
      //gyfyol sending to elon
      //condition 1 : this api should only be called logged in user should be receiver ie. elon (toUserId) also this can only happen if "only interested state̦"
      // validate the :status
      // request id should be valid
      // 1. is elon logged in (should be toUserId)
      // 2. status == interested only and also :status should be validated
      const { status, requestId } = req.params;
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "status is not allowed",
        });
      }

      //cheking if reqId is present in db finding request in db which have req id and interested
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res.status(404).json({
          message: "connection request is not found",
        });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save(); //this will give modified connection request

      res.json({
        message: "connection request " + status,
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR : " + err.message);
    }
  }
);

module.exports = requestsRouter;
