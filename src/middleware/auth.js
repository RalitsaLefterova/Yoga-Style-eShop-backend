const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
  // console.log('req.body, res', req.body, res)
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    // console.log({token})
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // console.log({decoded})
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
    // console.log({user})
    if (!user) {
      throw new Error()
    }
    
    req.token = token
    req.user = user
    next()
  
  } catch (error) {
    console.log('Please authenticate.', {error})
    return res.status(401).send('Please authenticate.')
  }
} 

module.exports = auth