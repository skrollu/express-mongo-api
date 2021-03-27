var express = require('express');
var router = express.Router();
const passport = require("passport");
const { Account } = require("../database/models/account");
const { isAdmin, isAuthenticated, auth } = require('../middlewares/authMiddlewares');
const nodemailer = require('nodemailer')
const { body, validationResult } = require('express-validator');
const { ensureLoggedOut, ensureLoggedIn } = require('connect-ensure-login');
const jwt = require('jsonwebtoken');

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
            const accountCreated = await account.save();
            
            /**
            * Account created, a mail is sent.
            */           
            // async..await is not allowed in global scope, must use a wrapper
            async function main() {
                
                const token = jwt.sign({ "id": accountCreated._id }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1d'})
                
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.ADMIN_GMAIL,
                        pass: process.env.ADMIN_GMAIL_PASSWORD
                    }
                });
                
                const output = `
                <h3> Welcome ${account.username}</h3>
                <p> You have successfully created your account.</p>
                <p> Please <a href="http://localhost:4000/api/users/verify/${token}">login</a> to confirm the creation and consult your account. </p>
                `;
                
                let mailOptions = {
                    from: `${process.env.ADMIN_GMAIL}`,
                    to: account.email,
                    subject: "Gaumont: Successfully registered.", // Subject line
                    text: "Welcome", // plain text body
                    html: output, // html body
                }
                
                await transporter.sendMail(mailOptions, (err, data) => {
                    if(err) {
                        console.log("Error", err)
                    } else {
                        console.log("Email sended at " + mailOptions.to)
                    }
                })
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
router.post("/login", auth, (req, res) => {
    console.log("USER ROUTE: " + req.user)
    res.status(200).json({"statusCode" : 200 , logged: true, message: "Successfully logged in !", "user" : req.user});
});

/**
* @Route /api/users/login/:token
* @Access PUBLIC
* @Request GET
*/
router.get("/verify/:token", function (req, res, next) {
    
    let token = req.params.token
    
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
    
    if(decodedToken){
        Account.findById({ _id: decodedToken.id }, (err, account) => {
            if(account) {
                //If Account is already verified, we don't need to do the rest of the operation.
                if(account.verified == true) {
                    res.json({
                        verified: true,
                        message: 'Your account is already verified !'
                    });
                    //Verification is needed
                } else {
                    const accountToUpdate = new Account({
                        _id:  account._id,
                        username: account.username,
                        email: account.email,
                        password: account.password,
                        verified: true
                    });
                    
                    Account.findByIdAndUpdate( account.id, { $set: accountToUpdate }, { new: true })
                    .then((account) => {
                        if(account) {
                            res.json({
                                verified: true,
                                message: `Hello again ${account.username}, your account is now verified !`
                            })
                        } else {
                            res.status(400).json({
                                verified: false,
                                message: `Error, verification failed !`
                            })
                        }
                    })
                    .catch((err) => {
                        res.status(400).json({
                            verified: false,
                            message: `Error, verification failed: ${err}`
                        })
                    });
                }
            } else {
                res.status(400).json({
                    verified: false,
                    message: `Error, Verification token seems to be good but your account doesn't exist...`
                })
            }
        })
    }
    (req, res, next);
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

/**
 * ***************************************** FACEBOOK AUTHENTICATION ***********************************
 */

 router.post("/login", function (req, res, next) {
    
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

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
router.get('/auth/facebook', function (req, res, next) {
    
    passport.authenticate('facebook', (err, user, info) => {
        console.log("authentication en cours...")
    })
    
    (req, res, next);
});

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
router.get('/auth/facebook/callback',() => {
    console.log("/auth/facebook/callback");
    passport.authenticate('facebook', { failureRedirect: '' }), (req, res) => {
        return res.redirect('http://localhost:4201/')
    } 
});

router.get('/failed', (req, res)=> {
    res.send("failed")
});


module.exports = router;
