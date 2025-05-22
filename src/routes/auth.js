const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  // console.log(req.body);
  // const userObj = {
  //     firstName : "test",
  //     lastName : "first",
  //     emailId : "testfirst@gmail.com",
  //     password : "testfirst"
  // }
  //now creating instance of user Model which like a new document creating a new instance of UserModel

  //now it's dynamic /signup api

  try {
    //validting the data
    validateSignUpData(req);
    //encypt the password then save the user
    const { firstName, lastName, emailId, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    // console.log(passwordHash);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    const savedUser = await user.save(); //database will be saved

    const token = await savedUser.getJWT();

    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.json({ message: "user added successfully", data: savedUser });
  } catch (err) {
    res.status(400).send("Error saving the user : " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    // if(!validator.isEmail(emailId)){
    //     throw new Error("email id is invalid!!");
    // }
    //check wheterh user is present or not
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      // throw new Error("EmailId is not present in DB"); //don't leak such DB information in DB
      throw new Error("Invalid Credentials");
    }
    const isPasswordValid = await user.validatePassword(password); //offloaded to schema method
    if (isPasswordValid) {
      // res.cookie("token", "somerandomtokenaddedtocookie");
      // generating token
      //offloaded the jwt token generation to schema methods
      const token = await user.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      }); //we can set cookie expire
      res.send(user);
      //if password is valid then we will create a jwt token and add the token to cookie and send the response to the user
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send("Error saving the user : " + err.message);
  }
});

//just expire the cookie and some other cleanup activitess
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("successfully loggedout!!");
});

module.exports = authRouter;
