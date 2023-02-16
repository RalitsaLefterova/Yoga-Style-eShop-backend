const mongoose = require('mongoose')

const productColorSchema = new mongoose.Schema({
  color: {
    type: String
  },
  images: [{
    type: String
  }],
  sizes: [{
    size: {
      type: String
    },
    stock: {
      type: Number,
      required: false,
      default: 0
    }
  }]
})

const ProductColor = mongoose.model('ProductColor', productColorSchema)
module.exports = ProductColor