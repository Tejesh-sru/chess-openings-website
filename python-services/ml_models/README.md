# Win Probability Model — Training Pipeline

This replaces nothing — it adds a second, **trained** way to estimate win
probability, served alongside the original Stockfish-eval-based logistic
formula (`/api/win-probability`) so the two can be compared directly via
`/api/win-probability-ml`.

## Why build this at all?

The original formula (`win% = 1 / (1 + 10^(-cp/400))`) converts a
Stockfish centipawn evaluation into a win percentage. It's the same
formula lichess/chess.com use, and it's well-calibrated **for engine-level
play** — but it has two real limitations:

1. It only knows material/positional factors Stockfish encodes. It has no
   way to use player rating, time control, or any signal outside the raw
   position.
2. It's calibrated on engine-vs-engine evaluation, not on how often real
   humans at a given evaluation actually go on to win — those aren't
   guaranteed to be the same curve.

Training directly on outcomes from real human games tests whether a
model can do better on those two fronts.

## Data

- **Source**: [TidyTuesday's mirror](https://github.com/rfordatascience/tidytuesday/blob/main/data/2024/2024-10-01/readme.md)
  of the well-known Kaggle "Chess Game Dataset (Lichess)" by datasnaek —
  20,058 real games played on lichess.org, with full move lists, both
  players' ratings, and the game result.
- File: `python-services/data/chess_games_raw.csv`

## Feature engineering (`build_features.py`)

For each game:
1. Replay the move list with `python-chess`.
2. Sample 4 random plies per game (skipping the first 4 plies, which are
   almost always opening theory with no outcome signal).
3. At each sampled position, compute 12 features: material difference,
   mobility difference, king-safety (attacker count), castling rights
   lost, pawn count difference, rating difference, check status, side to
   move, and ply number.
4. Label every sampled position with the **game's final result**
   (`label_white_wins`: 1/0). Draws are dropped — documented decision, to
   keep this a clean binary classification problem.

Result: **74,849 labeled position samples from 19,694 usable games**
(`python-services/data/chess_features.csv`).

## Training & evaluation (`train_win_model.py`)

**Critical methodology point**: the train/test split is done by
`game_id` via `GroupShuffleSplit`, not by row. Multiple sampled positions
from the same game share an outcome and are correlated — splitting by row
would leak information between train and test and inflate apparent
accuracy. A leakage check asserts zero shared `game_id`s between splits
before any metric is computed.

Three things are compared on the same held-out test set:

| Model | Accuracy | ROC-AUC | Brier ↓ | LogLoss ↓ |
|---|---|---|---|---|
| Current formula (untrained, material→logistic) | 0.651 | 0.717 | 0.213 | 0.625 |
| Logistic Regression (trained) | 0.716 | 0.798 | 0.182 | 0.539 |
| **XGBoost (trained)** | **0.721** | **0.803** | **0.180** | **0.534** |

(Brier score and log loss are lower-is-better; both measure calibration,
not just classification accuracy — important for a win% you want to be
*meaningfully* 70%, not just "probably going to happen.")

XGBoost feature importances confirm the model is learning sensible chess
signal: `material_diff` and `rating_diff` dominate, followed by
`mobility_diff`.

## Serving (`services/ml_win_service.py`, `ml_models/live_features.py`)

`live_features.py` extracts the *same* 12 features from a live FEN
string (rather than a replayed historical game), so the trained model can
score live positions exactly like the training pipeline did. One
difference: live positions have no `rating_diff` unless the caller
supplies `white_rating`/`black_rating` (defaults to 0, i.e. "assume equal
strength").

Endpoint: `POST /api/win-probability-ml`
```json
{ "fen": "...", "white_rating": 1800, "black_rating": 1400 }
```
Returns `win_probability_white`, `win_probability_black`, the feature
vector used (for transparency), and the model identifier.

## Honest limitations (worth stating, not hiding)

- 4 samples per game means most positions in a typical game were never
  seen by the model — finer sampling (every ply) would need a temporal
  split strategy to avoid near-duplicate leakage between adjacent plies.
- No real Stockfish evaluations exist for this dataset, so material/
  mobility/king-safety are hand-engineered proxies, not engine truth.
  A natural next step is re-running Stockfish on these exact positions
  and adding `stockfish_cp` as a feature, which would likely push
  accuracy higher still.
- Trained on amateur-to-intermediate rated games (mean ~1590, lichess
  rapid/blitz mix) — predictions for grandmaster-level or very fast
  bullet games are out of this model's training distribution.
