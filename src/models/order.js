const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  products: [{
    _id: false,
    productId: String,
    quantity: Number
  }],
  status: { 
    // ??? In progress / Finnished / Canceled / Pending ???
    type: String
  },
  total: {
    type: Number
  },
  payment_id: {},
  delivery_address: {
    street: {type: String, required: 'Street is required'},
    city: {type: String, required: 'City is required'},
    state: {type: String},
    zipcode: {type: String, required: 'Zip Code is required'},
    country: {type: String, required: 'Country is required'}
  }
}, {
  timestamps: true
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order