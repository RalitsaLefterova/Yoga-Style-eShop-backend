const express = require('express')
const auth = require('../middleware/auth')
const Order = require('../models/order')
const User = require('../models/user')
const Product = require('../models/product')

const router = new express.Router()

// Create order (User)
router.post('/', auth, async (req, res) => {
  
  let products = req.user.cart
  // TODO: Reconstruct it to fit Order model's requirements.

  const order = new Order({
    // We can use entire user object and mongoose will pick the '_id' from there.
    owner: req.user,
    products: products,
    status: 'Pending',
    delivery_address: req.user.shippingAddress,
    total: req.body.total
  })

  //TODO: Send email to thank the user for the new order

  try {
    await order.save()
    res.status(201).send('order created')
  } catch (error) {
    res.send(error)
  }
})

// Update order (Admin)
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