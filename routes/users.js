var express = require('express');
var router = express.Router();
const passport = require("passport");
const { Account } = require("../database/models/account");

router.post("/register", function (req, res) {
    const newUser = {
        username: req.body.username,
        userType: req.body.userType ? req.body.userType : "user",
    };
    
    Account.register(newUser, req.body.password, function (err, account) {
        if (err) {
            console.log(err);
            return res.json({    
                registered: false,
                error: err.message }
            ); //username already exists
        }
        
        passport.authenticate("local")(req, res, function () {
            console.log(account);
            res.json({
                registered: true,
                message: "Successfully registered !"
            })
        });
    });
});

router.post("/login", function (req, res, next) {
    
    passport.authenticate("local", function (err, user, info) {
        if (err) {
            console.log(err);
            return next(err);
        }
        
        if (!user) {
            return res.json({ logged: false, error: "Invalid Credentials" });
        }

        req.logIn(user, function (err) {
            if (err) {
                return res.json({ logged: false, error: "Invalid Credentials" });
            }
            
            return res.json({
                logged: true,
                message: "Successfully logged in !"
            });
        });
    })(req, res, next);
});

router.get("/logout", function (req, res) {
    req.logout();
    res.json({
        logged: false,
        message: "Successfully logged out !"
    });
});

module.exports = router;
