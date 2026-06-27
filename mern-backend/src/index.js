const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
 
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8080;

async function start() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chessopening';
  await mongoose.connect(mongoUri).catch(err => {
    console.error('MongoDB connection error:', err); 
    process.exit(1);
  });
  // auth middleware
  const { authRouter } = require('./routes/auth')
  const { userRouter } = require('./routes/user')
  const { gamesRouter } = require('./routes/games')

  app.get('/api/ping', (req, res) => res.json({ ok: true }));
  app.get('/api/health', (req, res) => res.json({ ok: true }));

  // Placeholder routes
  app.use('/api/openings', require('./routes/openings'));
  app.use('/api/auth', authRouter)
  app.use('/api/user', userRouter)
  app.use('/api/games', gamesRouter)

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
