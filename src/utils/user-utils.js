const User = require('../models/user')

exports.getUserShortInfo = userId => {
  return User.findById(userId, 'fullName birthday language currency')
}

exports.getUserProfileInfo = userId => {
  return User.findById(userId, 'fullName email phone birthday language currency addresses shippingAddress billingAddress')
}