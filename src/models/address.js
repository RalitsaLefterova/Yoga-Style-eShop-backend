const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  defaultAddress: {
    type: Boolean,
    default: false
  },
  street: String,
  city: String,
  postalCode: String,
  country: String
},
{ timestamps: true }
)

const Address = mongoose.model('Address', addressSchema)

module.exports = Address