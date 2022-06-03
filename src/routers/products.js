const express = require('express')
const path = require('path')
const multer = require('multer')
const auth = require('../middleware/auth')
const FileHelper = require('../util/files')
const Collection = require('../models/collection')
const Product = require('../models/product')

const router = new express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now()
    // Note: Multer does not add extensions to file names, and it’s recommended to return a filename complete with a file extension.
    cb(null, 'product-' + req.body.title.replace(/\s+/g, '-').toLowerCase() + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const uploadProduct = multer({
  storage,
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload jpg, jpeg or png.'))
    }
    cb(undefined, true)
  }
})

// Create product
router.post('/', auth, uploadProduct.single('mainImageUrl'), async (req, res, next) => {
  const mainImageUrl = FileHelper.createFilePath(req.file.path)

  const product = new Product({
    ...req.body,
    mainImageUrl
  })

  await product.save()
  res.send('product created')
  
}, (error, req, res, next) => {
  console.log('error when create product', error)
  res.status(400).send({ error: error.message })
})

// Get all products
// GET /products?collectionTitle=meditation%20and%20relaxasion
// GET /products?active=true
// GET /products?limit=10&skip20
// GET /products?sortBy=createdAt:desc
router.get('/', async (req, res) => {
  const match = {}
  const sort = {}
  let searchOptions = {}

  if (req.query.collectionTitle) {
    const collection = await Collection.find({ title: req.query.collectionTitle })

    if (!collection) {
      return res.status(404).send('collection not found')
    }

    searchOptions = { collectionId: collection[0]._id } 
  }

  // if (req.query.active) {
  //   match.active = req.query.active === 'true'
  // }

  // if (req.query.sortBy) {
  //   const parts = req.query.sortBy(split(':'))
  //   sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  // }

  try {
    const products = await Product.find(searchOptions)
    res.send(products)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Edit product (Admin)
router.patch('/:id', auth, uploadProduct.single('mainImageUrl'), async (req, res) => {
  console.log('in Edit product req.body', req.body)
  console.log('in Edit product req.file', req.file)

  if (req.file) { 
    req.body.mainImageUrl = FileHelper.createFilePath(req.file.path)
  }

  const updates = Object.keys(req.body)
  const allowedUpdates = ['title', 'description', 'price', 'stock', 'active', 'mainImageUrl', 'collectionId']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid operation!'})
  }

  try {
    const product = await Product.findOne({ _id: req.params.id})
    if (!product) {
      return res.status(404).send()
    }
    console.log('req.body', req.body)
    console.log('product ====>', product)

    if (req.file) {
      FileHelper.deleteFile(product.mainImageUrl)
    }

    updates.forEach((update) => product[update] = req.body[update])

    await product.save()
    res.send(product)

  } catch (e) {
    res.status(500).send(e)
  }
})

// Get product by id
router.get('/:id', async (req, res) => {
  console.log('get product by id', req.params.id)
  console.log('req.file', req.file)
  const _id = req.params.id
  console.log('_id', _id)

  try {
    const product = await Product.findById(_id)
    console.log('product res', product)
    if (!product) {
      return res.status(404).send()
    }
    res.send(product)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id })
    if (!product) {
      return res.status(404).send()
    }
    res.send(product)
    // res.send('Product ssuccesfuly deleted!')
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router