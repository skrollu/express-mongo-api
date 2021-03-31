const chalk = require('chalk')
const { User } = require('../database/models/User');
const FacebookStrategy = require("passport-facebook").Strategy;
const { facebook } = require('./thirdParty_setup')
const init = require('./init');
const passport = require('passport');
const { UPDATE_USER_ERROR, CREATE_USER_ERROR } = require('../utils/constants/errors/custom_errors')

passport.use(new FacebookStrategy({
    
    clientID: facebook.clientID,
    clientSecret: facebook.clientSecret,
    callbackURL: facebook.callbackURL,
    profileFields: facebook.profileFields
    
}, function(accessToken, refreshToken, profile, done) {
    
    console.log("Profile", profile)

    const searchQuery = {
        email: profile.emails[0].value
    };

    const updates = {
        name: profile.name.givenName + ' ' + profile.name.familyName,
        third_party_auth: { provider_name: profile.provider, provider_id: profile.id }
    };

    /**
     * upsert: 
     * Optional. When true, findOneAndUpdate() either:
        Creates a new document if no documents match the filter. For more details see upsert behavior. Returns null after inserting the new document, unless returnNewDocument is true.
        Updates a single document that matches the filter.
        To avoid multiple upserts, ensure that the filter fields are uniquely indexed.
        Defaults to false.

        returnNewDocument: 
        Optional. When true, returns the updated document instead of the original document.
        Defaults to false.
     */
    const options = {
        upsert: true,
        returnNewDocument: true
    };

    console.log("BEFORE FINDoneANDupdate", searchQuery)
    console.log("BEFORE FINDoneANDupdate", updates)

    User.findOne(searchQuery, function(err, user) {
        if(err) {
            return done(err);
        } else if(user) {
            User.findOneAndUpdate(searchQuery, updates, (err, updatedUser) => {
                if(err) {
                    return done(err);
                } else if(updatedUser) {
                    return done(null, updatedUser);
                } else {
                    return done(UPDATE_USER_ERROR.message, null);
                }
            })
        } else {
            const newUser =  new User({
                name: updates.name,
                email: profile.emails[0],
                third_party_auth: updates.third_party_auth
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
