var express = require('express');
var router = express.Router();
const passport = require("passport");
const { Account } = require("../database/models/account");
const { isAdmin, isAuthenticated } = require('../middlewares/authMiddlewares');
const nodemailer = require('nodemailer')
const { body, validationResult } = require('express-validator');
const { ensureLoggedOut, ensureLoggedIn } = require('connect-ensure-login');

/**
* @Route /api/users/register/
* @Access PUBLIC
* @Request POST
*/
router.post('/register', 
/*ensureLoggedOut({ redirectTo: '/' }), */ // mieux vaut faire maison car cela correspond plus à l'utilisation d'un view engine
/* registerValidator,*/
async function(req, res, next) {
    try {
        const { email } = req.body;
        const doesExist = await Account.findOne({ email });
        
        if (doesExist) {

            //username already exists
            res.status(400).json({    
                registered: false,
                error: "ERROR: Username or Email already used"
            });
        } else {
            
            const account = new Account(req.body);
            console.log(account)
            await account.save();
            
            
            /**
            * Account created, a mail is sent.
            */
            const output = `
            <h3> Welcome ${account.username}</h3>
            <p> You have successfully created your account.</p>
            <p> Please <a href="http://localhost:4201/login">login</a> to confirm the creation and consult your account. </p>
            `;
            
            
            // async..await is not allowed in global scope, must use a wrapper
            async function main() {
                
                // Generate test SMTP service account from ethereal.email
                // Only needed if you don't have a real mail account for testing
                let testAccount = await nodemailer.createTestAccount();
                
                // create reusable transporter object using the default SMTP transport
                let transporter = nodemailer.createTransport({
                    host: "smtp.ethereal.email",
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: testAccount.user, // generated ethereal user
                        pass: testAccount.pass, // generated ethereal password
                    },
                    tls: {
                        rejectUnauthorizesd: false
                    }
                });
                
                // verify connection configuration
                transporter.verify(function(error, success) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("Server is ready to take our messages");
                    }
                });
                
                // send mail with defined transport object
                let info = await transporter.sendMail({
                    from: '"Gaumont" <matiber76@gmail.com>', // sender address
                    to: `${account.email}`, // list of receivers
                    subject: "Gaumont: Successfully registered.", // Subject line
                    text: "Hello world?", // plain text body
                    html: output, // html body
                });
                
                console.log("Message sent: %s", info.messageId);
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            }
            
            main().catch(console.error);
            
            res.json({
                registered: true,
                message: "Successfully registered !"
            })
        } 
    } catch (err) {
        next(err);
    }
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
    console.log(req.body)
    
    passport.authenticate('local', function(err, user, info) {
        req.logIn(user, function(err) {
            if (err) { 
                console.log(err);
                return res.status(400).json({ logged: false, error: "Invalid Credentials" }); 
            }
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
router.get("/logout", isAuthenticated, function (req, res) {
    req.logout();
    res.json({
        logged: false,
        message: "Successfully logged out !"
    });
});

module.exports = router;
