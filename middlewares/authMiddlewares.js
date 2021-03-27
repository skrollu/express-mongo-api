const { roles } = require('../utils/constants/roles/roles');
const passport = require('passport')

function isAdmin(req, res, next){
  /* TODO */ //This kind of check will be replace by a search in database for more security
  if(req.isAuthenticated() && req.user.role === roles.admin){ 
    return next();
  } else {
    res.status(401).json({
      logged: false,
      error: "ERROR: You are not administrate to do that !"
    })
  }
}

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.status(401).json({
      logged: false,
      error: "ERROR: You need to be logged in to do that !"
    })
  }
}

function auth(req, res, next) {
  console.log("AUTH MIDDLEWARE " + req.user)
  passport.authenticate('local', (error, user, info) => {
    if(error) {
      res.status(400).json({"statusCode" : 200 , "message" : error});
    }
    req.login(user, function(error) {
      if (error) {
        return next(error);
      }
      next();
    });
  })(req, res, next);
}

module.exports = {
  isAdmin,
  isAuthenticated,
  auth
}