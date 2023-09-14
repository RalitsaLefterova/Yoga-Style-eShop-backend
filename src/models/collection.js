const mongoose = require('mongoose')
const slugify = require('slugify')

const collectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  urlTitle: {
    type: String
  },
  cover: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  },
  position: {
    type: Number,
    required: true
  },
  collectionTeaser: {
    type: String
  }
})

collectionSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'collection'
})

// Pre-save hook to calculate the URL title based on the collection title
collectionSchema.pre('validate', function (next) {
  if (!this.isModified('title')) {
    // If the title hasn't changed, no need to recalculate the URL title
    return next()
  }

  // Generate a URL-friendly version of the title with the 'slugify' package 
  this.urlTitle = slugify(this.title, { lower: true })

  next()
})

const Collection = mongoose.model('Collection', collectionSchema)

module.exports = Collection