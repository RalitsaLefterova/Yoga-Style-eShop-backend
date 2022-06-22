const express = require('express')
const auth = require('../middleware/auth')
const { OAuth2Client } = require('google-auth-library')
const User = require('../models/user')
const { sendWelcomeEmail } = require('../emails/accounts')
const router = new express.Router()

const client = new OAuth2Client(process.env.CLIENT_ID)

// Sign-up
router.post('/sign-up', async (req, res) => {
  // console.log('in sign up')
  const user = new User(req.body)
  
  try {
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token })
  } catch (error) {
    console.log(error.name)
    let errorMessage = error
    if (error.name == 'MongoServerError' && error.code === 11000) {
      errorMessage = 'User with this email already exists'
    }
    if (error.name == 'ValidationError') {
      // TODO Maybe remove this. Validations will be in the frontend.
    }
    res.status(400).send(errorMessage)
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    // console.log(user)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (error) {
    res.status(400).send(error.message)
  }
})

// Login with Google
router.post('/googlelogin', async (req, res) => {
  const { tokenId } = req.body
  let email_verified = false
  let email = ''
  let name = ''
  
  // We need to varify the token we send from the client side 
  // and the token we are using in the backend are the same or not
  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId, 
      audience: process.env.CLIENT_ID 
    })
    const payload = ticket.getPayload()

    email_verified = payload.email_verified
    name = payload.name
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
    const user = new User({ name, email, password })

    try {
      await user.save()
      sendWelcomeEmail(user.email, user.name)
      const token = await user.generateAuthToken()
      res.status(201).send({ user, token })
    } catch (e) {
      res.status(400).send(e)
      
    }
    return
  } 

  // User exist in DB
  try {
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    console.log({e})
    res.status(400).send(e)
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

// Reset password



module.exports = router