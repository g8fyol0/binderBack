const express = require('express');

const {userAuth} = require("../middlewares/auth");
const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (req, res)=>{
    try{
        const user = req.user;
        res.send(user);
        // console.log("logged in user is :: " + _id);  
        // res.send("reading cookies");
    }catch(err){
        res.status(400).send("Error saving the user : " + err.message);
    }
})


module.exports = profileRouter;