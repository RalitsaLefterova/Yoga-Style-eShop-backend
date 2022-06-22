const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')

const router = new express.Router()

// Add product to cart
router.patch('/add/:productId', auth, async (req, res) => {
  const existingProduct = req.user.cart.find(product => product.productId == req.params.productId)
  // console.log('existingProduct:', existingProduct)

  if (existingProduct) {
    existingProduct.quantity += 1
    // console.log('req.user.cart', req.user.cart)
  } else {
    req.user.cart.push({ productId: req.params.productId, quantity: 1})
  }
  await req.user.save()
  res.send(req.user)
})

// Remove product from cart
router.patch('/remove/:productId', auth, async (req, res) => {
  console.log('Remove product from cart - req', req)
  res.send('remove')
})

// Get cart
router.get('/', auth, async (req, res) => {
  console.log('Get cart - req', req)
  res.send('get')
})

// Clear cart
router.post('/clear', auth, async (req, res) => {
  console.log('Clear cart - req', req)
  res.send('clear')
})


module.exports = router