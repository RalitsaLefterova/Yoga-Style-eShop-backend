const express = require('express')
const path = require('path')
const cors = require('cors')
require('./db/mongoose')

const authRouter = require('./routers/auth')
const userRouter = require('./routers/user')
const collectionRouter = require('./routers/collection')
const productRouter = require('./routers/product')
const cartRouter = require('./routers/cart')
const orderRouter = require('./routers/order')
const addressRouter = require('./routers/address')
const paymentsRouter = require('./routers/payments')

const app = express()

// app.set('publicDirectory', `${__dirname}/../public`)
// app.use(express.static(__dirname))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use(express.json())
app.use(cors({
  // "origin": "*",
  origin: [process.env.FRONTEND_URL],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
  origin: true
  // "preflightContinue": false,
  // "optionsSuccessStatus": 204
  // optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}))

app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/collections', collectionRouter)
app.use('/products', productRouter)
app.use('/cart', cartRouter)
app.use('/orders', orderRouter)
app.use('/address', addressRouter)
app.use('/payment', paymentsRouter)

app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    error: 'Not found!',
    msg: "The page you're looking for doesn't exist.",
  });
});

module.exports = app