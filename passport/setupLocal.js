const { User } = require("../database/models/User");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const init = require('./init');
const { WRONG_PASSWORD, EMAIL_IS_NOT_VERIFIED, NO_USER_FOUND } = require("../utils/constants/custom_logs/custom_errors");

// Local Strategy
passport.use(
    new LocalStrategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => {
        console.log("Local strategy: " + email + " " + password)
        // Match User
        User.findOne({ email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: NO_USER_FOUND.message });
                // Compare password and identify user
                } else {
                    if(user.email_is_verified) {
                        // Match password
                        const isMatched = user.isValidPassword(password, user.password);
                        if (isMatched) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: WRONG_PASSWORD.message });
                        }
                    } else {
                        return done(null, false, { message: EMAIL_IS_NOT_VERIFIED.message, email_is_verified: false });
                    }
                }
            })
            .catch(err => {
                return done(err, false);
            });
    })
);

init(); 

module.exports = passport;
