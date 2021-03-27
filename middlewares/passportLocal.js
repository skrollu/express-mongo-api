
const passportLocal = () => {
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const { Account } = require('../database/models/account');
    
    passport.use('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    },  async (email, password, done) => {
        //Retrieve the user in database and store data in session
        try {
            const user = await Account.findOne({ email });
            console.log("found user: " + user)
            //Username/email doesn't exist
            if(!user) {
                return done(null, false, { message: "Username/email doesn't exist"})
            }
        
            //Email exist and now we need to verify  password
            const isMatched = await user.isValidPassword(password, user.password)
            return isMatched ? done(null, user) :  done(null, false, { message: "Incorrect password"})
        } catch(err) {
            done(err)
        }
    }));
}
    
module.exports = {
    passportLocal
}