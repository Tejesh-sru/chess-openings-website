# Chess AI Service

Flask + Stockfish service powering three AI features for the Chess Openings app:

1. **Move prediction** — `POST /api/analyze` — top N candidate moves for a position.
2. **Win prediction** — `POST /api/win-probability` — converts the engine's
   evaluation into a win% for White/Black (logistic curve, same approach
   lichess/chess.com use for their eval bars).
3. **Game analysis** — `POST /api/analyze-game` — walks a full move list,
   classifies each move (best / excellent / good / inaccuracy / mistake /
   blunder) by centipawn loss vs. the engine's best move, and returns a
   summary.

## Setup

```bash
cd python-services
python -m venv venv
# Windows: venv\Scripts\activate   |   macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
```

### Stockfish binary

`config.py` auto-picks a Stockfish binary based on your OS:

- Windows → `stockfish/stockfish-windows-x86-64-avx2.exe` (bundled)
- macOS → `stockfish/stockfish-macos`
- Linux → `stockfish/stockfish-ubuntu-x86-64-avx2`, falling back to whatever
  `stockfish` is on your `PATH` (e.g. `apt install stockfish` /
  `brew install stockfish`)

You can always override with an environment variable:

```bash
export STOCKFISH_PATH=/usr/games/stockfish
```

## Run

```bash
python app.py
```

Starts on `http://localhost:5001`. The frontend's Vite dev server proxies
`/ai-api/*` to this service (see `frontend/vite.config.js`).

## Endpoints

### `POST /api/analyze`
```json
{ "fen": "...", "num_moves": 3, "depth": 15 }
```
Returns `suggested_moves`: each with `move`, `uci`, `score`, `cp`,
`win_probability_white`, and `continuation`.

### `POST /api/win-probability`
```json
{ "fen": "...", "depth": 15 }
```
Returns `cp`, `mate`, `win_probability_white`, `win_probability_black`,
`best_move`.

### `POST /api/analyze-game`
```json
{ "moves": ["e4", "e5", "Nf3", "..."], "starting_fen": null, "depth": 12 }
```
Returns `moves` (per-ply classification + eval) and a `summary` count by
classification.
