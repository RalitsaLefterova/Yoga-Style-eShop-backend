const express = require('express')

const authAdmin = require('../middleware/auth-admin')
const { uploadCollectionImage } = require('../middleware/multer-config')
const Collection = require('../models/collection')
const FileHelper = require('../utils/files')
const Product = require('../models/product')

const router = new express.Router()

// CREATE COLLECTION 
router.post('/', authAdmin, uploadCollectionImage.single('cover'), async (req, res, next) => {
  const newCollectionData = {
    title: req.body.title,
    cover: req.file ? `uploads/collections/${req.file.filename}` : '',
    collectionTeaser: req.body.collectionTeaser || ''
  }

  try {
    const collection = new Collection(newCollectionData)
    const collections = await Collection.find({})

    collection.position = collections.length
  
    await collection.save()
    res.send(collection)
  } catch (error) {
    res.status(400).send({
      message: error.message || "An unknown error occurred",
      details: error.errors || {}
    })
  }
})

// GET ALL COLLECTIONS
router.get('/', async (req, res) => {
  let isShortInfo = !!req.query.short,
      isActiveCollectionsOnly = !!req.query.active,
      collections = []

  try {
    if (isShortInfo) {
      collections = await Collection.find({}, '_id title urlTitle').sort('position')
    } else if (isActiveCollectionsOnly) {
      collections = await Collection.find({ active: true }).sort('position')
    } else {
      collections = await Collection.find({}).sort('position')
    }

    res.send(collections)
  } catch (e) {
    res.status(500).send(e)
  }
})

// GET COLLECTION BY ID
router.get('/:id', async (req, res) => {
  const _id = req.params.id
  try {
    const collection = await Collection.findById(_id)
    if (!collection) {
      return res.status(404).send()
    }
    res.send(collection)
  } catch (e) {
    res.status(500).send(e)
  }
})

// EDIT COLLECTION (Admin)
router.patch('/:id', authAdmin, uploadCollectionImage.single('cover'), async (req, res) => {
  if (req.file) { 
    req.body.cover = `uploads/collections/${req.file.filename}`
  }
  const updates = Object.keys(req.body)
  const allowedUpdates = ['title', 'active', 'cover', 'collectionTeaser']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid operation!'})
  }

  try {
    const collection = await Collection.findOne({ _id: req.params.id})
    if (!collection) {
      return res.status(404).send()
    }

    req.file && FileHelper.deleteFile(collection.cover)

    updates.forEach((update) => collection[update] = req.body[update])

    await collection.save()
    res.send(collection)
  } catch (e) {
    res.status(500).send(e)
  }

})

// EDIT COLLECTION POSITION (Admin)
router.patch('/reorder/:id/', authAdmin, async (req, res) => {
  if (req.body.newPosition === undefined) {
    return res.status(400).send({ error: 'Invalid operation! Mandatory parameter "newPosition" is missing.'})
  }

  const collectionId = req.params.id
  const newPosition = req.body.newPosition

  try {
    const collections = await Collection.find({}).sort('position')
    
    // Find the collection to be moved
    const collectionToMove = collections.find(collection => collection._id.equals(collectionId))

    // Remove the collection from the list temporarily
    const updatedCollections = collections.filter(collection => !collection._id.equals(collectionId))
    
    // Update the position of the collection to be moved
    collectionToMove.position = newPosition
    
    // Reorder other collections positions based on the new order
    updatedCollections.splice(newPosition, 0, collectionToMove)
    updatedCollections.forEach((collection, index) => {
      collection.position = index
    })
    
    // Save the updated positions to the database
    const updatedPromises = updatedCollections.map(collection => collection.save())
    await Promise.all(updatedPromises)

    res.send(updatedCollections)
  } catch (error) {
    res.status(500).send(error)
  }
})


// DELETE COLLECTION (Admin)
router.delete('/:id', authAdmin, async (req, res) => {
  console.log('------ delete collection request ------')
  try {
    const collectionId = req.params.id

    // Check if the collection has any associated products 
    const productsInCollection = await Product.findOne({ collectionId: collectionId})

    if (productsInCollection) {
      return res.status(400).send({ message: "Cannot delete collection with products." })
    }

    const collection = await Collection.findOneAndDelete({ _id: req.params.id})

    if (!collection) {
      return res.status(404).send({ message: "Cannot find collection." })
    }
    console.log('collection for delete:', collection)
    // Delete the associated cover file
    FileHelper.deleteFile(collection.cover)

    // Get the updated list of collections
    const collections = await Collection.find({})

    res.send(collections)
  } catch (error) {
    res.status(400).send({
      message: error.message || "An unknown error occurred",
      details: error.errors || {}
    })
  }
})

module.exports = router
