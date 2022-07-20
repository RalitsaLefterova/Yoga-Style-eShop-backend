const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Order = require('./order')

const itemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity can not be less then 1.']
  }
}, {
  _id : false
}, {
  timestamps: true
})

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid!')
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 7,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password"!')
      }
    }
  },
  addresses: [{
    isShippingAddress: Boolean,
    isBillingAddress: Boolean,
    street: String,
    city: String,
    postalCode: String,
    country: String
  }],
  // shippingAddress: {
  //   street: {type: String, required: 'Street is required'},
  //   city: {type: String, required: 'City is required'},
  //   zipcode: {type: String, required: 'Zip Code is required'},
  //   country: {type: String, required: 'Country is required'}
  // },
  // billingAddress: {
  //   street: {type: String, required: 'Street is required'},
  //   city: {type: String, required: 'City is required'},
  //   zipcode: {type: String, required: 'Zip Code is required'},
  //   country: {type: String, required: 'Country is required'}
  // },
  birthday: {
    type: Date
  },
  phone: {
    type: String
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    type: Buffer
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  language: {
    type: String,
    default: 'EN'
  },
  cart: [itemSchema],
  resetLink: {
    data: String,
    default: ''
  }
}, {
  timestamps: true
})

itemSchema.virtual('products', {
  ref: 'Product',
  localField: 'productId',
  foreignField: 'id'
})

userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar

  return userObject
}

userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET, { expiresIn: '8h' })
  
  user.tokens = user.tokens.concat({ token })
  await user.save()
  
  return token
}

userSchema.statics.findByCredentials = async (email, password) => {

  try {
    const user = await User.findOne({ email })
    const errorMessage = 'Invalid Credentials'

    if (!user) throw new Error(errorMessage)

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) throw new Error(errorMessage)

    return user
    
  } catch(error) {
    console.log({error})
  }
}

userSchema.methods.getCartDetails = async function() {
  let cart = []
  
  try {
    const resultOfPopulation = await this.populate({
      path: 'cart.productId',
      select: 'title price mainImageUrl collectionId'
    })

    let populatedCart = resultOfPopulation.cart.toObject()

    console.log({populatedCart})

    if (populatedCart.length > 0) {
      cart = populatedCart.map(item => {
        console.log({item})
        return { ...item.productId, quantity: item.quantity }
      })
    }    
  }
  catch (error) {
    throw new Error(error)
  }
  
  return cart
}

// Hash the plane text password before saving
userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User