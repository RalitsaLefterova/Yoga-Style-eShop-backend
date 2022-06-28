const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')

const router = new express.Router()

// Add product to cart
router.patch('/add/:productId', auth, async (req, res) => {

  try {
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
  } catch(error) {
    res.send(error)
  }
  
})

// Remove product from cart
router.patch('/remove/:productId', auth, async (req, res) => {
  console.log('Remove product from cart - req', req.params.productId)
  console.log('cart', req.user.cart)

  const productId = req.params.productId

  try {
    const product = req.user.cart.find(product => product.productId === productId)

    const productIndex = req.user.cart.indexOf(product)

    console.log('product', product)
    console.log('productIndex', productIndex)

    if (product && product.quantity === 1) {
      req.user.cart.splice(productIndex, 1)
    } else {
      product.quantity -= 1
    }

    await req.user.save()
    res.send(req.user)

  } catch(error) {
    res.send(error)
  }
})

// Clear product from cart
router.patch('/clear/:productId', auth, async (req, res) => {
  console.log('Clear product from cart - req', req.params.productId)
  console.log('cart', req.user.cart)

  const productId = req.params.productId

  try {
    const product = req.user.cart.find(product => product.productId === productId)

    const productIndex = req.user.cart.indexOf(product)
    req.user.cart.splice(productIndex, 1)

    await req.user.save()
    res.send(req.user)    

  } catch(error) {
    res.send(error)
  }
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