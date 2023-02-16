const express = require('express')
const path = require('path')
const fs = require('fs')
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
// app.use(express.urlencoded({extended: true}))

app.use(cors({
  "origin": ["https://yoga-style-eshop.netlify.app", "http://localhost:3000"],
  "methods": "GET,HEAD,PUT,POST,PATCH,DELETE",
  "allowedHeaders": ['Content-Type', 'Authorization'],
  "credentials": true,
  "preflightContinue": true
}))

app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/collections', collectionRouter)
app.use('/products', productRouter)
app.use('/cart', cartRouter)
app.use('/orders', orderRouter)
app.use('/address', addressRouter)
app.use('/payment', paymentsRouter)

app.use('/', (req, res) => {
  res.send('Hello World!')
})

app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    error: 'Not found!',
    msg: "The page you're looking for doesn't exist.",
  });
});

module.exports = app