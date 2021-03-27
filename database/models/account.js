var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");
const bcrypt = require('bcrypt')
const { roles }= require('../../utils/constants/roles/roles')

const SaltRounds = 10;

var validateEmail = function(email) {
  var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email)
};

var AccountSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    required: 'Email address is required',
    validate: [validateEmail, 'Please fill a valid email address']
    //match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    enum: [roles.admin, roles.moderator, roles.client],
    default: roles.client,
  },
  verified: {
    type: Boolean,
    default: false
  },
  facebook: {
    id: {
      type: String
    },
    profilePicture: {
      type: String
    }
  }
});

//AccountSchema.plugin(passportLocalMongoose);

AccountSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSalt(SaltRounds);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
      if (this.email === process.env.ADMIN_EMAIL) {
        this.role = roles.admin;
      }
    }
    next();
  } catch (error) {
    console.log(error)
    next(error);
  }
});

AccountSchema.method('isValidPassword', async (password, encryptedPassword) => {
  try {
    return await bcrypt.compare(password, encryptedPassword);
  } catch (err) {
    console.log(err)
    //throw httpError from http error module (tuto https://www.youtube.com/watch?v=4Az0hCr3g7U)
  }
});

const Account = mongoose.model("Accounts", AccountSchema, "Accounts");

module.exports = { Account };