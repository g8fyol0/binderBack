const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
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
            enum: {
                values: ["male", "female", "others"],
                message: `{VALUE} is not a valid gender type`,
            },
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


userSchema.index({firstName: 1, lastName: 1});

//mongoose schema methods

userSchema.methods.getJWT = async function (){
    const user = this;
    const token = await jwt.sign({_id: this._id}, "serverSecretPassword", {expiresIn: "7d"} );
    return token;
}

userSchema.methods.validatePassword = async function(passwordInputByUser){
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(passwordInputByUser, passwordHash);
    return isPasswordValid;
}

//creating model 
module.exports = mongoose.model("User", userSchema);

