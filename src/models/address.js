const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  title: {
    type: String
  },
  street: { 
    type: String, 
    // required: 'Street is required' 
  },
  city: { 
    type: String, 
    // required: 'City is required' 
  },
  postalCode: { 
    type: String, 
    // required: 'Postal Code is required' 
  },
  country: { 
    type: String, 
    // required: 'Country is required' 
  }
})

const Address = mongoose.model('Address', addressSchema)
module.exports = Address