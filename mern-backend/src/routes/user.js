const express = require('express')
const router = express.Router()
const User = require('../models/User')
const auth = require('../middleware/auth')

// public - get current user by token
router.get('/me', auth, async (req, res) => {
  try {
    return res.json(req.user)
  } catch (err) { 
    console.error('Get me error', err)
    return res.status(500).json({ error: 'internal_server_error' })
  }
})

// favorites add
router.post('/me/favorites', auth, async (req, res) => {
  try {
    const { openingId } = req.body || {}
    if (!openingId) return res.status(400).json({ error: 'openingId required' })
    const u = await User.findById(req.user._id)
    if (!u.favorites.includes(openingId)) u.favorites.push(openingId)
    await u.save()
    return res.json(u.favorites)
  } catch (err) {
    console.error('Add favorite error', err)
    return res.status(500).json({ error: 'internal_server_error' })
  }
})

// favorites remove
router.delete('/me/favorites/:id', auth, async (req, res) => {
  try {
    const u = await User.findById(req.user._id)
    u.favorites = u.favorites.filter(x => x !== req.params.id)
    await u.save()
    return res.json(u.favorites)
  } catch (err) {
    console.error('Remove favorite error', err)
    return res.status(500).json({ error: 'internal_server_error' })
  }
})

// update profile
router.put('/me', auth, async (req, res) => {
  try {
    const u = await User.findById(req.user._id)
    const { displayName, avatarUrl, bio } = req.body || {}
    if (displayName !== undefined) u.displayName = displayName
    if (avatarUrl !== undefined) u.avatarUrl = avatarUrl
    if (bio !== undefined) u.bio = bio
    await u.save()
    return res.json({ ok: true })
  } catch (err) {
    console.error('Update profile error', err)
    return res.status(500).json({ error: 'internal_server_error' })
  }
})

module.exports = { userRouter: router }
