# config.py
import os
import platform

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STOCKFISH_DIR = os.path.join(BASE_DIR, "stockfish")


def _default_stockfish_path():
    """
    Pick a sensible default Stockfish binary path for the current OS.
    Can always be overridden with the STOCKFISH_PATH env var.
    """
    env_path = os.environ.get("STOCKFISH_PATH")
    if env_path:
        return env_path

    system = platform.system()
    if system == "Windows":
        candidate = os.path.join(STOCKFISH_DIR, "stockfish-windows-x86-64-avx2.exe")
    elif system == "Darwin":
        candidate = os.path.join(STOCKFISH_DIR, "stockfish-macos")
    else:
        candidate = os.path.join(STOCKFISH_DIR, "stockfish-ubuntu-x86-64-avx2")

    if os.path.exists(candidate):
        return candidate

    # Fall back to whatever's on PATH (e.g. `apt install stockfish`)
    return "stockfish"


STOCKFISH_PATH = _default_stockfish_path()

# Analysis defaults
DEFAULT_DEPTH = 15
DEFAULT_NUM_MOVES = 3

# Move classification thresholds (centipawn loss vs. the engine's best move)
MOVE_CLASSIFICATION_THRESHOLDS = {
    "best": 0,          # played the engine's top move
    "excellent": 20,    # within 0.20 pawns of best
    "good": 50,         # within 0.50 pawns
    "inaccuracy": 100,  # within 1.00 pawn
    "mistake": 250,     # within 2.50 pawns
    # anything above this centipawn loss is a "blunder"
}
