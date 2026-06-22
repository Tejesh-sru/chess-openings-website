const mongoose = require('mongoose')

const GameSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String },
  moves: { type: String },
  movesCount: { type: Number }
}, { timestamps: true })

module.exports = mongoose.model('Game', GameSchema)
