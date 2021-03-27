var express = require('express');
var router = express.Router();
const passport = require("passport");
const User = require("../database/models/Users");
const { isAdmin, isAuthenticated } = require('../middlewares/authMiddlewares');
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken');
const { SALT } = require('../utils/constants/passwordSalt')
const bcrypt = require('bcryptjs')

/**
* @Route /api/users/register_login/
* @Access PUBLIC
* @Request POST
*/
router.post("/login", (req, res, next) => {
    passport.authenticate("local", function(err, user, info) {
        if (err) {
            return res.status(400).json({ errors: err });
        }
        if (!user) {
            return res.status(400).json({ errors: "No user found" });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.status(400).json({ errors: err });
            }
            return res.status(200).json({ success: `logged in ${user.id} and ${user.name}` });
        });
    })(req, res, next);
});

/**
* @Route /api/users/register/
* @Access PUBLIC
* @Request POST
*/
router.post('/register', async function(req, res, next) {
    try {
        const { email, password } = req.body;
        const exist = await User.findOne({ email });
        
        if (exist) {
            //username already exists
            res.status(400).json({    
                error: "ERROR: Email already used"
            });
        } else {
            
            const newUser = new User({ email, password });
            // Hash password before saving in database
            bcrypt.genSalt(SALT, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash;
                    newUser.save()
                        .then(user => {
                            /**
                            * Users created, a mail is sent.
                            */           
                            // async..await is not allowed in global scope, must use a wrapper
                            // mail push WebService to come...
                            async function main() {
                                
                                const token = jwt.sign({ "id": user._id }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1d'})
                                
                                let transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: process.env.ADMIN_GMAIL,
                                        pass: process.env.ADMIN_GMAIL_PASSWORD
                                    }
                                });
                                
                                const output = `
                                <h3> Welcome ${user.email}</h3>
                                <p> You have successfully created your account.</p>
                                <p> Please <a href="http://localhost:4000/api/users/verify/${token}">login</a> to confirm the creation and consult your account. </p>
                                `;
                                
                                let mailOptions = {
                                    from: `${process.env.ADMIN_GMAIL}`,
                                    to: user.email,
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
                        })
                        .catch(err => {
                            res.status(400).json({
                                error: err
                            })
                        });

                    res.status(200).json({
                        message: "Successfully registered !"
                    })
                });
            });  
        } 
    } catch (err) {
        next(err);
    }
});

/**
* @Route /api/users/delete/
* @Access PRIVATE
* @Request DELETE
* Need to be the owner of the Users to delete it, so it's needed to be connected.
*/
router.delete("/delete", isAuthenticated,  function (req, res) {
    
    const user = req.user;
    
    User.findOneAndRemove({ email: user.email })
    .then((user, err) => {
        if (user) {
            req.logout();
            res.status(200).json({
                deleted: true,
                user
            });
        } else {
            res.status(400).json({
                deleted: false,
                error: "ERROR: user wasn't find and wasn't deleted" + err
            });
        }
    })
    .catch((err) => {
        // error during method
        //console.log(err);      
        res.status(400).json({
            deleted: false,
            error: err
        });
    });
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
        User.findById({ _id: decodedToken.id }, (err, user) => {
            if(user) {
                //If user is already verified, we don't need to do the rest of the operation.
                if(user.email_is_verified == true) {
                    res.status(200).json({
                        verified: true,
                        message: 'Your account is already verified !'
                    });
                //Verification is needed
                } else {
                    const userToUpdate = new User({
                        ...user,
                        email_is_verified: true
                    });
                    
                    User.findByIdAndUpdate( user.id, { $set: userToUpdate }, { new: true })
                    .then((updatedUser) => {
                        if(updatedUser) {
                            res.satus(200).json({
                                verified: true,
                                message: `Hello again ${updatedUser.email}, your account is now verified !`
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
                    message: `Error, Verification token seems to be good but your Users doesn't exist...`
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
    res.status(200).json({
        logged: false,
        message: "Successfully logged out !"
    });
});

/**
 * ***************************************** FACEBOOK AUTHENTICATION ***********************************
 */

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
