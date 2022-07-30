const express = require('express')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/', auth, async (req, res) => {
  try {
    console.log({stripe})

    const amount = req.body.amount
    // const currency = req.user.currency
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      payment_method_types: ['card']
    })

    res.send(paymentIntent)
  } catch (error) {
    res.status(400).send(error)
  }
})

module.exports = router