const User = require('../models/user')

exports.getUserShortInfo = userId => {
  return User.findById(userId, 'fullName birthday language currency role')
}

exports.getUserProfileInfo = userId => {
  return User.findById(userId, 'fullName email role phone birthday language currency addresses shippingAddress billingAddress')
}