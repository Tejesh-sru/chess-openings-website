from flask import Flask, jsonify, request
from flask_cors import CORS

from services.stockfish_service import (
    init_engine,
    get_best_moves,
    evaluate_position, 
    analyze_game,
)
from services.ml_win_service import get_ml_win_probability

app = Flask(__name__)
CORS(app)

# Initialize Stockfish when the server starts
with app.app_context():
    init_engine()


@app.route('/')
def home():
    return jsonify({"message": "Chess AI Service is running!"})


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})


@app.route('/api/analyze', methods=['POST'])
def analyze_position():
    """Move prediction: top N candidate moves for a position."""
    data = request.json or {}
    fen = data.get('fen', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    num_moves = data.get('num_moves', 3)
    depth = data.get('depth', 15)

    moves = get_best_moves(fen, num_moves=num_moves, depth=depth)

    if not moves:
        return jsonify({
            "status": "error",
            "message": "Failed to analyze position. Check Stockfish installation.",
            "fen": fen
        }), 500

    return jsonify({
        "status": "success",
        "fen": fen,
        "suggested_moves": moves
    })


@app.route('/api/win-probability', methods=['POST'])
def win_probability():
    """Win prediction: convert engine eval into a win% for the current position."""
    data = request.json or {}
    fen = data.get('fen', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    depth = data.get('depth', 15)

    result = evaluate_position(fen, depth=depth)

    if result is None:
        return jsonify({
            "status": "error",
            "message": "Failed to evaluate position. Check Stockfish installation.",
            "fen": fen
        }), 500

    return jsonify({
        "status": "success",
        **result
    })


@app.route('/api/win-probability-ml', methods=['POST'])
def win_probability_ml():
    """
    Win prediction via a TRAINED model (XGBoost, fit on ~75K positions
    sampled from ~20K real Lichess games), as opposed to the untrained
    logistic-formula version above. Lets you compare both side by side.
    """
    data = request.json or {}
    fen = data.get('fen', 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    white_rating = data.get('white_rating')
    black_rating = data.get('black_rating')

    result, error = get_ml_win_probability(fen, white_rating, black_rating)

    if result is None:
        return jsonify({
            "status": "error",
            "message": f"ML model unavailable: {error}",
            "fen": fen
        }), 500

    return jsonify({
        "status": "success",
        "fen": fen,
        **result
    })


@app.route('/api/analyze-game', methods=['POST'])
def analyze_full_game():
    """
    Game analysis: walk through a list of moves (SAN or UCI), classify each
    move (best/excellent/good/inaccuracy/mistake/blunder), and return a
    per-move report plus a summary breakdown.
    """
    data = request.json or {}
    moves = data.get('moves', [])
    starting_fen = data.get('starting_fen')
    depth = data.get('depth', 12)

    if not moves:
        return jsonify({
            "status": "error",
            "message": "No moves provided to analyze."
        }), 400

    result = analyze_game(moves, depth=depth, starting_fen=starting_fen)

    if result is None:
        return jsonify({
            "status": "error",
            "message": "Failed to analyze game. Check Stockfish installation."
        }), 500

    return jsonify({
        "status": "success",
        **result
    })


if __name__ == '__main__':
    app.run(debug=True, port=5001)
