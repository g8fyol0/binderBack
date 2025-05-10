const validator = require("validator");

//we are explicitely validating each and every input 
const validateSignUpData = (req) => {
    const {firstName, lastName, emailId, password} = req.body;
    if(!firstName || !lastName){
        throw new Error("Name is not valid or empty");
    }
    else if(!validator.isEmail(emailId)){
        throw new Error("email is not valid");
    }
    else if(!validator.isStrongPassword(password)){
        throw new Error("weak password please enter a strong password");
    }

    // else if(firstName.length < 4 || firstName.length >50){
    //     throw new Error("firstName should be 4 to 50 char");
    // }
}

const validateEditProfileData = (req) => {
    const allowedEditFields = ["firstName", "lastName", "emailId", "photoUrl", "gender", "age", "about", "skills"];
    const isEditAllowed = Object.keys(req.body).every(feild => allowedEditFields.includes(feild));

    return isEditAllowed;
}

module.exports = {validateSignUpData, validateEditProfileData };