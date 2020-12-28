//------------------------------------------------------------------PASSPORT SETTINGS
/**
* By default, LocalStrategy expects to find credentials in parameters named username and password. If your site prefers to name these fields differently, options are available to change the defaults.

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'passwd'
},
function(username, password, done) { //ici cette focntion est remplacée par notre utilisation de account et de passport-mongoose
    // ...
}
));

*/
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { Account } = require('../database/models/account');

// passport config
passport.use('local', new LocalStrategy({
    
    usernameField: 'email',
    passwordField: 'password',
    
},  async (email, password, done) => {
    
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

passport.serializeUser((user, done) => {
    done(null, user.id)
});

passport.deserializeUser((id, done) => {
    Account.findById(id, (err, user) => {
        done(err, user)
    })
});