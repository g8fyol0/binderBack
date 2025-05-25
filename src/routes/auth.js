const express = require("express");
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/nodemailerUtil");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    //validting the data
    validateSignUpData(req);
    //encypt the password then save the user
    const { firstName, lastName, emailId, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ emailId });
    
    if (existingUser) {
      // If user exists but email is not verified, allow re-signup
      if (!existingUser.isEmailVerified) {
        // Update user details
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;
        existingUser.password = await bcrypt.hash(password, 10);
        
        // Generate new OTP
        const otp = existingUser.generateOTP();
        await existingUser.save();
        
        // Send OTP email
        await sendOTPEmail(emailId, otp, firstName);
        
        return res.status(200).json({ 
          message: "User already exists but not verified. New OTP sent to your email.",
          requiresVerification: true
        });
      } else {
        // If user exists and is verified, don't allow re-signup
        return res.status(400).json({ message: "User with this email already exists." });
      }
    }
    
    // If user doesn't exist, create new user
    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      isEmailVerified: false
    });
    
    // Generate OTP
    const otp = user.generateOTP();
    const savedUser = await user.save();

    // Send OTP email
    await sendOTPEmail(emailId, otp, firstName);

    res.status(201).json({ 
      message: "User registered successfully. Please verify your email with the OTP sent.",
      requiresVerification: true
    });
  } catch (err) {
    res.status(400).json({ error: "Error during signup: " + err.message });
  }
});

// New route for OTP verification
authRouter.post("/verify-otp", async (req, res) => {
  try {
    const { emailId, otp } = req.body;
    
    if (!emailId || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }
    
    const user = await User.findOne({ emailId });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if OTP is valid and not expired
    if (user.emailOTP !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }
    
    // Mark email as verified
    user.isEmailVerified = true;
    user.emailOTP = undefined;
    user.otpExpiry = undefined;
    await user.save();
    
    // Generate JWT token
    const token = await user.getJWT();
    
    // Set cookie and send response
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    
    res.status(200).json({ message: "Email verified successfully", data: user });
  } catch (err) {
    res.status(400).json({ error: "Error during verification: " + err.message });
  }
});

// New route for resending OTP
authRouter.post("/resend-otp", async (req, res) => {
  try {
    const { emailId } = req.body;
    
    if (!emailId) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const user = await User.findOne({ emailId });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Email is already verified" });
    }
    
    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();
    
    // Send OTP email
    await sendOTPEmail(emailId, otp, user.firstName);
    
    res.status(200).json({ message: "OTP resent successfully" });
  } catch (err) {
    res.status(400).json({ error: "Error resending OTP: " + err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("Invalid Credentials");
    }
    
    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        error: "Email not verified", 
        requiresVerification: true 
      });
    }
    
    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJWT();

      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.send(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).json({ error: "Login failed: " + err.message });
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
