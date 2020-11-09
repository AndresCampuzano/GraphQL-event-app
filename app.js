const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const mongoose = require('mongoose')

// Schema
const grapqhlSchema = require('./graphql/schema')
const grapqhlresolvers = require('./graphql/resolvers')

require('dotenv').config()

const app = express()

app.use(
  '/graphql',
  graphqlHTTP({
    schema: grapqhlSchema,
    rootValue: grapqhlresolvers,
    graphiql: true
  })
)

mongoose
  .connect(`${process.env.URL}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    app.listen(4000, () => {
      console.log('now listening for requests on http://localhost:4000/graphql')
    })
  })
  .catch(err => console.log(err))
