const { User } = require("../database/models/User");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const init = require('./init')

// Local Strategy
passport.use(
    new LocalStrategy({ usernameField: "email", passwordField: "password" }, (email, password, done) => {
        console.log("Local strategy: " + email + " " + password)
        // Match User
        User.findOne({ email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: err });
                // Compare password and identify user
                } else {
                    if(user.email_is_verified) {
                        // Match password
                        const isMatched = user.isValidPassword(password, user.password);
                        if (isMatched) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: "Wrong password" });
                        }
                    } else {
                        return done(null, false, { message: "Email isn't verified, can't connect", email_is_verified: false });
                    }
                }
            })
            .catch(err => {
                return done(null, false, { message: err });
            });
    })
);

init(); 

module.exports = passport;
