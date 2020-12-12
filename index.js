const { app, server } = require('./server');

const port = process.env.PORT || 4000;

app.listen({ port: port }, () => {
    console.log(`🚀 GraphQL server ready at http://localhost:${port}${server.graphqlPath}`)
    console.log(`🚀 REST API server ready at http://localhost:${port}`)
  }
);