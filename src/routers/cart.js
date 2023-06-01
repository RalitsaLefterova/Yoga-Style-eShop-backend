const express = require('express')

const auth = require('../middleware/auth')
const Product = require('../models/product')
const Collection = require('../models/collection')

const router = new express.Router()

// Add product to cart / Increase quantity
router.patch('/add/:productId', auth, async (req, res) => {
  const productId = req.params.productId
  // console.log('req.body', req.body)
  try {
    const existingProduct = req.user.cart.find(product => product.productId.equals(productId))
    const productInfo = await Product.findById(productId, 'title price mainImageUrl collectionId').exec()
    const collectionTitle = await Collection.findById(productInfo.collectionId, 'title').exec()

    productInfo.collectionTitle = collectionTitle
    delete productInfo.collectionId

    existingProduct ? existingProduct.quantity += 1 : req.user.cart.push({ productId: productId, quantity: 1})

    await req.user.save()
    // console.log('productInfo', productInfo)
    res.send(productInfo)
  } catch(error) {
    console.log('error', error, {error})
    res.send(error)
  }
})

// Remove product from cart / Decrease quantity
router.patch('/remove/:productId', auth, async (req, res) => {
  const productId = req.params.productId

  try {
    const existingProduct = req.user.cart.find(product => product.productId.equals(productId))
    const productIndex = req.user.cart.indexOf(existingProduct)

    if (existingProduct && existingProduct.quantity === 1) {
      req.user.cart.splice(productIndex, 1)
    } else {
      existingProduct.quantity -= 1
    }

    await req.user.save()
    res.send('Successfully decrease quantity of the product.')
  } catch(error) {
    res.send(error)
  }
})

// Clear product from cart
router.patch('/clear/:productId', auth, async (req, res) => {
  const productId = req.params.productId
  
  try {
    let updatedCartItems = req.user.cart.filter(product => !product.productId.equals(productId))
    req.user.cart = updatedCartItems

    await req.user.save()
    res.send('Successfully remove product from cart.')    
  } catch(error) {
    res.send(error)
  }
})

// Get cart
router.get('/', auth, async (req, res) => {
  console.log('Get cart - req', req)
  res.send('get')
})

// Empty cart
router.post('/empty', auth, async (req, res) => {
  console.log('Empty cart - req', req)
  res.send('The cart is empty.')
})

module.exports = router