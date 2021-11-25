const mongoose = require('mongoose')

const collectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  cover: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  }
})

const Collection = mongoose.model('Collection', collectionSchema)

module.exports = Collection