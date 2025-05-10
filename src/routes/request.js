const express = require('express');
const {userAuth} = require("../middlewares/auth");
const ConnectionRequest = require('../models/connectionRequest');
const User = require("../models/user");
const requestsRouter = express.Router();

requestsRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res)=>{
    try{
        const fromUserId = req.user._id; //this is from user who is sending the request
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({
                message: "Invalid Status Type : " + status,
            })
        }

        //check if there is no duplicate connection request or pending connction both condtion will be checked
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or:[
                {fromUserId, toUserId},
                {fromUserId: toUserId, toUserId: fromUserId},

            ],
        });
        //if toUserId exists or not
        const toUser = await User.findById(toUserId);
        if(!toUser){
            return res.status(404).json({
                message: "User not found",
            })
        }

        if(existingConnectionRequest){
            return res.status(400).send({
                message: "connection request already exists!!"
            })
        }


        const connectionRequest = new ConnectionRequest({
            fromUserId, toUserId, status,
        });

        const data = await connectionRequest.save();
        res.json({
            message: req.user.firstName + " is "  + status + " in " +  toUser.firstName ,
            data,
        })
    }catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
});


module.exports = requestsRouter;