const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Order = require('./order')
const Address = require('./address')
const { cartItemSchema } = require('./cart-item')

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
  addresses: [Address.schema],
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    default: null
  },
  billingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    default: null
  },
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
  cart: [cartItemSchema],
  resetLink: {
    data: String,
    default: ''
  }
}, {
  timestamps: true
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

  const errorMessage = 'Invalid Credentials'
    
  const user = await User.findOne({ email })
  if (!user) throw new Error(errorMessage)

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new Error(errorMessage)

  return user
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