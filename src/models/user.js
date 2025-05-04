const mongoose = require("mongoose");


//created schema
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        emailId: {
            type: String
        },
        password: {
            type: String
        },
        age: {
            type: Number
        },
        gender: {
            type: String
        }
    }
);

//creating model 
module.exports = mongoose.model("User", userSchema);

