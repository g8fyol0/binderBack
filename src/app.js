const express = require('express');
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const {validateSignUpData} = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const {userAuth} = require("./middlewares/auth");

//middleware to read json -> js object
app.use(express.json()); //it will work for all routes automatically whenever json comes it will convert it to js object for all 
//middleware to read cookie
app.use(cookieParser());



app.post("/signup", async (req, res)=>{
    // console.log(req.body);
    // const userObj = {
    //     firstName : "test",
    //     lastName : "first",
    //     emailId : "testfirst@gmail.com",
    //     password : "testfirst"
    // }
    //now creating instance of user Model which like a new document creating a new instance of UserModel

    //now it's dynamic /signup api 

    try{
        //validting the data
        validateSignUpData(req);
        //encypt the password then save the user
        const {firstName, lastName, emailId, password} = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        // console.log(passwordHash);


        const user = new User({firstName, lastName, emailId, password: passwordHash,});
        await user.save(); //database will be saved
        res.send("user added successfully");
    }catch(err){
        res.status(400).send("Error saving the user : " + err.message);
    }
})

app.post("/login", async (req, res) => {

    try{
        const {emailId, password} = req.body;
        // if(!validator.isEmail(emailId)){
        //     throw new Error("email id is invalid!!");
        // }
        //check wheterh user is present or not
        const user = await User.findOne({emailId: emailId});
        if(!user){
            // throw new Error("EmailId is not present in DB"); //don't leak such DB information in DB
            throw new Error("Invalid Credentials");
        }
        const isPasswordValid = await user.validatePassword(password);  //offloaded to schema method
        if(isPasswordValid){
            // res.cookie("token", "somerandomtokenaddedtocookie");
            // generating token 
            //offloaded the jwt token generation to schema methods
            const token = await user.getJWT();

            res.cookie("token", token, {expires: new Date(Date.now() + 8 * 3600000)}); //we can set cookie expire
            res.send("Login Successfull!!!");
            //if password is valid then we will create a jwt token and add the token to cookie and send the response to the user

        }else{
            throw new Error("Invalid Credentials");
        }

    }catch(err){
        res.status(400).send("Error saving the user : " + err.message);
    }
});

app.get("/profile", userAuth, async (req, res)=>{
    try{
        const user = req.user;
        res.send(user);
        // console.log("logged in user is :: " + _id);  
        // res.send("reading cookies");
    }catch(err){
        res.status(400).send("Error saving the user : " + err.message);
    }
})

app.post("/sendConnectionRequest", userAuth, async (req, res)=>{
    //sending connection request
    const user = req.user;
    console.log("sending a connection request");

    res.send(user.firstName + " has sent a connection request!");
});
















// app.get("/user",async (req, res)=>{
//     const userEmail = req.body.emailId;
//     try{
//         const users = await User.find({emailId: userEmail});
//         if(users.length === 0){
//             res.status(404).send("user not found");
//         }
//         else{
//             res.send(users);
//         }
//     }catch(err){
//         res.status(400).send("something went wrong");
//     }
// })
// //feed api get /feed - get all the users from the database
// app.get("/feed",async (req, res)=>{
//     try{
//         const users = await User.find(); //get's all the document or user
//         res.send(users);
//     }catch(err){
//         res.status(400).send("something went wrong");
//     }
// } );

// app.delete("/user", async (req, res)=>{
//     const userId = req.body.userId;
//     try{
//         const user = await User.findByIdAndDelete(userId);  //same as {_id: userId}
//         res.send("user deleted successfully");
//     }catch(err){
//         res.status(404).status("something went wrong");
//     }
// })

// //update the user
// app.patch("/user/:userId", async (req, res)=>{
//     const userId = req.params?.userId;
//     const data = req.body;

//     try{
//         const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];

//         const isUpdateAllowed = Object.keys(data).every((k) => 
//             ALLOWED_UPDATES.includes(k)
//         );
    
//         if(!isUpdateAllowed){
//             throw new Error("update is not allowed");
//         }
//         if(data?.skills.length > 10){
//             throw new Error("skills can't be more than 10");
//         }
//         const user = await User.findByIdAndUpdate({_id : userId}, data, {returnDocument : "before", runValidators: true}); //this function will log the older version of the document
//         res.send("user updated successfully!!");
//     }catch(err){
//         res.status(400).send("Update failed" + err.message);
//     }
// });
// //update using emailID
// app.patch("/userem", async (req, res) => {
//     const userEmail = req.body.userEmail;
//     const userData = req.body;
//     try{
//         const user = await User.findOneAndUpdate({emailId: userEmail}, userData, {returnDocument : 'before', runValidators: true});
//         res.send("user updated successfully");
//     }catch(err){
//         res.status(400).send("something went wrong!!");
//     }
// })


//db connection check
connectDB().then(()=>{
    console.log("Database connection established ...");
}).catch((err)=>{
    console.error("Database can't be connected!" + err);
});


app.listen(3000, ()=> {
    console.log("server is listeing on port 3000 ...");
});


//creating POST api for user 








// const {adminAuth} = require("./middlewares");
// const {adminAuth, userAuth} = require("./middlewares/auth")
// handling the requests 
// instead of app.use we will use app.get and app.post other method to handle different calls separetly
// this will only handel get call to /user

//mathes /user, /user/anything/anything 
//? is optional
//+ abc abbbbc atleast 1 b 
//* ab*c any thing in between b and c basically we can put regex in here to match url
// a(bc)+d atleast one bc in between 
// app.get(/a(bc)+d/,(req, res)=>{
//     res.send("? indicates optional");
// })
// app.get("/user/:userId/:name/:password", (req, res)=>{
//     console.log(req.params);
//     console.log(req.query); //it will give all the query parameters
//     res.send({firstName: "g8fyol", lastName: "test"});
// })
//handling dynamic apis like user/101 or user/104444 :useId
// app.use('/user/',(req, res)=>{
//     res.send("haha order matters"); //other handeler will not get chance as it will handle all
// })
// app.get("/user",(req,res)=>{
//     res.send({firstName: "g8fyol", lastName: "test"});
// })
// app.post("/user",(req, res)=>{
//     console.log("saving data to database");
//     res.send("data saved successfully");
// })
// app.delete('/user', (req, res)=>{
//     res.send("deleted successfully");
// })

// app.use("/test", (req, res)=>{
//     res.send("hello from the server!");
// })

//app.use will match the all the http request at give route
// app.use("/hello", (req, res)=>{
//     res.send("hello hello hello!");
// })
// app.use("/hello/2", (req, res)=>{
    //this function is called route handler
//     res.send("it will match /hello/2 ");
// })
// app.use("/nodemon",(req, res)=>{
//     res.send("nodemon tested"); //if we don't write res.send() this will just create a infinite req hanging around 
// })

// app.use("/user",
//     [(req, res, next)=>{
//         console.log("handling the route user!!");
//         //res.send("RESponse1!!"); //as soon as we do res.send it will not go furthur
//         next(); // if we do next it will go to next parameter handler so if res.send is not done here it will goto next handler
//         // if we do so if write both then we will try to send other response to same request it will give error
//         // next basically calls next route handler
//         // if we call next() in last handler ther it will give route error as we are not handling that route
//     },
//     (req, res, next)=>{
//         console.log("hanlding the route user 2");
//         res.send("response3");
//     },
//     //these all called middle wares and express will go through the chain of middleware

//     // GET /user ==> it goes through middleware chain ==>> those function which actually handle the request is called request handler
//     // why we need middleware 
    
//     (req, res, next)=>{
//         console.log("hanlding the route user 2");
//         res.send("response2");
//     }]
// )

//writing middleware for admin so that we can do authorization at beginning and do next
// app.use("/admin", adminAuth);
// app.use("/user/data", userAuth, (req, res)=>{
//     res.send("user DATA send");
// });
// //if we don't need middleware we can directly call the user
// app.use("/user/login",(req, res)=>{
//     res.send("logged in successfully");
// })

// app.get("/admin/getAllData", (req, res)=>{
//     //check if user is admin or not 
//     // const token = "xyz";
//     // const isAdminAuthorized = token === "xyz";
//     res.send("send all data");  

// })
// app.get("/admin/deleteUser", (req, res)=>{
//     res.send("user is deleted");
// })

// //error handling
// app.use("/",(err ,req, res, next)=>{
//     //this is wild card
//     if(err){
//         //we can log error in sentry and all
//         res.status(500).send("something went wrong");
//     }
// })
// app.get("/getuserdata", (req, res)=>{
//     // logic of db call and get user data 
//     // but if there is some error in the code 
//     throw new Error("error happend"); //error should not be exposed like this
//     //try to write code in try and catch but still some unhandeled error

//     res.send("user data sent");
// })

// app.use("/",(err ,req, res, next)=>{
//     //this is wild card
//     if(err){
//         //we can log error in sentry and all
//         res.status(500).send("something went wrong");
//     }
// })

