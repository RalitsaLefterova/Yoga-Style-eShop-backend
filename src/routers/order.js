const express = require('express')
const auth = require('../middleware/auth')
const Order = require('../models/order')
const User = require('../models/user')
const Product = require('../models/product')
const Address = require('../models/address')
const Collection = require('../models/collection')
// const { isValidObjectId, Collection } = require('mongoose')

const router = new express.Router()

// CREATE AN ORDER (User)
router.post('/', auth, async (req, res) => {
  let cartProducts = req.user.cart

  try {
    const products = await Promise.all(cartProducts.map(async (cartProduct) => {
      
      const product = await Product.findById(cartProduct.productId, 'id title mainImageUrl price collectionId')
      // .populate({
      //   path: 'collectionId',
      //   select: '_id title'
      // })
      
      //TODO: Fetch/populate id and title for collection. 

      return { 
        product, 
        quantity: cartProduct.quantity 
      }
      
    }))
    console.log('products', products)

    const orderProducts = products.map(orderProduct => {
      // Convert the product object to a plain JavaScript object
      const plainProduct = orderProduct.product.toObject();
      // console.log({plainProduct})
      // Rename the '_id' field to 'id'
      // plainProduct.id = plainProduct._id.toString();
      // delete plainProduct._id;
    
      // Return the modified plainProduct object
      return {
        product: plainProduct,
        quantity: orderProduct.quantity
      };
    });

    const address = await req.user.addresses.id(req.user.shippingAddress)
    // console.log(address)
    const delivery_address = {
      street: address.street,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country
    }
    
    const order = new Order({
      owner: req.user._id,
      products: orderProducts,
      status: 'Pending',
      delivery_address,
      total: req.body.total
    })
    // console.log(order)
    console.log(order.products)
    await order.save()
    
    req.user.cart = []
    await req.user.save()

    //TODO: Send email to thank the user for the new order and that the order's status will be visible in the user profile page.
    res.status(201).send('Order created')
  } catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
})

// Update order 
// (Responsible person: Admin or member of the staff of the company.)
router.patch('/:id', auth, async (req, res) => {
  console.log('req.body', req.body)
  //TODO: Change order's status ( 'In progress'/ 'Dispatched for delivery' / 'Finnished' / 'Canceled' )
  
  //TODO: Send email to the user with updated status
  // 'In progress' message: 'preparing your order'
  // 'Dispatched for delivery' message: 'the sender has packed and handed over the order to the delivery agent / company'
  // 'Finnished' message: ''

})



// GET ALL ORDERS (Admin)
// GET /orders?completed=true
// GET /orders?limit=10&skip=20
// GET /orders?sortBy=createdAt:desc
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
    console.log('before')
    const orders = await Order.find({}, 'status createdAt owner').populate({
      path: 'owner',
      select: '_id fullName'
    })

    console.log('after', {orders})
    res.send(orders)

    // Variant with populate for one user (Remove from here!)
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

// Get order details
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate({
      path: 'owner',
      select: 'fullName'
    })
    console.log({order})
    res.send(order)
  } catch (error) {
    res.send(error)
  }
})

module.exports = router