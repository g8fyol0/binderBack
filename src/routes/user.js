const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const userRouter = express.Router();

const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "photoUrl",
  "age",
  "gender",
  "about",
  "skills",
];
//get all pending connection requst for all logged in user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);

    res.json({
      message: "data fetched successfully!",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

//TODO get all details about accepted requests which i sent or to whom connection is seccessful -- who is connected to me

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    //g8fyol -> elon
    // elon -> mark //both accepted so elon can be both form or to
    const connectionRequest = await ConnectionRequest.find({
      $or: [
        {
          toUserId: loggedInUser._id,
          status: "accepted",
        },
        {
          fromUserId: loggedInUser._id,
          status: "accepted",
        },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequest.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.json({ data });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});

//FIXME now user feed api
// Search users by firstName (case-insensitive, partial match)
// Update the search endpoint to search by both first and last name
userRouter.get("/user/search", userAuth, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query is required" });

    // Find all connection requests for the logged-in user
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id },
        { toUserId: loggedInUser._id }
      ]
    }).select("fromUserId toUserId");

    // Create a set of user IDs to exclude
    const hideUsersFromResults = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromResults.add(req.fromUserId.toString());
      hideUsersFromResults.add(req.toUserId.toString());
    });
    // Always exclude the logged-in user
    hideUsersFromResults.add(loggedInUser._id.toString());

    // Search for users by first or last name, excluding users with existing connections
    const users = await User.find({
      $and: [
        { 
          $or: [
            { firstName: { $regex: query, $options: "i" } },
            { lastName: { $regex: query, $options: "i" } }
          ] 
        },
        { _id: { $nin: Array.from(hideUsersFromResults) } }
      ]
    }).select(USER_SAFE_DATA).limit(10);

    res.json({ data: users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update the feed endpoint to ensure it always returns enough users
userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10; // Default to 10 instead of 30
    limit = limit > 50 ? 50 : limit;

    const skip = (page - 1) * limit;

    // Find all connection requests sent + received
    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    // Users to hide
    const hideUsersFromFeed = new Set();
    connectionRequest.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    // Always exclude the logged-in user
    hideUsersFromFeed.add(loggedInUser._id.toString());

    // Users to show which are not present in hide
    const users = await User.find({
      _id: { $nin: Array.from(hideUsersFromFeed) }
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});
module.exports = userRouter;
