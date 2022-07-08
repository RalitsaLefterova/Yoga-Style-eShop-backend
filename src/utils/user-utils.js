const User = require('../models/user')

exports.getUserShortInfo = (userId) => {
  return User.findById(userId, 'fullName birthday language currency')
}