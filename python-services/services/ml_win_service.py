"""
Serves the trained win-probability model (XGBoost, trained on ~75K
positions sampled from ~20K real Lichess games -- see
python-services/ml_models/train_win_model.py for the training pipeline).

This sits ALONGSIDE the existing Stockfish-formula-based win probability
in stockfish_service.py, not replacing it -- the /api/win-probability-ml
endpoint lets the frontend (or a curious developer) compare a trained
model's opinion against the untrained engine-eval formula.
"""
import os
import joblib
import pandas as pd

from ml_models.live_features import extract_live_features, FEATURE_COLS

_MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml_models")

_model = None
_load_error = None


def _load_model():
    global _model, _load_error
    if _model is not None or _load_error is not None:
        return
    try:
        _model = joblib.load(os.path.join(_MODEL_DIR, "win_model_xgb.joblib"))
    except Exception as e:
        _load_error = str(e)


def get_ml_win_probability(fen, white_rating=None, black_rating=None):
    """
    Returns the trained model's win probability for White, plus the
    feature vector used, for transparency/debugging.
    """
    _load_model()
    if _model is None:
        return None, _load_error or "Model not loaded"

    feats = extract_live_features(fen, white_rating, black_rating)
    X = pd.DataFrame([feats])[FEATURE_COLS]
    win_prob_white = float(_model.predict_proba(X)[0][1])

    return {
        "win_probability_white": round(win_prob_white * 100, 1),
        "win_probability_black": round((1 - win_prob_white) * 100, 1),
        "features_used": feats,
        "model": "xgboost_v1_lichess_20k",
    }, None
