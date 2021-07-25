const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const faker = require('faker')
const mongoose = require('mongoose')
const Mutex = require('async-mutex').Mutex

const EventModel = require('./models/EventModel')
const EventMemberModel = require('./models/EventMemberModel')

const PORT = process.env.PORT || 2000
const mutex = new Mutex()

app.use(bodyParser.json())

app.post('/create', async (req, res) => {
  const MAX_JOIN = 20
  const event = await EventModel.create({ maxJoin: MAX_JOIN })

  return res.json({ result: true, event })
})

app.post('/join', async (req, res) => {
  const { eventID } = req.body
  let result = false
  let message

  try {
    const event = await EventModel.findOne({ _id: eventID })
    const isNotFoundEventID = !event

    if (isNotFoundEventID) {
      throw new Error('Not found this event id')
    }

    const name = faker.name.findName()
    const eventMembers = await EventMemberModel.findOne({ eventID: event._id })
    if (!eventMembers) {
      await EventMemberModel.create({ eventID: event._id, members: [name] })
    } else {
      const maxJoin = event.maxJoin
      const cannotJoinThisEvent = eventMembers.members.length >= maxJoin

      if (cannotJoinThisEvent) {
        throw new Error('This event is full, Cannot join this event')
      }

      await EventMemberModel.updateOne({ eventID: event._id }, { $push: { members: name } })
    }

    result = true
    message = 'join sucess!'
  } catch (error) {
    message = error.message
    console.log(`Join Error: ${error.message}`)
  }

  return res.json({ result, message })
})

app.post('/join-fix', async (req, res) => {
  const release = await mutex.acquire()
  const { eventID } = req.body
  let result = false
  let message

  try {
    const event = await EventModel.findOne({ _id: eventID })
    const isNotFoundEventID = !event

    if (isNotFoundEventID) {
      throw new Error('Not found this event id')
    }

    const name = faker.name.findName()
    const eventMembers = await EventMemberModel.findOne({ eventID: event._id })
    if (!eventMembers) {
      await EventMemberModel.create({ eventID: event._id, members: [name] })
    } else {
      const maxJoin = event.maxJoin
      const cannotJoinThisEvent = eventMembers.members.length >= maxJoin

      if (cannotJoinThisEvent) {
        throw new Error('This event is full, Cannot join this event')
      }

      await EventMemberModel.updateOne({ eventID: event._id }, { $push: { members: name } })
    }

    result = true
    message = 'join sucess!'
  } catch (error) {
    message = error.message
    console.log(`Join Error: ${error.message}`)
  } finally {
    release()
  }

  return res.json({ result, message })
})

app.listen(PORT, () => {
  console.log(`Start on port: ${PORT}`)
})

// การ Warning ต่าง ๆ https://mongoosejs.com/docs/deprecations.html
const mongooseConfig = {
  useFindAndModify: false, // ให้ใช้ findOneAndUpdate แล้วไม่แจ้งเตือน
  useNewUrlParser: true,
  useUnifiedTopology: true
}

mongoose.connect(process.env.MONGO_DB_CONNECTION, mongooseConfig)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => { console.log('mongoose connected!') })
