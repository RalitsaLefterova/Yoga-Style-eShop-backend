const express = require('express')
const path = require('path')
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const Collection = require('../models/collection')

const router = new express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/collections')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now()
    console.log('--- in multer.diskStorage ---')
    console.log('file in storage', file)
    console.log('body in storage', req.body)

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
    console.log('in fileFilter', file)
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload jpg, jpeg or png.'))
    }
    cb(undefined, true)
  }
})

// Create collection 
router.post('/', auth, uploadCollection.single('cover'), async (req, res, next) => {
  console.log('--- in create collection ---')
  console.log('req.file', req.file, 'req.body', req.body)
  // console.log('REQ', req)
  const title = req.body.title
  const cover = `${process.env.BACKEND_URL}/${req.file.path}`

  const collection = new Collection({ title, cover })
  console.log('collection before save', collection)

  await collection.save()
  res.send('collection created')

  }, (error, req, res, next) => {
    console.log('error when create collection', error, req.file)
    res.status(400).send({ error: error.message })
  })

// Get collection
router.get('/:id', async (req, res) => {
  console.log('get collection by id', req.params.id)
  console.log('req.file', req.file)
  const _id = req.params.id
  console.log('_id', _id)
  try {
    const collection = await Collection.findById(_id)
    console.log('collection res', collection)
    if (!collection) {
      return res.status(404).send()
    }
    res.send(collection)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Get all collections
router.get('/', auth, async (req, res) => {
  try {
    const collections = await Collection.find({})
    res.send(collections)
  } catch (e) {
    res.status(500).send(e)
  }
})

// Edit collection
router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['title', 'active']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid operation!'})
  }

  try {
    const collection = await Collection.findOne({ _id: req.params.id})
    if (!collection) {
      return res.status(404).send()
    }
    updates.forEach((update) => collection[update] = req.body[update])
    await collection.save()
    res.send(collection)
  } catch (e) {
    res.status(500).send(e)
  }

})



module.exports = router