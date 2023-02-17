const mongoose = require('mongoose')

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity can not be less then 1.']
  },
  selectedColorId: {
    type: mongoose.Schema.Types.ObjectId
  }
}, {
  _id : false
}, {
  timestamps: true
})

cartItemSchema.virtual('products', {
  ref: 'Product',
  localField: 'productId',
  foreignField: 'id'
})

module.exports.cartItemSchema = cartItemSchema