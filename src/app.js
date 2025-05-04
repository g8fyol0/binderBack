const express = require('express');

const app = express();


// handling the requests 
app.use("/test", (req, res)=>{
    res.send("hello from the server!");
})
app.use("/hello", (req, res)=>{
    res.send("hello hello hello!");
})
app.use("/nodemon",(req, res)=>{
    res.send("nodemon tested");
})

app.listen(3000, ()=> {
    console.log("server is listeing on port 3000 ...");
});