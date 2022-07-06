const express = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')

const router = new express.Router()

// Add product to cart / Increase quantity
router.patch('/add/:productId', auth, async (req, res) => {
  const productId = req.params.productId

  try {
    const existingProduct = req.user.cart.find(product => product.productId.equals(productId))

    if (existingProduct) {
      existingProduct.quantity += 1
    } else {
      req.user.cart.push({ productId: productId, quantity: 1})
    }

    await req.user.save()
    res.send(req.user)
  } catch(error) {
    res.send(error)
  }
})

// Remove product from cart / Decrease quantity
router.patch('/remove/:productId', auth, async (req, res) => {
  console.log('Remove product from cart - req', req.params.productId)
  console.log('cart', req.user.cart)

  const productId = req.params.productId

  try {
    const existingProduct = req.user.cart.find(product => product.productId.equals(productId))
    const productIndex = req.user.cart.indexOf(existingProduct)

    console.log('existingProduct', existingProduct)
    console.log('productIndex', productIndex)

    if (existingProduct && existingProduct.quantity === 1) {
      req.user.cart.splice(productIndex, 1)
    } else {
      existingProduct.quantity -= 1
    }

    await req.user.save()

    //TODO: decide whether to send all updated cart info or only a success message 

    res.send(req.user)

  } catch(error) {
    res.send(error)
  }
})

// Clear product from cart
router.patch('/clear/:productId', auth, async (req, res) => {
  console.log('Clear product from cart - req', req.params.productId)

  const productId = req.params.productId

  console.log('req.user.cart', req.user.cart)
  
  try {
    let updatedCartItems = req.user.cart.filter(product => !product.productId.equals(productId))
    req.user.cart = updatedCartItems

    console.log('updatedCartItems', updatedCartItems)
    console.log('req.user.cart', req.user.cart)

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