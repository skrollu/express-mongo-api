const mongoose = require("mongoose");
const { SALT } = require('../../utils/constants/passwordSalt')
const bcrypt = require('bcryptjs')

const validateEmail = (email) => {
  var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email)
};

const ThirdPartyProviderSchema = new mongoose.Schema({
    provider_name: {
        type: String,
        default: null
    },
    provider_id: {
        type: String,
        default: null
    },
    provider_data: {
        type: {},
        default: null
    }
});
/**
 *  name: Username
    email: Email address of our user. email has to be unique. No two users can have the same email.
    email_is_verified: boolean value that indicates whether or not the email address is verified
    password: This field will hold the decrypted password.
    referral_code: This is a custom function and creates a six-character hash of the email. I.e., a new referral code is created whenever somebody signs up.
    referred_by: Indicates by whom the user was referred by.
    third_party_auth: Since we will include some third-party-authentication (in part II), we will have to store the information somewhere. third_party_auth is an array of the third-party provider's data (only fundamental data like profile link) a user uses to log in.
    date: Date when the user has been created
 */
// Create Schema
const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            validate: [validateEmail, 'Please fill a valid email address']
            //match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        },
        email_is_verified: {
            type: Boolean,
            default: false
        },
        password: {
            type: String
        },
        referral_code: {
            type: String,
            default: function() {
                let hash = 0;
                for (let i = 0; i < this.email.length; i++) {
                    hash = this.email.charCodeAt(i) + ((hash << 5) - hash);
                }
                let res = (hash & 0x00ffffff).toString(16).toUpperCase();
                return "00000".substring(0, 6 - res.length) + res;
            }
        },
        referred_by: {
            type: String,
            default: null
        },
        third_party_auth: [ThirdPartyProviderSchema],
        date: {
            type: Date,
            default: Date.now
        }
    },
    /**
     * {strict: false} means that the object will accept additional not 
     * in the schema specified data. We need {strict: false} 
     * because there is no unifying schema for our third-party provider.
     */
    { strict: false }
);

// Hash password before saving in database
UserSchema.pre('save', async function (next) {
    try {
        if (this.isNew) {
            bcrypt.genSalt(SALT, (err, salt) => {
                bcrypt.hash(this.password, salt, (err, hashedPassword) => {
                    this.password = hashedPassword;
                });
            });
        }
        next();
    } catch (error) {
        console.log(error)
        next(error);
    }
});

UserSchema.method('isValidPassword', async (password, encryptedPassword) => {
    try {
        return await bcrypt.compare(password, encryptedPassword);
    } catch (err) {
        throw err;
        //throw httpError from http error module (tuto https://www.youtube.com/watch?v=4Az0hCr3g7U)
    }
});

const User = mongoose.model("Users", UserSchema, "Users");
module.exports = { User }