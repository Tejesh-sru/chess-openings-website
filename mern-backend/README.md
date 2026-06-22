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

