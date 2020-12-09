const mongoose = require("mongoose");
const dotenv = require('dotenv').config();
let DATABASE_URL;


if(process.env.NODE_ENV === 'development') {
  DATABASE_URL = process.env.DATABASE_URL_CLUSTER_ADMIN;
} else if(process.env.NODE_ENV === 'production') {
  DATABASE_URL = process.env.DATABASE_URL_READ_ONLY;
} else if (process.env.NODE_ENV === 'test') {
  DATABASE_URL = process.env.MONGO_DB_MY_API_URL_TEST;
} else {
  DATABASE_URL = process.env.DATABASE_URL_READ_ONLY;
}

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
