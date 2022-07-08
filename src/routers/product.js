const express = require('express')
const path = require('path')
const multer = require('multer')

const auth = require('../middleware/auth')
const FileHelper = require('../utils/files')
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
  const sort = {}
  let searchOptions = {}
  
  try {

    if (req.query.collectionTitle) {
      const collection = await Collection.find({ title: req.query.collectionTitle })
      
      if (!collection) {
        return res.status(404).send('collection not found')
      }

      searchOptions = { collectionId: collection[0]._id } 
    }

    if (req.query.active) {
      searchOptions.active = req.query.active
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy(split(':'))
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    const products = await Product.find(searchOptions, 'title price stock mainImageUrl collectionId active')

    res.send(products)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Edit product (Admin)
router.patch('/:id', auth, uploadProduct.single('mainImageUrl'), async (req, res) => {
  
  req.file && (req.body.mainImageUrl = FileHelper.createFilePath(req.file.path))

  const updates = Object.keys(req.body)
  const allowedUpdates = ['title', 'description', 'price', 'stock', 'active', 'mainImageUrl', 'collectionId']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid operation!'})
  }
  
  try {
    const product = await Product.findOne({ _id: req.params.id})

    !product && res.status(404).send()

    req.file && FileHelper.deleteFile(product.mainImageUrl)
    
    updates.forEach((update) => product[update] = req.body[update])

    await product.save()

    // Always return product info instead of success message 
    // because the response is used also to update a record in admin product table
    res.send(product)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Get product by id
router.get('/:id', async (req, res) => {
  const isEdit = req.query.edit
  let responseObj = {}

  try {
    const product = await Product.findById(
      req.params.id, 
      'active collectionId description mainImageUrl price stock title'
    )

    !product && res.status(404).send()

    if (isEdit) {
      const collections = await Collection.find({}, 'title')
      responseObj = { product, collections }
    } else {
      responseObj = product
    }

    res.send(responseObj)
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
    // res.send(product)
    res.send('Product ssuccesfuly deleted!')
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router