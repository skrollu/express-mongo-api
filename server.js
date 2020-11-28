const logger = require('morgan');
const fs = require('fs');
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
//const utils = require('./utils')
const dotenv = require('dotenv').config()

//Setup Express Server
const app = express();
app.use(express.static('public'));
app.use(logger('dev'));

//------------------------------------------------------------------DATABASE CONNECTION

const dbConnection = require("./database/database")
dbConnection();

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

//-------------------------------------------------------------------Launch Express Server

const port = process.env.PORT || 4000;

app.listen({ port: port }, () =>
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`)
);

module.exports = { app } // to test better practice surely exist