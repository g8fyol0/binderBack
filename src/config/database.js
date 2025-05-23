const mongoose = require("mongoose");

//connected to cluster
const connectDB = async () => {
  console.log(process.env.DB_CONNECTION_SECRET);
  await mongoose.connect(process.env.DB_CONNECTION_SECRET); //connect to cluster it returns a promise
};

module.exports = connectDB;
