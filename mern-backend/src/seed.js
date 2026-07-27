const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Opening = require('./models/Opening'); 

dotenv.config();

async function main() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chessopening';
  await mongoose.connect(mongoUri);

  const dataPath = path.resolve(__dirname, '..', 'frontend_data_source.json');
  let raw;
  try {
    raw = fs.readFileSync(dataPath, 'utf8');
  } catch (e) {
    console.error('No frontend data file found at', dataPath);
    process.exit(1);
  }

  const items = JSON.parse(raw);
  const docs = items.map((it) => ({ externalId: it.id, name: it.name, eco: it.eco, moves: it.moves, fen: it.fen, description: it.description }))
  await Opening.deleteMany({});
  await Opening.insertMany(docs);
  console.log('Seeded', docs.length, 'openings');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
