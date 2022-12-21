const jwt = require('jsonwebtoken')
const User = require('../models/user')

const authAdmin = async (req, res, next) => {
  try {
    // console.log('in auth admin')
    const token = req.header('Authorization').replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

    if (!user) {
      throw new Error('Please authenticate.')
    }

    if (user.role !== 'ADMIN') {
      throw new Error('This operation requires ADMIN rights.')
    }

    req.token = token
    req.user = user
    next()
    
  } catch (error) {
    console.log('in authentication error', {error}, 'error.message', error.message)
    res.status(401).send(error.message)
  }
}

module.exports = authAdmin