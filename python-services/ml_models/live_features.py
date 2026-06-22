"""
Extracts the SAME feature set used in training (see build_features.py),
but from a live FEN position instead of a replayed historical game.
Used at inference time by the trained win-probability model.

One difference from training: live positions don't have white_rating/
black_rating from a finished game, so rating_diff defaults to 0 (i.e.
"assume equal-strength players") unless the caller supplies ratings.
"""
import chess

PIECE_VALUES = {
    chess.PAWN: 1, chess.KNIGHT: 3, chess.BISHOP: 3,
    chess.ROOK: 5, chess.QUEEN: 9, chess.KING: 0,
}

FEATURE_COLS = [
    "ply_number", "material_diff", "mobility_diff",
    "white_king_attackers", "black_king_attackers", "king_safety_diff",
    "white_castling_rights_lost", "black_castling_rights_lost",
    "pawn_diff", "rating_diff", "is_check", "white_to_move",
]


def extract_live_features(fen, white_rating=None, black_rating=None):
    board = chess.Board(fen)

    white_material = sum(PIECE_VALUES[p.piece_type] for p in board.piece_map().values() if p.color == chess.WHITE)
    black_material = sum(PIECE_VALUES[p.piece_type] for p in board.piece_map().values() if p.color == chess.BLACK)

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

    # Default for an unknown rating: the training dataset's mean player
    # rating (~1590 across the 20K Lichess games used to train this model),
    # i.e. "assume an average player" rather than silently zeroing out the
    # whole rating signal whenever only one side's rating is known -- which
    # is the common case in this app (we usually know the logged-in user's
    # rating but not an opponent's, since there's no real matched play here).
    DEFAULT_RATING = 1590
    effective_white = white_rating if white_rating is not None else DEFAULT_RATING
    effective_black = black_rating if black_rating is not None else DEFAULT_RATING
    rating_diff = effective_white - effective_black

    return {
        "ply_number": board.fullmove_number * 2,  # approximation; exact ply isn't recoverable from FEN alone
        "material_diff": white_material - black_material,
        "mobility_diff": white_mob - black_mob,
        "white_king_attackers": white_king_attackers,
        "black_king_attackers": black_king_attackers,
        "king_safety_diff": black_king_attackers - white_king_attackers,
        "white_castling_rights_lost": int(white_castled),
        "black_castling_rights_lost": int(black_castled),
        "pawn_diff": white_pawns - black_pawns,
        "rating_diff": rating_diff,
        "is_check": int(board.is_check()),
        "white_to_move": int(board.turn == chess.WHITE),
    }
