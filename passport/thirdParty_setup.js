module.exports = {
    facebook: {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET_KEY,
        callbackURL: "http://localhost:4000/api/users/auth/facebook/callback",
        profileFields: ['id', 'emails', 'name']
    },
    twitter: {
        consumerKey: process.env.TWITTER_APP_ID,
        consumerSecret: process.env.TWITTER_APP_SECRET_KEY,
        callbackURL: "http://localhost:4000/api/users/auth/twitter/callback"
    },
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:4000/api/users/auth/google/callback"
    },
    github: {
        clientID: 'get_your_own',
        clientSecret: 'get_your_own',
        callbackURL: "http://localhost:4000/auth/github/callback"
    },
    linkedin: {
        clientID: 'get_your_own',
        clientSecret: 'get_your_own',
        callbackURL: "http://localhost:4000/auth/linkedin/callback"
    },
};