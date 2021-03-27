const { roles } = require('../utils/constants/roles');

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

module.exports = {
  isAdmin,
  isAuthenticated
}