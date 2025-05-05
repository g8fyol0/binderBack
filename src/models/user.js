const mongoose = require("mongoose");
const validator = require("validator");


//created schema
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 4,
            maxLength: 50,
        },
        lastName: {
            type: String,
        },
        emailId: {
            type: String,
            lowercase: true,
            trim: true,
            required: true, 
            unique: true,
            validate(value){
                if(!validator.isEmail(value)){
                    throw new Error("invalid email address" + value);
                }
            }
        },
        password: {
            type: String,
            required: true,
            validate(value){
                if(!validator.isStrongPassword(value)){
                    throw new Error("you entered weak password");
                }
            }
        },
        age: {
            type: Number,
            min: 18,
        },
        gender: {
            type: String,
            //custom validation function using validate function 
            validate(value){
                if(!["male", "female", "others"].includes(value)){
                    throw new Error("gender data is not valid" + value);
                }
            }
          
        },
        photoUrl: {
            type: String,
            // default: "https://www.pnrao.com/wp-content/uploads/2023/06/dummy-user-male.jpg",
            default: "https://upload.wikimedia.org/wikipedia/en/b/b1/Portrait_placeholder.png",
            validate(value){
                if(!validator.isURL(value)){
                    throw new Error("invalid photoUrl");
                }
            }

        },
        about: {
            type: String,
            default: "this is default description of user",
        },
        skills: {
            type: [String],
        }
    }, {timestamps : true, }
);

//creating model 
module.exports = mongoose.model("User", userSchema);

