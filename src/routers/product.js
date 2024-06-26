const express = require('express') 
const path = require('path')

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

// GET ALL PRODUCTS //
// ---------------- //
// GET ALL PRODUCTS FROM PARTICULAR COLLECTION -> example: /products?collectionTitle=meditation%20and%20relaxasion
// GET ALL ACTIVE PRODUCTS -> /products?active=true
// GET /products?limit=10&skip20
// GET /products?sortBy=createdAt:desc
router.get('/', async (req, res) => {
  const collectionTitle = req.query.collectionTitle
  let sort = {}
  let searchOptions = {}
  let collection = {}
  
  try {
    if (collectionTitle) {
      collection = await Collection.findOne({ urlTitle: collectionTitle })
      if (!collection) {
        return res.status(404).send('collection not found')
      }
      searchOptions = { collectionId: collection._id } 
    }

    if (req.query.active) {
      searchOptions.active = req.query.active
    }

    if (req.query.sortBy) {
      const parts = req.query.sortBy(split(':'))
      sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    const products = await Product.find(searchOptions, 'title price stock mainImageUrl collectionId active')

    if (collectionTitle && collection) {
      return res.send({collection, products})
    } 
    
    res.send(products)
  } catch (error) {
    res.status(400).send(error)
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

    // If there is a new file delete the old one from the file system
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
    FileHelper.deleteFile(req.body.imgUrl)

    await product.save()
    res.send(product)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// DELETE COLOR FORM PRODUCT
router.delete('/:productId/colors/:colorId', authAdmin, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.productId })
    const existingColor = product.colors.find(color => color._id.equals(req.params.colorId))
    
    if (!existingColor) {
      return res.status(404).send()
    }

    existingColor.images.map(image => {
      FileHelper.deleteFile(image)
    })

    product.colors.id(req.params.colorId).remove()

    await product.save()
    res.send(product)
  } catch (error) {
    console.log({error})
    res.status(500).send(error)
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

// DELETE PRODUCTS //
router.delete('/:id', authAdmin, async (req, res) => {
  let searchOptions = {}
  const productId = req.params.id

  try {
    const product = await Product.findOneAndDelete({ _id: productId })
    if (!product) {
      return res.status(404).send('Product not found.')
    }

    const directoryPath = path.join(__dirname, '../..', `/uploads/products/${productId}`)

    FileHelper.deleteDirectoryRecursive(directoryPath)
    FileHelper.deleteFile(product.mainImageUrl)

    //TODO: send back all products after delete this particular product (have in mind existing searching options)
    const products = await Product.find(searchOptions, 'title price stock mainImageUrl collectionId active')

    res.send(products)
  } catch (error) {
    res.status(500).send(error)
  }
})

module.exports = router