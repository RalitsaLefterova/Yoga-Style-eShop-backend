const express = require('express')
const auth = require('../middleware/auth')

const Address = require('../models/address')

const router = new express.Router()

// Create user's address
router.post('/', auth, async (req, res) => {
try {
  req.user.addresses.push(req.body)
  await req.user.save()
  res.send(req.user)
} catch (error) {
  res.status(400).send(error)
}
})

// Edit user's address
router.patch('/:id', auth, async (req, res) => {
try {
  const addressToEdit = req.user.addresses.id(req.params.id)
  addressToEdit.set(req.body)
  await req.user.save()
  res.send(req.user)
} catch (error) {
  res.status(400).send(error)
}
})

// Delete user's address
router.delete('/:id', auth, async (req, res) => {
  try {
    req.user.addresses.id(req.params.id).remove()
    await req.user.save()
    res.send(req.user)
  } catch (error) {
    res.status(400).send(error)
  }
})

module.exports = router