const mongoose = require('mongoose');

const OpeningSchema = new mongoose.Schema({
  externalId: { type: String, index: true },
  name: { type: String, required: true },
  eco: { type: String },
  moves: { type: [String], default: [] },
  fen: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Opening', OpeningSchema);
