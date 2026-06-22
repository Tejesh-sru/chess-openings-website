const jwt = require('jsonwebtoken')
const User = require('../models/User')

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me'

async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'Missing auth' })
  const parts = auth.split(' ')
  if (parts.length !== 2) return res.status(401).json({ error: 'Invalid auth' })
  const token = parts[1]
  try {
    const payload = jwt.verify(token, SECRET)
    const user = await User.findById(payload.sub).lean()
    if (!user) return res.status(401).json({ error: 'Invalid token' })
    req.user = user
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Auth failed' })
  }
}

module.exports = authMiddleware
