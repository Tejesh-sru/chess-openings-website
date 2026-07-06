const rateLimit = require('express-rate-limit')

// Shared handler so every limiter returns a consistent, informative 429 body
// instead of the express-rate-limit default plain-text response.
function makeLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true, // adds RateLimit-* headers so clients can back off intelligently
    legacyHeaders: false,
    // Key by authenticated user when available (set by the auth middleware upstream),
    // falling back to IP for unauthenticated requests. This avoids over-penalizing
    // multiple users behind the same IP (offices, NAT, mobile carriers) while still
    // limiting logged-in users who hammer an endpoint.
    keyGenerator: (req) => (req.user && req.user._id ? String(req.user._id) : req.ip),
    handler: (req, res) => {
      res.status(429).json({ error: 'rate_limited', message })
    },
  })
}

// Auth endpoints (login/register): tight limit, IP-based since there's no
// authenticated user yet. Primary purpose is slowing down credential stuffing
// and brute-force attempts, not protecting server resources.
const authLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: 'Too many auth attempts. Please try again in a few minutes.',
})

// Standard CRUD endpoints (openings, user profile, games). Cheap per-request
// cost, so the limit is generous — this is a safety net against runaway
// clients/scripts rather than a meaningful throttle on normal usage.
const standardLimiter = makeLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests. Please slow down and try again shortly.',
})

module.exports = { authLimiter, standardLimiter, makeLimiter }
