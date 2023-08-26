const express = require('express')

const authAdmin = require('../middleware/auth-admin')
const { uploadCollectionImage } = require('../middleware/multer-config')
const Collection = require('../models/collection')
const FileHelper = require('../utils/files')

const router = new express.Router()

// CREATE COLLECTION 
router.post('/', authAdmin, uploadCollectionImage.single('cover'), async (req, res, next) => {
  const title = req.body.title
  let cover = ''

  if (req.file && req.file.filename) {
    cover = `uploads/collections/${req.file.filename}`
  }

  try {
    const collection = new Collection({ title, cover })
    const collections = await Collection.find({})
    console.log('collectionsLength', collections.length)
    collection.position = collections.length
  
    await collection.save()
    res.send(collection)
  } catch (error) {
    res.status(400).send(error)
  }
  })

// GET ALL COLLECTIONS
router.get('/', async (req, res) => {
  let isShortInfo = !!req.query.short,
      collections = []

  try {
    if (isShortInfo) {
      collections = await Collection.find({}, '_id title')
    } else {
      collections = await Collection.find({})
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
  const allowedUpdates = ['title', 'active', 'cover']
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
  if (!req.body.newPosition) {
    return req.status(400).send({ error: 'Invalid operation! Mandatory parameter "newPosition" is missing.'})
  }

  const collectionId = req.params.id

  try {
    let collections = []
    collections = await Collection.find({})
    // console.log({collections})
    
    const collection = Collection.find({ _id: collectionId })
    console.log({collection})

    const collectionIndex = collections.findIndex(collection => {
      console.log('collection._id', collection._id)
      console.log('collectionId', collectionId)
      console.log('collection._id.equals(collectionId)', collection._id.equals(collectionId))
      return collection._id.equals(collectionId)
    })
    console.log({collectionIndex})

    res.send(collections)
  } catch (error) {
    
  }
})


// DELETE COLLECTION (Admin)
router.delete('/:id', authAdmin, async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({ _id: req.params.id})
    if (!collection) {
      return res.status(404).send()
    }
    FileHelper.deleteFile(collection.cover)

    const collections = await Collection.find({})
    res.send(collections)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

module.exports = router