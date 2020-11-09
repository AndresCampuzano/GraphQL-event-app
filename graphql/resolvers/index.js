const bcrypt = require('bcryptjs')

// Models
const EventModel = require('../../models/event')
const UserModel = require('../../models/user')

module.exports = {
  events: async () => {
    return await EventModel.find().catch(err => {
      throw err
    })
  },
  createEvent: async args => {
    const event = new EventModel({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: '5fa8af8e4e1fbe5a7850e82a'
    })
    try {
      await event.save()
      // relation
      const user = await UserModel.findById('5fa8af8e4e1fbe5a7850e82a')
      // if (!user) {
      //   throw new Error('User not found.')
      // }
      user.createdEvents.push(event)
      await user.save()
      return event
    } catch (err) {
      throw err
    }
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
      try {
        await user.save()
        return user
      } catch (err) {
        throw err
      }
    }
  }
}
