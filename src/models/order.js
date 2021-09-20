const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  products: {
    type: Array
  },
  status: { 
    // ??? In progress / Finnished ???
    type: String
  },
  total: {
    type: Decimal128
  },

}, {
  timestamps: true
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order