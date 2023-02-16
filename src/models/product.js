const mongoose = require('mongoose')

const ProductColor = require('./product-color')

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please Include the product title']
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: [true, 'Please Include the product price']
  },
  mainImageUrl: {
    type: String,
    required: true
  },
  colors: [ProductColor.schema],
  stock: {
    type: Number,
    required: false,
    default: 0
  },
  active: {
    type: Boolean,
    default: false
  },
  collectionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Collection'
  },
}, {
  timestamps: true
}, { 
  versionKey: false 
})

productSchema.virtual('id').get(function() { 
  return this._id
})

productSchema.set('toJSON', {
  virtual: true,
  transform: function (doc, returnedObject, options) {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
  },
  versionKey: false
})

productSchema.set('toObject', {
  virtual: true,
  transform: function (doc, returnedObject, options) {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
  },
  versionKey: false
})

const Product = mongoose.model('Product', productSchema)

module.exports = Product