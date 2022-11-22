const express = require('express')
const path = require('path')
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const Collection = require('../models/collection')
const FileHelper = require('../utils/files')

const router = new express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '/uploads/collections'))
    // cb(null, '/uploads/collections')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now()
    // Note: Multer does not add extensions to file names, and it’s recommended to return a filename complete with a file extension.
    cb(null, 'collection-' + req.body.title.replace(/\s+/g, '-').toLowerCase() + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const uploadCollection = multer({
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

// Create collection 
router.post('/', auth, uploadCollection.single('cover'), async (req, res, next) => {
  const title = req.body.title
  const cover = FileHelper.createFilePath(req.file.path)

  const collection = new Collection({ title, cover })

  await collection.save()
  res.send('collection created')

  }, (error, req, res, next) => {
    console.log('error when create collection', error, req.file)
    res.status(400).send({ error: error.message })
  })

// Get all collections
router.get('/', async (req, res) => {
  let isShortInfo = !!req.query.short,
      collections = []

  try {
    const collectionsDetailedInfo = await Collection.find({})
    
    isShortInfo
      ? collections = collectionsDetailedInfo.reduce(
        (accumulator, collection) => 
          accumulator.concat({ _id: collection._id, title: collection.title }), 
        []) 
      : collections = collectionsDetailedInfo

    res.send(collections)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Get collection by id
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



// Edit collection (Admin)
router.patch('/:id', auth, uploadCollection.single('cover'), async (req, res) => {
  // console.log('in Edit collection req.body', req.body)
  // console.log('in Edit collection req.file', req.file)
  if (req.file) { 
    req.body.cover = FileHelper.createFilePath(req.file.path)
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
    // console.log('req.body', req.body)
    // console.log('collection ====>', collection)

    if (req.file) {
      FileHelper.deleteFile(collection.cover)
    }

    updates.forEach((update) => collection[update] = req.body[update])

    await collection.save()
    res.send(collection)

  } catch (e) {
    res.status(500).send(e)
  }

})

// Delete collection (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    const collection = await Collection.findOneAndDelete({ _id: req.params.id})
    if (!collection) {
      return res.status(404).send()
    }
    FileHelper.deleteFile(collection.cover)
    res.send('Collection was deleted successfully.')
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router