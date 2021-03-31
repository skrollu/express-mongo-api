const logger = require('morgan');
const fs = require('fs');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
//const utils = require('./utils')
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const chalk = require('chalk')// can color the log
const MongoStore = require('connect-mongo');
//const mongoose = require('mongoose')
const Swig = require('swig');
const path = require('path');
const bodyParser = require('body-parser')

//------------------------------------------------------------------DATABASE CONNECTION

const { connectDb } = require("./database/database")
connectDb();

//------------------------------------------------------------------Setup Express Server

const app = express();

app.use(logger('dev'));
//app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(require('express-session')({
  secret: process.env.EXPRESS_SESSION_SECRET_KEY ? process.env.EXPRESS_SESSION_SECRET_KEY : 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  //store: MongoStore.create({ mongooseConnection: mongoose.connection }) // store session information into db
}));

// *** view engine *** //
var swig = new Swig.Swig();
app.engine('html', swig.renderFile);
app.set('view engine', 'html');


// *** static directory *** //
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '../client/public')));

//------------------------------------------------------------------PASSPORT SETTINGS

const passport = require('passport');

app.use(passport.initialize());
app.use(passport.session());

//------------------------------------------------------------------EXPRESS ROUTER SETTINGS

const moviesRoutes = require('./routes/movies');
const usersRoutes = require('./routes/users');
const cinemasRoutes = require('./routes/cinemas');

app.use("/api/movies", moviesRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/cinemas", cinemasRoutes);

// catch 404 and forward to error handler

/*  Graphql  request and throw Errors
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
*/

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({ 
      message: err.message,
      error: err 
    })
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

//------------------------------------------------------------------GRAPHQL SETTINGS

const resolvers = require("./graphql/resolvers");
const models = require("./database/models");

const server = new ApolloServer({
  typeDefs: fs.readFileSync('./graphql/schemas/Movie.graphql', 'utf-8'),
  resolvers,
  context: ({ req }) => ({ 
    req: req,
    models, 
    //utils //can be a wrong pratice to integrate every utils methode inside the context, better to import only necessary utils method when needed
  }),
  formatError: (err) => {
    // Don't give the specific errors to the client.
    if (err.message.startsWith("Database Error: ")) {
      return new Error('Internal server error');
    }
    // Otherwise return the original error.  The error can also
    // be manipulated in other ways, so long as it's returned.
    return err;
  },
  debug: (process.env.NODE_ENV == 'development' ? true : false) //enable stack trace in error server response, In case of production or test we don't want it !
});
server.applyMiddleware({ app, path: '/graphql' });

//-------------------------------------------------------------------Express Server Settings

/**
* Listen on provided port, on all network interfaces.
*/
app.on('error', onError);
//app.on('listening', onListening);

/**
* Event listener for HTTP server "error" event.
*/
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  
  var bind = typeof port === 'string'
  ? 'Pipe ' + port
  : 'Port ' + port;
  
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
    console.error(bind + ' requires elevated privileges');
    process.exit(1);
    break;
    case 'EADDRINUSE':
    console.error(bind + ' is already in use');
    process.exit(1);
    break;
    default:
    throw error;
  }
}

/**
* Event listener for HTTP server "listening" event.
*/

/*
var debug = require('debug')('passport-local-express4:server');

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
  ? 'pipe ' + addr
  : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

*/

module.exports = { app, server } // to test better practice surely exist