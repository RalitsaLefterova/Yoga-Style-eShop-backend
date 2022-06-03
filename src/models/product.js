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
  stock: {
    type: Number,
    required: false,
    default: 0
  },
  mainImageUrl: {
    type: String,
    required: true
  },
  images: [{
    imageUrl: String,
    color: String,
    size: String
  }],
  active: {
    type: Boolean,
    default: false
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Collection'
  }
}, {
  timestamps: true
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product