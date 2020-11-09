const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// Models
const EventModel = require('./models/event')
const UserModel = require('./models/user')

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

        type User {
          _id: ID!
          email: String!
          password: String
        }

        input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }

        input UserInput {
          email: String!
          password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
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
      createEvent: async args => {
        const event = new EventModel({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
          creator: '5fa86848771c3a63483a9dd2'
        })
        let createdEvent
        return event
          .save()
          .then(result => {
            createdEvent = { ...result._doc }
            // relation
            return UserModel.findById('5fa86848771c3a63483a9dd2')
          })
          .then(user => {
            if (!user) {
              throw new Error('User not found.')
            } else {
              user.createdEvents.push(event)
              return user.save()
            }
          })
          .then(() => {
            return createdEvent
          })
          .catch(err => {
            throw err
          })
      },
      createUser: async args => {
        // validating user
        const email = args.userInput.email
        const existingUser = await UserModel.findOne({ email })
        if (existingUser) {
          throw new Error('user already exists')
        } else {
          // creating new user after validation
          const user = new UserModel({
            email: args.userInput.email,
            password: await bcrypt.hash(args.userInput.password, 12)
          })
          return user
            .save()
            .then(result => {
              return { ...result._doc, password: null }
            })
            .catch(err => {
              throw err
            })
        }
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
