var thirdPartySetup = {
    facebook: {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:4000/api/users/auth/facebook/callback"
    },
    twitter: {
        consumerKey: process.env.TWITTER_APP_ID,
        consumerSecret: process.env.TWITTER_APP_SECRET_KEY,
        callbackURL: "http://localhost:4000/api/users/auth/twitter/callback"
    },
    github: {
        clientID: 'get_your_own',
        clientSecret: 'get_your_own',
        callbackURL: "http://127.0.0.1:3000/auth/github/callback"
    },
    linkedin: {
        clientID: 'get_your_own',
        clientSecret: 'get_your_own',
        callbackURL: "http://127.0.0.1:3000/auth/linkedin/callback"
    },
};

module.exports = thirdPartySetup;
