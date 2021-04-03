const chalk = require('chalk')
const { User } = require('../database/models/User');
const FacebookStrategy = require("passport-facebook").Strategy;
const { facebook } = require('./thirdParty_setup')
const init = require('./init');
const passport = require('passport');
const { UPDATE_USER_ERROR, CREATE_USER_ERROR } = require('../utils/constants/custom_logs/custom_errors')
const { UPDATE_USER_WARN } = require('../utils/constants/custom_logs/custom_warns')


passport.use(new FacebookStrategy({
    
    clientID: facebook.clientID,
    clientSecret: facebook.clientSecret,
    callbackURL: facebook.callbackURL,
    profileFields: facebook.profileFields,
    
}, function(accessToken, refreshToken, profile, done) {
    
    console.info(chalk.blue("Facebook profile: "), profile);

    const searchQuery = {
        email: profile.emails[0].value
    };

    User.findOne(searchQuery, function(err, user) {
        if(err) {
            return done(err);
        } else if(user) {
                      
            //Found facebook provider data and update old facebook data to keep data up to date               
            if(user.third_party_auth != null || user.third_party_auth.length > 0){   
                console.log("Found user, update facebook datas and log in")
                user.third_party_auth.map((provider, index) => {
                    if(provider.provider_name != null && provider.provider_name === 'facebook') {
                        //keep provider datas up to data
                        provider.provider_data = {
                            name: {
                                givenName: profile.name.givenName,
                                familyName: profile.name.familyName,
                            },
                            emails: profile.emails
                        }
                    }
                })

                //Update modification
                console.log("Updated user to save: ", user)
                /**
                 * Saves this document by inserting a new document into the database if document.isNew is true,
                 * or sends an updateOne operation only with the modifications to the database, it does not replace the whole document in the latter case.
                 */
                user.save((err, updatedUser) => {
                    if(err) {
                        return done(err);
                    } else if(updatedUser) {
                        return done(null, updatedUser);
                    } else {
                        return done(UPDATE_USER_ERROR.message, null);
                    }
                });
            } else {
                console.warn(chalk.yellow(UPDATE_USER_WARN.message))
                return done(null, user)
            }
        } else {
            console.log("No user with this email found so create a new one.")
            const newUser = new User({
                name: profile.name.givenName + ' ' + profile.name.familyName,
                email: profile.emails[0].value,
                third_party_auth: {
                    provider_name: profile.provider, 
                    provider_id: profile.id, 
                    provider_data: {
                        name: {
                            givenName: profile.name.givenName,
                            familyName: profile.name.familyName,
                        },
                        emails: profile.emails
                    }
                }
            })
            newUser.save((err, newUser) => {
                if(err) {
                    return done(err);
                } else if (newUser) {
                    return done(null, newUser);
                } else {
                    return done(CREATE_USER_ERROR.message, null);
                }
            })
        }
    })
}))


init(); 

module.exports = passport;
