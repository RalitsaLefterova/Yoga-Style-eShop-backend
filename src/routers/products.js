const express = require('express')
const path = require('path')
const multer = require('multer')
const auth = require('../middleware/auth')
const FileHelper = require('../util/files')
const Collection = require('../models/collection')
const Product = require('../models/product')

const router = new express.Router()


// Create product
router.post('/products', auth, async (req, res, next) => {
  console.log(req.body)
  
  const product = new Product({
    ...req.body,
    collection: req.body.collectionId
  })

  await product.save()
  res.send('collection created')
  
}, (error, req, res, next) => {
  console.log('error when create product', error)
  res.status(400).send({ error: error.message })
})

module.exports = router