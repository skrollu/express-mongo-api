const chalk = require('chalk')
const passport = require('passport');
const { Account } = require('../database/models/account');
const FacebookStrategy = require("passport-facebook").Strategy;

const passportFacebook = () => {
    passport.use(new FacebookStrategy({
        
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:4000/api/users/auth/facebook/callback"
        
    }, async function(accessToken, refreshToken, profile, done) {
        
        console.log(chalk.blue(JSON.stringify(profile)));
        
        Account.findOrCreate({ facebookId: profile.id }, function(err, user) {
            
            // if there is an error, stop everything and return that ie an error connecting to the database
            if (err){
                return done(err);
            }
            
            // if the user is found, then log them in
            if (user) {
                console.log("user found")
                console.log(user)
                return done(null, user);
            } else {
                
                // if there is no user found with that facebook id, create them
                var newUser = new Account();
                
                // set all of the facebook information in our user model
                newUser.facebook.id = profile.id;                                
                newUser.username = profile.name.givenName + ' ' + profile.name.familyName;
                newUser.email = profile.emails[0].value; // facebook can return multiple emails so we'll take the first
                newUser.facebook.profilePicture = profile.photos[0].value
                
                newUser.save(function(err) {
                    if (err)
                    throw err;
                    
                    return done(null, newUser);
                });
            }
        });
    }))
}

module.exports = {
    passportFacebook
}