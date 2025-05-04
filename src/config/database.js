const mongoose = require("mongoose");


//connected to cluster
const connectDB = async () => {
    await mongoose.connect("mongodb+srv://g8fyol:Amanbirth%402002@binder.h1plopz.mongodb.net/binder"); //connect to cluster it returns a promise
    // await mongoose.connect("mongodb+srv://g8fyol:Amanbirth@2004@binder.h1plopz.mongodb.net/test?retryWrites=true&w=majority");

}

module.exports = connectDB;
 


