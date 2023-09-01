const express = require('express') 

const authAdmin = require('../middleware/auth-admin')
const { uploadProductImage, uploadMultipleImages } = require('../middleware/multer-config')
const FileHelper = require('../utils/files')
const Product = require('../models/product')
const Collection = require('../models/collection')

const router = new express.Router()

// Create product
router.post('/', authAdmin, uploadProductImage.single('mainImageUrl'), async (req, res) => {
  try {
    const product = new Product({
      ...req.body,
      mainImageUrl: req.file ? `uploads/products/${req.file.filename}` : ''
    })
    await product.save()
    res.send('product created')
  } catch (error) {
    res.status(400).send({
      message: error.message || "An unknown error occurred",
      details: error.errors || {}
    })
  }
})

// GET ALL PRODUCTS
// GET /products?collectionTitle=meditation%20and%20relaxasion
// GET /products?active=true
// GET /products?limit=10&skip20
// GET /products?sortBy=createdAt:desc
router.get('/', async (req, res) => {
  const sort = {}
    searchOptions = {}
  
  try {
    // console.log('req.query', req.query)
    if (req.query.collectionTitle) {
      const collection = await Collection.find({ title: req.query.collectionTitle.toLowerCase() })
      // console.log('collection', collection, req.query.collectionTitle.toLowerCase())
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
    // console.log('searchOptions', searchOptions)
    const products = await Product.find(searchOptions, 'title price stock mainImageUrl collectionId active')
    // console.log('get all products', products)

    res.send(products)
  } catch (e) {
    res.status(500).send(e)
  }
})

// EDIT PRODUCT
router.patch('/:id', authAdmin, uploadProductImage.single('mainImageUrl'), async (req, res) => {
  console.log('Edit product (Admin)', 'req.body', req.body)
  console.log('------------ req.file ---------', req.file)
  req.file && (req.body.mainImageUrl = `uploads/products/${req.file.filename}`)

  const updates = Object.keys(req.body)
  const allowedUpdates = ['title', 'description', 'price', 'stock', 'active', 'mainImageUrl', 'collectionId']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ message: 'Invalid operation!'})
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
  } catch (error) {
    res.status(400).send({
      message: error.message || "An unknown error occurred",
      details: error.errors || {}
    })
  }
})

// ADD COLOR TO PRODUCT
router.post('/:productId/colors', authAdmin, async (req, res) => {
  
  try {
    const product = await Product.findOne({ _id: req.params.productId})
    const doesColorExist = product.colors.find(color => {
      return color.color == req.body.color
    })

    if (doesColorExist) {
      const error = new Error('Color already exists.')
      error.code = '422'
      throw error
    }

    let colorObj = {}
    colorObj.color = req.body.color
    
    product.colors.push(colorObj)
    await product.save()

    res.send(product)

  } catch (error) {
    res.status(422).send({
      message: error.message || "An unknown error occurred",
      details: error.errors || {}
    })
  }
})

// Edit color data
// Data, that will be handled:
//  color: String,
//  images: String[], 
//  sizes: [{ size: String, stock: Number}],
router.patch('/:productId/colors/:colorId', authAdmin, uploadMultipleImages.array('images'), async (req, res) => {
  console.log('files:', req.files)
  console.log('body:', req.body)
  console.log(req.params)

  try {
    const product = await Product.findOne({ _id: req.params.productId })
    console.log({product})
    const existingColor = product.colors.find(color => color._id.equals(req.params.colorId))
    console.log({existingColor})
    // const colorIndex = product.colors.indexOf(existingColor)
    // console.log({colorIndex})

    req.body.color && (existingColor.color = req.body.color)

    req.files && req.files.map(file => {
      console.log({file})
      existingColor.images.push(`uploads/products/${req.params.productId}/${file.filename}`)
    })
    existingColor.images.push()

    req.body.sizes && (existingColor.sizes = req.body.sizes)

    console.log('before save', {product})
    await product.save()
    res.send(product)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// REMOVE ONE IMAGE FROM COLOR IMAGES
router.patch('/:productId/colors/:colorId/image', authAdmin, async (req, res) => {
  console.log('IN REMOVE ONE IMAGE FROM COLOR IMAGES')
  console.log('body: ', req.body)
  console.log('params: ', req.params)

  try {
    const product = await Product.findOne({ _id: req.params.productId })
    const existingColor = product.colors.find(color => color._id.equals(req.params.colorId))
    let colorImages = existingColor.images
    const imageIndex = colorImages.indexOf(req.body.imgUrl)
    colorImages.splice(imageIndex, 1)
    FileHelper.deleteFile(`uploads/products/${req.params.productId}/${req.body.imgUrl}`)

    await product.save()
    res.send(product)
  } catch (error) {
    res.status(500).send(error.message)
  }
})



// Get product by id
router.get('/:id', async (req, res) => {
  const isEdit = req.query.edit
  let responseObj = {}
  
  try {
    const product = await Product.findById(
      req.params.id, 
      'active collectionId description mainImageUrl price stock title colors'
    )

    !product && res.status(404).send({ 
      message: 'Product not found. Please check the provided information.' 
    })

    if (isEdit) {
      const collections = await Collection.find({}, 'title')
      responseObj = { product, collections }
    } else {
      responseObj = product
    }
    console.log('get product by id', responseObj)
    res.send(responseObj)
  } catch (error) {
    res.status(500).send(error)
  }
})

// Delete product
router.delete('/:id', authAdmin, async (req, res) => {
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