const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')

// Models
const EventModel = require('./models/event')

require('dotenv').config()

const app = express()

app.get('/', (req, res, next) => {
  res.send('Hello')
})

app.use(
  '/graphql',
  graphqlHTTP({
    schema: buildSchema(`
        type Event {
          _id: ID!
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput!): Event
        }
        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
      events: () => {
        return EventModel.find()
          .then(events => {
            return events.map(event => {
              return { ...event._doc }
            })
          })
          .catch(err => {
            throw err
          })
      },
      createEvent: args => {
        const event = new EventModel({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date)
        })
        return event
          .save()
          .then(result => {
            console.log(result)
            return { ...result._doc }
          })
          .catch(err => {
            console.log(err)
            throw err
          })
      }
    },
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
