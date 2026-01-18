# Chess Openings Explorer

Small React + Vite app (JavaScript) that demonstrates an interactive chessboard and a simple openings list.

## Quick start

1. Install deps:

   npm install

2. Run dev server:

   npm run dev

3. Open the link printed by Vite (http://localhost:5173 by default)

## Notes
- UI uses Bootstrap.
- Board uses `react-chessboard` and `chess.js`.
- Openings are in `src/data/openings.json` — we will expand/import PGN/ECO data next.
- A Spring Boot backend is provided under `server/` to handle user auth and per-user favorites/puzzles.

## Running front + back locally
1. Start backend (from `server/`):
   - mvn spring-boot:run
   - Backend runs at http://localhost:8080 by default
2. Start frontend (from project root):
   - npm install
   - npm run dev

The frontend expects the backend at `http://localhost:8080` by default. You can override the base API URL with a Vite env var: create a `.env` file in the frontend root with `VITE_API_BASE=http://localhost:8080`.

## Next steps
- Add full openings dataset, search and filters
- Improve puzzles, scoring, and add user-specific progress tracking
- Production: change `jwt.secret`, use a persistent DB (Postgres) and enable HTTPS
