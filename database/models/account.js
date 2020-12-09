var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

var AccountSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  userType: {
    type: String,
    required: true,
  },
});

AccountSchema.plugin(passportLocalMongoose);

const Account = mongoose.model("Accounts", AccountSchema, "Accounts");

module.exports = { Account };