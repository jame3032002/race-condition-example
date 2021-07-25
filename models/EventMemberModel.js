const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EventMemberSchema = new Schema({
  eventID: { type: Schema.ObjectId },
  members: { type: [String] }
})

const EventModel = mongoose.model('eventMember', EventMemberSchema)

module.exports = EventModel
