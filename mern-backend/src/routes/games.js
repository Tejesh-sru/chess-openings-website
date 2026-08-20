const express = require('express') 
const router = express.Router()
const Game = require('../models/Game')
const auth = require('../middleware/auth')

// create game
router.post('/', auth, async (req, res) => {
  try {
    const { title, moves, movesCount } = req.body || {}
    if (!moves) return res.status(400).json({ error: 'moves required' })
    const g = await Game.create({ userId: req.user._id, title, moves, movesCount })
    return res.json(g)
  } catch (err) {
    console.error('Create game error', err)
    return res.status(500).json({ error: 'internal_server_error' })
  }
})

// list games for user
router.get('/', auth, async (req, res) => {
  try {
    const games = await Game.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean()
    return res.json(games)
  } catch (err) {
    console.error('List games error', err)
    return res.status(500).json({ error: 'internal_server_error' })
  }
})

module.exports = { gamesRouter: router }
