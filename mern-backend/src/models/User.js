const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String },
  displayName: { type: String },
  bio: { type: String },
  avatarUrl: { type: String },
  favorites: { type: [String], default: [] },
  rating: { type: Number, default: 1200 } // self-reported/estimated Elo; used as ML model context, not a competitive ranking
}, { timestamps: true })

module.exports = mongoose.model('User', UserSchema)
