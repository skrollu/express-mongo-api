var express = require('express');
var router = express.Router();
const passport = require("passport");
const { Account } = require("../database/models/account");
const { isAdmin, isAuthenticated } = require('../middlewares/authMiddlewares');

/**
* @Route /api/users/register/
* @Access PUBLIC
* @Request POST
*/
router.post('/register', function(req, res, next) {
    const account = new Account({
        username: req.body.username,
        userType: req.body.userType ? req.body.userType : "user"
    });
    Account.register( account, req.body.password, function(err) {
        if (err) {
            //console.log('error while user register!', err);  //username already exists
            res.status(400).json({    
                registered: false,
                error: err.message 
            });
        } else {        
            //console.log('user registered!');
            res.json({
                registered: true,
                message: "Successfully registered !"
            })
        }
        
    });
});

/**
* @Route /api/users/delete/
* @Access PRIVATE
* @Request DELETE
* Need to be the owner of the account to delete it, so it's needed to be connected.
*/
router.delete("/delete", isAuthenticated,  function (req, res) {
    
    const user = req.user;
        
    Account.findOneAndRemove({ username: user.username })
    .then((user, err) => {
        if (user) {
            req.logout();
            res.json({
                deleted: true,
                user
            });
        } else {
            res.json({
                deleted: false,
                error: "ERROR: user wasn't find and wasn't deleted" + err
            });
        }
    })
    .catch((err) => {
        // error during method
        //console.log(err);      
        res.json({
            deleted: false,
            error: err
        });
    });
});

/**
* @Route /api/users/login/
* @Access PUBLIC
* @Request POST
*/
router.post("/login", function (req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        
        req.logIn(user, function(err) {
            if (err) { return res.status(400).json({ logged: false, error: "Invalid Credentials" }); }
            res.json({
                logged: true,
                message: "Successfully logged in !"
            });
        });
        
    })(req, res, next);
});

/**
* @Route /api/users/logout/
* @Access PUBLIC
* @Request GET
*/
router.get("/logout", function (req, res) {
    req.logout();
    res.json({
        logged: false,
        message: "Successfully logged out !"
    });
});

module.exports = router;
