const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventSchema = new Schema({
  maxJoin: { type: Number }
})

const EventModel = mongoose.model('event', EventSchema)

module.exports = EventModel
