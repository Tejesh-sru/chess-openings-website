const mongoose = require('mongoose')

const GameSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String },
  moves: { type: String },
  movesCount: { type: Number }
}, { timestamps: true })
 
// The games list route queries by userId and sorts by createdAt descending
// (GET /api/games). Without this compound index, Mongo does a collection
// scan for the userId filter and an in-memory sort for every request.
// Field order matters: userId first (equality filter), createdAt second
// (matches the sort direction) so Mongo can satisfy both from the index.
GameSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('Game', GameSchema)
