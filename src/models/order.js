const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  products: [{
    _id: false,
    product: { 
      // We need more than id for the product, because we need history for the orders
      // in case the product will be deleted in the future
      type: Object
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  status: { 
    // ??? In progress / Finnished / Canceled / Pending ???
    type: String,
    reuired: true
  },
  total: {
    type: Number,
    required: true
  },
  payment_id: {},
  delivery_address: {
    street: String,
    city: String,
    postalCode: String,
    country: String
  }
}, {
  timestamps: true
})

orderSchema.virtual('owners', {
  ref: 'User',
  localField: 'owner',
  foreignField: '_id'
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order