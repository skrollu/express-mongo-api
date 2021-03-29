const chalk = require('chalk')
const { User } = require('../database/models/User');
var TwitterStrategy = require('passport-twitter').Strategy;
const { twitter } = require('./thirdParty_setup')
const init = require('./init');
const passport = require('passport');

passport.use(new TwitterStrategy({

    consumerKey: twitter.consumerKey,
    consumerSecret: twitter.consumerSecret,
    callbackURL: twitter.callbackURL
    
}, async function(accessToken, refreshToken, profile, done) {
    
    console.log(chalk.blue(JSON.stringify(profile)));
    
    User.findOrCreate({ email: profile.emails[0].value }, function(err, user) {
        
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
            // set all of the facebook needed information in our user model
            var newUser = new User({
                name: profile.name.givenName + ' ' + profile.name.familyName,
                email: profile.emails[0].value // facebook can return multiple emails so we'll take the first
            });
            
            newUser.third_party_auth.push({
                provider_id: profile.id,
                //provider_data: profile.photos[0].value
            })
            
            newUser.save(function(err) {
                if (err) {
                    throw err;
                }
                return done(null, newUser);
            });
        }
    });
}))


init(); 

module.exports = passport;
