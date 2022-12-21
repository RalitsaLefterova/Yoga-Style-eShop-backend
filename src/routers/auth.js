const express = require('express')

const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID)

const auth = require('../middleware/auth')
const User = require('../models/user')
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../emails/accounts')
const { getUserShortInfo } = require('../utils/user-utils')

const router = new express.Router()

// Sign-up
router.post('/sign-up', async (req, res) => {
  const user = new User(req.body)
  
  try {
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (error) {
    let errorMessage = error
    if (error.name == 'MongoServerError' && error.code === 11000) {
      errorMessage = 'User with this email already exists'
    }
    if (error.name == 'ValidationError') {
      // TODO Maybe remove this. Validations will be in the frontend.
    }
    res.status(400).send(error.message)
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const userShortInfo = await getUserShortInfo(user._id)
    const token = await user.generateAuthToken()
    const cart = await user.getCartDetails()
    
    res.send({ user: userShortInfo, token, cart })
  } catch (error) {
    // console.log('error after search for user', email, error, error.message)
    res.status(400).send(error.message)
  }
})

// Login with Google
router.post('/googlelogin', async (req, res) => {
  const { tokenId } = req.body
  let email_verified = false,
      email = '',
      fullName = ''
  
  // We need to varify the token we send from the client side 
  // and the token we are using in the backend are the same or not
  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId, 
      audience: process.env.CLIENT_ID 
    })
    const payload = ticket.getPayload()

    email_verified = payload.email_verified
    fullName = payload.name
    email = payload.email
    
    if (!email_verified) {
      // throw new AuthEmailNotVerified;
      throw new Error('AuthEmailNotVerified')
    }

   } catch (error) {
    res.status(403).send('Invalid credentials');
   }

  const user = await User.findOne({email})

  if (!user) {
    // User does not exist in DB and trying to login for the first time
    // Create a new user
    const password = email + process.env.GOOGLE_SIGN_IN_KEY
    const user = new User({ fullName, email, password })

    try {
      await user.save()
      sendWelcomeEmail(user.email, user.fullName)
      const token = await user.generateAuthToken()
      const userShortInfo = await getUserShortInfo(user._id)
      const cart = []

      res.status(201).send({ user: userShortInfo, token, cart })
    } catch (error) {
      res.status(400).send(error)
    }
    return
  } 

  // User exist in DB
  try {
    const token = await user.generateAuthToken()
    const userShortInfo = await getUserShortInfo(user._id)
    const cart = await user.getCartDetails()
    
    res.send({ user: userShortInfo, token, cart })
  } catch (error) {
    res.status(400).send(error)
  }

})


// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()
    res.send('Success log out!')
  } catch (e) {
    res.status(500).send(e)
  }
})

// Logout All
router.post('/logoutall', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send(e)
  }
})

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email })

    if (!user) return res.status(400).send("User with given email doesn't exist.")

    user.tokens = []
    
    const isResetToken = true
    const resetToken = await user.generateAuthToken(isResetToken)

    const link = `${process.env.FRONTEND_URL}/reset-password?user=${user._id}&token=${resetToken}`

    sendPasswordResetEmail(user.email, user.fullName, link)

    res.send("Password reset link has been sent to your email account.")

  } catch (error) {
    res.send("An error occured")
    console.log(error)
  }
})

// Reset forgoten password
router.post('/reset-password/:userId/:resetToken', async (req, res) => {
  console.log('req.params', req.params, 'req.body', req.body)
  try {
    const user = await User.findById(req.params.userId)

    if (!user) return res.status(400).send("invalid link or expired")

    console.log('user.resetToken', user.resetToken,'req.params.token', req.params.resetToken)
    const existingToken = user.resetToken === req.params.resetToken
    if (!existingToken) return res.status(400).send("Invalid link or expired")
    console.log({existingToken})

    user.password = req.body.password
    user.resetToken = ''

    await user.save()
    res.send("Password reset sucessfully.")

  } catch (error) {
    res.send(error.message);
    console.log(error, error.message)
  }
})

// Change password



module.exports = router