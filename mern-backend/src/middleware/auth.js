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
    // Exclude the password hash: this runs on every authenticated request
    // (games list, favorites, profile updates...) and req.user gets
    // returned directly by GET /api/user/me, so without this projection
    // the bcrypt hash was being sent to the client on every login session.
    const user = await User.findById(payload.sub).select('-password').lean()
    if (!user) return res.status(401).json({ error: 'Invalid token' })
    req.user = user
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Auth failed' })
  }
}

module.exports = authMiddleware
