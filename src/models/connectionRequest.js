const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.ObjectId,
      ref: "User", //creating link between two table refrence to the user collection
      require: true,
    },
    toUserId: {
      type: mongoose.Schema.ObjectId,
      ref: "User", //creating link between two table refrence to the user collection
      require: true,
    },
    status: {
      type: String,
      require: true,
      enum: {
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      }, //want to restrict user to some values
    },
  },
  {
    timestamps: true,
  }
);

//compound index for faster query connctionrequst.find({fromuserId}) will be fast now 1 -> ascending
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });
//pre is like middleware which checks some validateion

//this method will be called anytime we are saving the data pre save
connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  // if from and to user id are same or not
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("can't send connection request to yourself");
  }
  next();
});

const ConnectionRequestModel = new mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = ConnectionRequestModel;
