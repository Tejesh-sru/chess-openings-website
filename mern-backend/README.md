# MERN Backend

Minimal Express/MongoDB scaffold for the chessopening app.

Quick start:

```bash
cd mern-backend
npm install
cp .env.example .env
npm run dev
```

Notes:
- The app uses JWT for authentication. Set `JWT_SECRET` in `.env` for production.
- Seed data copies openings from `mern-backend/frontend_data_source.json`.

## Rate limiting

Rate limiting is tiered by endpoint cost rather than applied uniformly, using `express-rate-limit` (see `src/middleware/rateLimiters.js`).

| Route | Limiter | Limit | Keyed by |
|---|---|---|---|
| `/api/auth` (login, register) | `authLimiter` | 10 requests / 15 min | IP address |
| `/api/openings` | `standardLimiter` | 300 requests / 15 min | user ID if authenticated, else IP |
| `/api/user` | `standardLimiter` | 300 requests / 15 min | user ID if authenticated, else IP |
| `/api/games` | `standardLimiter` | 300 requests / 15 min | user ID if authenticated, else IP |

- **Auth is tight and IP-based** because there's no authenticated user yet at that point, and it's the target for credential-stuffing / brute-force attempts.
- **Everything else is generous and user-keyed**, which avoids over-penalizing multiple users behind the same IP (offices, NAT, mobile carriers) while still limiting a single account that hammers an endpoint.
- Exceeding a limit returns `429` with `{ "error": "rate_limited", "message": "..." }`.
- The store is in-memory (the `express-rate-limit` default), which is fine for a single-instance deployment but resets on restart and won't work across multiple instances. If this were horizontally scaled, the store would move to Redis (`rate-limit-redis`).
- The AI/Stockfish/ML endpoints are **not** rate-limited here — the frontend calls the Flask service directly via Vite's `/ai-api` proxy, bypassing Node entirely, so any limiting on that (more expensive) path belongs in the Flask service, not this one.

## Performance optimizations

- **Compound index on `Game`** (`{ userId: 1, createdAt: -1 }` in `src/models/Game.js`): matches the exact filter+sort pattern used by `GET /api/games` (filter by `userId`, sort by `createdAt` descending), avoiding a collection scan plus in-memory sort on every request.
- **Fixed an over-fetching / data-exposure bug in `src/middleware/auth.js`**: the per-request user lookup used to pull the full document, including the bcrypt password hash, into `req.user` on every authenticated request — and `GET /api/user/me` returns `req.user` directly to the client. Added `.select('-password')` to project it out.
- **Pagination on `GET /api/openings`**: replaced a hardcoded `.limit(200)` with client-controlled `limit`/`skip` query params (capped at 200), so the endpoint only fetches what the client actually needs instead of always paying for a fixed 200-document page.

**Not yet done / known gaps:**
- No measured before/after query numbers (e.g. `explain('executionStats')` docsExamined counts) are included yet — these changes haven't been benchmarked against a real seeded dataset.
- No caching layer for immutable data (e.g. opening eval scores) has been added yet.
- No performance or rate-limiting work has been done on the Flask/Python ML service yet.


