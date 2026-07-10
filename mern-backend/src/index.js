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
  const { authLimiter, standardLimiter } = require('./middleware/rateLimiters')

  app.get('/api/ping', (req, res) => res.json({ ok: true }));
  app.get('/api/health', (req, res) => res.json({ ok: true }));

  // Rate limiting is tiered by endpoint cost, not applied uniformly:
  // - /api/auth gets a tight, IP-keyed limit since login/register are the
  //   target for credential-stuffing / brute-force attempts.
  // - Everything else gets a generous limit that's mostly a safety net
  //   against runaway clients, keyed by user id when authenticated.
  app.use('/api/auth', authLimiter, authRouter)
  app.use('/api/openings', standardLimiter, require('./routes/openings'));
  app.use('/api/user', standardLimiter, userRouter)
  app.use('/api/games', standardLimiter, gamesRouter)

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

start();
