const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const User = require('../models/user')

const { sendCancelationEmail } = require('../emails/accounts')
const { getUserProfileInfo } = require('../utils/user-utils')

const router = new express.Router()

// GET user profile
router.get('/me', auth, async (req, res) => {
  let userProfileInfo = await getUserProfileInfo(req.user._id)
  res.send(userProfileInfo)
})

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({})
    res.send(users)
  } catch (e) {
    res.status(500).send(e)
  }
})

router.get('/:id', async (req, res) => {
  const _id = req.params.id

  try {
    const user = await User.findById(_id)
    if (!user) {
      return res.status(404).send()
    }
    res.send(user)
  } catch (e) {
    res.status(500).send(e)
  }
})

// USER: Update profile
router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = [
    'fullName', 
    'email', 
    'password', 
    'birthday', 
    'phone', 
    'language', 
    'currency', 
    'shippingAddress', 
    'billingAddress'
  ]
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  !isValidOperation && res.status(400).send({ error: 'Invalid operation!'})

  try {
    updates.forEach((update) => req.user[update] = req.body[update])
    await req.user.save()
    res.send(req.user)
  } catch (error) {
    res.status(500).send(error)
  }
})

// ADMIN: Update user profile
router.patch('/:id', async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['fullName', 'email', 'password', 'age']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid operation!'})
  }

  try {
    const user = await User.findById(req.params.id)
    updates.forEach((update) => user[update] = req.body[update])
    await user.save()
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})

    if (!user) {
      return res.status(404).send()
    }
    res.send(user)
  } catch (e) {
    res.status(404).send(e)
  }
})

// USER: Delete profile
router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    // await User.deleteOne({ _id: req.user._id })
    sendCancelationEmail(req.user.email, req.user.fullName)
    res.send(req.user)
  } catch (e) {
    res.status(500).send(e)
  }
})

// ADMIN: delete user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).send()
    }
    user.remove()
    res.send(user)
  } catch (e) {
    res.status(500).send(e)
  }
})

const upload = multer({
  // dest: 'avatar',
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload jpg, jpeg or png'))
    }
    cb(undefined, true)
  }
})

// Upload avatar
// TODO: Do I need that? Use update profile instead!
router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

// Delete avatar
router.delete('/me/avatar', auth, async (req, res) => {
  if (!req.user.avatar) {
    res.status(400).send('No avatar to delete!')
  }
  try {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})

// Fetch avatar
router.get('/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error()
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
  } catch (e) {
    res.status(404).send()
  }
})

module.exports = router