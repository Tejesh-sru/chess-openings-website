"""
Feature engineering pipeline for the win-probability model.

For each real game in the dataset, replays the moves with python-chess and
samples several positions per game. For each sampled position, extracts
hand-engineered features (material, mobility, king safety, etc.) and labels
it with the GAME'S EVENTUAL OUTCOME (not the position's "objective" eval --
we don't have Stockfish evals for this dataset, only final results).

This is what makes it a genuine supervised learning problem: the label
(did White win this game?) is known only at the end, and we're asking the
model to predict it from an early/mid-game snapshot -- exactly the same
task structure as "win probability from a partial game."
"""
import sys
import random
import pandas as pd
import chess

random.seed(42)

PIECE_VALUES = {
    chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3,
    chess.ROOK: 5, chess.QUEEN: 9, chess.KING: 0,
}


def extract_features(board, ply_number, white_rating, black_rating):
    """Hand-engineered features for a single board position."""
    white_material = sum(PIECE_VALUES[p.piece_type] for p in board.piece_map().values() if p.color == chess.WHITE)
    black_material = sum(PIECE_VALUES[p.piece_type] for p in board.piece_map().values() if p.color == chess.BLACK)

    # Mobility for whoever's turn it is is free (board.legal_moves). For the
    # other side, flip turn on a COPY of the board so we don't corrupt the
    # original; this is correct even in check (unlike pushing a null move).
    mover_mobility = len(list(board.legal_moves))
    flipped = board.copy()
    flipped.turn = not flipped.turn
    try:
        other_mobility = len(list(flipped.legal_moves))
    except Exception:
        other_mobility = 0

    if board.turn == chess.WHITE:
        white_mob, black_mob = mover_mobility, other_mobility
    else:
        white_mob, black_mob = other_mobility, mover_mobility

    white_king_sq = board.king(chess.WHITE)
    black_king_sq = board.king(chess.BLACK)
    white_king_attackers = len(board.attackers(chess.BLACK, white_king_sq)) if white_king_sq is not None else 0
    black_king_attackers = len(board.attackers(chess.WHITE, black_king_sq)) if black_king_sq is not None else 0

    white_castled = not board.has_castling_rights(chess.WHITE)
    black_castled = not board.has_castling_rights(chess.BLACK)

    white_pawns = len(board.pieces(chess.PAWN, chess.WHITE))
    black_pawns = len(board.pieces(chess.PAWN, chess.BLACK))

    return {
        "ply_number": ply_number,
        "material_diff": white_material - black_material,
        "mobility_diff": white_mob - black_mob,
        "white_king_attackers": white_king_attackers,
        "black_king_attackers": black_king_attackers,
        "king_safety_diff": black_king_attackers - white_king_attackers,  # positive favors White
        "white_castling_rights_lost": int(white_castled),
        "black_castling_rights_lost": int(black_castled),
        "pawn_diff": white_pawns - black_pawns,
        "rating_diff": white_rating - black_rating,
        "is_check": int(board.is_check()),
        "white_to_move": int(board.turn == chess.WHITE),
    }


def label_from_winner(winner):
    if winner == "white":
        return 1
    if winner == "black":
        return 0
    return None  # drop draws for a clean binary classifier (documented decision)


def build_dataset(raw_csv_path, out_csv_path, positions_per_game=4, max_games=None):
    df = pd.read_csv(raw_csv_path)
    if max_games:
        df = df.sample(n=min(max_games, len(df)), random_state=42).reset_index(drop=True)

    rows = []
    skipped = 0

    for idx, row in df.iterrows():
        label = label_from_winner(row["winner"])
        if label is None:
            continue  # skip draws

        moves_str = row["moves"]
        if not isinstance(moves_str, str) or not moves_str.strip():
            skipped += 1
            continue

        san_moves = moves_str.split()
        n_plies_total = len(san_moves)
        if n_plies_total < 6:
            skipped += 1
            continue  # too short to be meaningful

        # Sample N distinct ply indices spread across the game up front,
        # skipping the first 4 plies (almost always identical openings with
        # no signal). Snapshot the board only at those indices instead of
        # copying it after every single move.
        sample_range = list(range(4, n_plies_total))
        if not sample_range:
            skipped += 1
            continue
        k = min(positions_per_game, len(sample_range))
        sampled_plies = set(random.sample(sample_range, k))

        board = chess.Board()
        snapshots = []
        try:
            for ply_idx, san in enumerate(san_moves):
                move = board.parse_san(san)
                board.push(move)
                if ply_idx in sampled_plies:
                    snapshots.append((ply_idx, board.copy()))
        except Exception:
            skipped += 1
            continue

        for ply_idx, board_at_ply in snapshots:
            feats = extract_features(
                board_at_ply, ply_idx + 1,
                row["white_rating"], row["black_rating"]
            )
            feats["label_white_wins"] = label
            feats["game_id"] = row["game_id"]  # kept for group-aware splitting later
            rows.append(feats)

        if idx % 2000 == 0:
            print(f"  processed {idx}/{len(df)} games, {len(rows)} samples so far", file=sys.stderr)

    out_df = pd.DataFrame(rows)
    out_df.to_csv(out_csv_path, index=False)
    print(f"Done. {len(out_df)} position samples from {len(df) - skipped}/{len(df)} usable games.")
    print(f"Skipped {skipped} games (draws excluded separately, malformed/too-short games here).")
    return out_df


if __name__ == "__main__":
    build_dataset(
        raw_csv_path="chess_games_raw.csv",
        out_csv_path="chess_features.csv",
        positions_per_game=4,
    )
