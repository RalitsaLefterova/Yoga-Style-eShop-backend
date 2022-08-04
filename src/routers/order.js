const express = require('express')
const auth = require('../middleware/auth')
const Order = require('../models/order')
const User = require('../models/user')
const Product = require('../models/product')
const Address = require('../models/address')
const { isValidObjectId } = require('mongoose')

const router = new express.Router()

// Create order (User)
router.post('/', auth, async (req, res) => {
  let cartProducts = req.user.cart

  try {
    const products = await Promise.all(cartProducts.map(async (product) => {
      return {
        product: (await Product.find({ _id : product.productId}, 'title mainImageUrl price'))[0],
        quantity: product.quantity
      }
    }))

    const address = await req.user.addresses.id(req.user.shippingAddress)

    const delivery_address = {
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country
    }
    
    const order = new Order({
      owner: req.user._id,
      products,
      status: 'Pending',
      delivery_address,
      total: req.body.total
    })
    await order.save()
    
    req.user.cart = []
    await req.user.save()

    //TODO: Send email to thank the user for the new order
    res.status(201).send('Order created')
  } catch (error) {
    res.send(error)
  }
})

// Update order 
// (Responsible person: Admin or member of the staff of the company.)
router.patch('/:id', auth, async (req, res) => {

  //TODO: Change order's status ( 'In progress'/ 'Dispatched for delivery' / 'Finnished' / 'Canceled' )
  
  //TODO: Send email to the user with updated status
  // 'In progress' message: 'preparing your order'
  // 'Dispatched for delivery' message: 'the sender has packed and handed over the order to the delivery agent / company'
  // 'Finnished' message: ''

})



// Get all orders
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/', auth, async (req, res) => {
  const match = {}
  const sort = {}

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    const orders = await Order.find({ owner: req.user._id })
    res.send(orders)

    // Variant with populate
    // await req.user.populate({
    //   path: 'orders',
    //   match,
    //   options: {
    //     limit: parseInt(req.query.limit),
    //     skip: parseInt(req.query.skip),
    //     sort
    //   }
    // })
    // res.send(req.user.orders)

    
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = router