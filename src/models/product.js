const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  collectionId: {
    type: Number,
    required: true
  },
  images: [{
    image: Buffer,
    color: String,
    size: String
  }],
  active: {
    type: Boolean,
    default: true
  },
  // collection: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   required: true,
  //   ref: 'Collection'
  // }
}, {
  timestamps: true
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product