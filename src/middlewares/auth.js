const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { findById } = require("../models/user");
const userAuth = async (req, res, next) => {
  try {
    //read the token from request cookies
    const cookies = req.cookies;
    const { token } = cookies;
    if (!token) {
      return res.status(401).send("you are not logged in Plz login!");
    }
    //validate the token
    const decodedData = await jwt.verify(token, process.env.JWT_SECRET);
    const { _id } = decodedData;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("user not found");
    }
    req.user = user;
    next();
    //find the embedded user in that token
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
};

module.exports = { userAuth };

// const adminAuth = (req, res, next)=>{
//     console.log("admin is getting verified");
//     const token = "xyz";
//     const isAdminAuthorized = token === "xyz";
//     if(!isAdminAuthorized){
//         res.status(401).send("not authorized");
//     }else{
//         next();
//     }
// }

// const userAuth = (req, res, next)=>{
//     console.log("User is getting verified");
//     const token = "xyz";
//     const isAdminAuthorized = token === "xyz";
//     if(!isAdminAuthorized){
//         res.status(401).send("not authorized");
//     }else{
//         next();
//     }
// }

// module.exports = {
//     adminAuth,
//     userAuth
// }
