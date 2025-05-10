const express = require('express');
const {userAuth} = require("../middlewares/auth");
const requestsRouter = express.Router();

requestsRouter.post("/sendConnectionRequest", userAuth, async (req, res)=>{
    //sending connection request
    const user = req.user;
    console.log("sending a connection request");

    res.send(user.firstName + " has sent a connection request!");
});


module.exports = requestsRouter;