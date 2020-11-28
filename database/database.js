const mongoose = require("mongoose");
const dotenv = require('dotenv').config();
let DATABASE_URL;


if(process.env.NODE_ENV === 'development') {
   DATABASE_URL = process.env.DATABASE_URL_CLUSTER_ADMIN;
} else {
   DATABASE_URL = process.env.DATABASE_URL_TEST;
}

console.log("DB : ", DATABASE_URL)
const connectDb = () => {
  return mongoose.connect(DATABASE_URL, { useUnifiedTopology: true, useNewUrlParser: true }, err => {
    if (err) {
      console.log("Connection to Database failed.");
    }
    else{
      console.log("Database connection successful.");
    }
  });
};

module.exports = connectDb;
