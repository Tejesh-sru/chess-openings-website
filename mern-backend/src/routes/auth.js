const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
 
const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

// Register - creates user and returns JWT
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, displayName } = req.body || {}
    if (!username || !password) return res.status(400).json({ error: 'username/password required' })
    if (typeof username !== 'string' || typeof password !== 'string') return res.status(400).json({ error: 'invalid input' })
    let user = await User.findOne({ username })
    if (user) return res.status(400).json({ error: 'username taken' })
    const hash = await bcrypt.hash(password, 10)
    user = await User.create({ email, username, password: hash, displayName })
    const token = jwt.sign({ sub: user._id.toString() }, SECRET, { expiresIn: '7d' })
    return res.json({ accessToken: token })
  } catch (err) {
    console.error('Register error', err)
    return res.status(500).json({ error: 'internal_server_error' })
  }
})

// Login - username/password -> JWT
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body || {}
    if (!username || !password) return res.status(400).json({ error: 'username/password required' })
    const user = await User.findOne({ username })
    if (!user) return res.status(401).json({ error: 'invalid credentials' })
    const ok = await bcrypt.compare(password, user.password || '')
    if (!ok) return res.status(401).json({ error: 'invalid credentials' })
    const token = jwt.sign({ sub: user._id.toString() }, SECRET, { expiresIn: '7d' })
    return res.json({ accessToken: token })
  } catch (err) {
    console.error('Login error', err)
    return res.status(500).json({ error: 'internal_server_error' })
  }
})

module.exports = { authRouter: router }
