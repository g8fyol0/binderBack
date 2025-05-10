const express = require('express');

const {userAuth} = require("../middlewares/auth");
const {validateEditProfileData} = require('../utils/validation');
const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res)=>{
    try{
        const user = req.user;
        res.send(user);
        // console.log("logged in user is :: " + _id);  
        // res.send("reading cookies");
    }catch(err){
        res.status(400).send("Error saving the user : " + err.message);
    }
});


//edit api
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    //validate the edit data
    try{
        if(!validateEditProfileData(req)){
            throw new Error("Invalid Edit Request");
        }
        //now we can add data as data is validated
        const loggedInUser = req.user;
        Object.keys(req.body).forEach(key => (loggedInUser[key] = req.body[key]));
        await loggedInUser.save();
        res.json({message : loggedInUser.firstName + " your profile Updated Successfully", data: loggedInUser});
        // console.log(loggedInUser);
    }catch(err){
        res.status(400).send("ERROR : " + err.message);
    }
});

//forgot password api
profileRouter.patch("/profile/password", userAuth, async (req, res) => {
    
});


module.exports = profileRouter;