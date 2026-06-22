import math

import chess
import chess.engine

from config import STOCKFISH_PATH, MOVE_CLASSIFICATION_THRESHOLDS

# Global engine variable
engine = None


def init_engine():
    """Initialize the Stockfish engine globally."""
    global engine
    if engine is None:
        try:
            engine = chess.engine.SimpleEngine.popen_uci(STOCKFISH_PATH)
            print(f"✅ Stockfish engine loaded from {STOCKFISH_PATH}")
        except Exception as e:
            print(f"❌ Failed to load Stockfish: {e}")
            print("   Set the STOCKFISH_PATH env var to point at a valid Stockfish binary,")
            print("   or download one from https://stockfishchess.org/download/")
            engine = None
    return engine


def _ensure_engine():
    if engine is None:
        init_engine()
    return engine


def _score_to_cp(score, board_turn):
    """
    Normalize a python-chess PovScore to a centipawn value from White's
    perspective. Mate scores are converted to a large but bounded value so
    they sort/compare sensibly with normal evaluations.
    """
    white_score = score.white()
    if white_score.is_mate():
        mate_in = white_score.mate()
        # Closer mates are scored as more extreme. Cap at +/-10000.
        sign = 1 if mate_in > 0 else -1
        magnitude = max(1, 10000 - abs(mate_in) * 10)
        return sign * magnitude
    return white_score.score()


def cp_to_win_probability(cp, side_to_move="white"):
    """
    Convert a centipawn evaluation (from White's perspective) into a
    win probability for White, using the same logistic formula commonly
    used by lichess/chess.com to power their eval bars.

    win% = 1 / (1 + 10^(-cp/400))
    """
    if cp is None:
        return 50.0
    win_white = 1 / (1 + math.pow(10, -cp / 400))
    return round(win_white * 100, 1)


def get_best_moves(fen, num_moves=3, depth=15):
    """
    Analyze a position and return top N candidate moves with evaluation
    scores and the resulting continuation. This powers "move prediction".
    """
    eng = _ensure_engine()
    if eng is None:
        return []

    try:
        board = chess.Board(fen)
    except ValueError:
        return []

    info = eng.analyse(board, chess.engine.Limit(depth=depth), multipv=num_moves)

    moves = []
    for entry in info:
        if not entry.get("pv"):
            continue
        move_san = board.san(entry["pv"][0])
        score = entry["score"]
        cp = _score_to_cp(score, board.turn)
        if score.is_mate():
            mate_in = score.white().mate()
            score_str = f"Mate in {abs(mate_in)}"
        else:
            score_str = f"{cp / 100:.2f}"
        continuation = [board.san(m) for m in entry["pv"]]
        moves.append({
            "move": move_san,
            "uci": entry["pv"][0].uci(),
            "score": score_str,
            "cp": cp,
            "win_probability_white": cp_to_win_probability(cp),
            "continuation": continuation,
        })
    return moves


def evaluate_position(fen, depth=15):
    """
    Single-position evaluation used for the win-probability bar.
    Returns the eval from White's perspective plus win% for both sides.
    """
    eng = _ensure_engine()
    if eng is None:
        return None

    try:
        board = chess.Board(fen)
    except ValueError:
        return None

    if board.is_checkmate():
        # Side to move has been mated -> the other side has 100% win prob.
        white_win = 0.0 if board.turn == chess.WHITE else 100.0
        return {
            "fen": fen,
            "cp": None,
            "mate": 0,
            "win_probability_white": white_win,
            "win_probability_black": round(100 - white_win, 1),
            "best_move": None,
        }

    info = eng.analyse(board, chess.engine.Limit(depth=depth))
    score = info["score"]
    cp = _score_to_cp(score, board.turn)
    win_white = cp_to_win_probability(cp)

    best_move = None
    if info.get("pv"):
        best_move = board.san(info["pv"][0])

    return {
        "fen": fen,
        "cp": cp,
        "mate": score.white().mate() if score.is_mate() else None,
        "win_probability_white": win_white,
        "win_probability_black": round(100 - win_white, 1),
        "best_move": best_move,
    }


def _classify_move(cp_loss):
    """Classify a played move based on centipawn loss vs. the best move."""
    thresholds = MOVE_CLASSIFICATION_THRESHOLDS
    if cp_loss <= thresholds["best"]:
        return "best"
    if cp_loss <= thresholds["excellent"]:
        return "excellent"
    if cp_loss <= thresholds["good"]:
        return "good"
    if cp_loss <= thresholds["inaccuracy"]:
        return "inaccuracy"
    if cp_loss <= thresholds["mistake"]:
        return "mistake"
    return "blunder"


def analyze_game(moves, depth=12, starting_fen=None):
    """
    Walk through a full game move-by-move (SAN or UCI strings), evaluate
    each position before and after the move is played, and classify the
    move quality. Powers the "game analysis" / post-game report feature.
    """
    eng = _ensure_engine()
    if eng is None:
        return None

    board = chess.Board(starting_fen) if starting_fen else chess.Board()

    move_reports = []
    summary = {
        "best": 0, "excellent": 0, "good": 0,
        "inaccuracy": 0, "mistake": 0, "blunder": 0,
    }

    for ply_index, move_str in enumerate(moves):
        side = "white" if board.turn == chess.WHITE else "black"

        # Evaluate the position BEFORE the move (best move + eval).
        pre_info = eng.analyse(board, chess.engine.Limit(depth=depth))
        pre_score = pre_info["score"]
        pre_cp = _score_to_cp(pre_score, board.turn)
        best_move_san = board.san(pre_info["pv"][0]) if pre_info.get("pv") else None

        # Parse and play the actual move (accepts SAN or UCI).
        try:
            move = board.parse_san(move_str)
        except ValueError:
            try:
                move = chess.Move.from_uci(move_str)
            except Exception:
                continue

        played_san = board.san(move)
        board.push(move)

        # Evaluate the position AFTER the move, then re-express it from the
        # mover's perspective to compute centipawn loss.
        post_info = eng.analyse(board, chess.engine.Limit(depth=depth))
        post_score = post_info["score"]
        post_cp = _score_to_cp(post_score, board.turn)

        # cp values above are from White's perspective; convert "loss" to be
        # from the mover's own perspective so it's always >= 0 for a perfect move.
        if side == "white":
            cp_loss = max(0, pre_cp - post_cp) if pre_cp is not None and post_cp is not None else 0
        else:
            cp_loss = max(0, post_cp - pre_cp) if pre_cp is not None and post_cp is not None else 0

        classification = _classify_move(cp_loss)
        summary[classification] += 1

        move_reports.append({
            "ply": ply_index + 1,
            "side": side,
            "move": played_san,
            "best_move": best_move_san,
            "classification": classification,
            "cp_loss": cp_loss,
            "eval_after_cp": post_cp,
            "win_probability_white_after": cp_to_win_probability(post_cp),
            "fen_after": board.fen(),
        })

    return {
        "moves": move_reports,
        "summary": summary,
        "final_fen": board.fen(),
    }
