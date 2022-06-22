const express = require('express')
const path = require('path')
const cors = require('cors')
require('./db/mongoose')

const authRouter = require('./routers/auth')
const userRouter = require('./routers/user')
const collectionRouter = require('./routers/collection')
const productRouter = require('./routers/product')
const cartRouter = require('./routers/cart')

const app = express()

// app.set('publicDirectory', `${__dirname}/../public`)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.use(express.json())
app.use(cors())

app.use('/auth', authRouter)
app.use('/users', userRouter)
app.use('/collections', collectionRouter)
app.use('/products', productRouter)
app.use('/cart', cartRouter)

app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    error: 'Not found!',
    msg: "The page you're looking for doesn't exist.",
  });
});

module.exports = app