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
userRouter.get("/user/search", userAuth, async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query is required" });

    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } }, // 'i' for case-insensitive
        { lastName: { $regex: query, $options: "i" } }
      ],
      // Don't show the logged-in user in search results
      _id: { $ne: req.user._id }
    }).select(USER_SAFE_DATA);

    // Also filter out users that already have connection requests
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { fromUserId: req.user._id },
        { toUserId: req.user._id }
      ]
    }).select("fromUserId toUserId");

    const hideUserIds = new Set();
    connectionRequests.forEach(req => {
      hideUserIds.add(req.fromUserId.toString());
      hideUserIds.add(req.toUserId.toString());
    });

    const filteredUsers = users.filter(user => 
      !hideUserIds.has(user._id.toString())
    );

    res.json({ data: filteredUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    //TODO user should not see card of "sent request or interest " and ignored/accepted user for which entry has been made in "connectionRequest collection" and already connected user and his card himself
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 30;
    limit = limit > 50 ? 50 : limit;

    const skip = (page - 1) * limit;

    //find all connection request sent + received
    const connectionRequest = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    //users to hide
    const hideUsersFromFeed = new Set(); //contains only unique element if same item is pushed it will ignore
    connectionRequest.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    // console.log(hideUsersFromFeed);

    //users to show which are not present in hide
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } }, //not in
        { _id: { $ne: loggedInUser._id } }, //not equal to
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    //TODO pagination to vieww only 10 user at a time not all user

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
});
module.exports = userRouter;
