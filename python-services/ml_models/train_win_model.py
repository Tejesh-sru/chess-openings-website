"""
Trains and evaluates win-probability models on the engineered feature
dataset, comparing:
  1. Logistic regression (baseline)
  2. XGBoost (stronger model)
against the project's EXISTING heuristic: the Stockfish-eval-style
logistic formula applied to material_diff as a stand-in centipawn score.

Critically, the train/test split is done by game_id (GroupShuffleSplit),
not by row. Multiple sampled positions from the same game share an
outcome and are correlated -- splitting by row would leak information
from train into test and inflate apparent accuracy.
"""
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import GroupShuffleSplit
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, roc_auc_score, brier_score_loss, log_loss,
)
from xgboost import XGBClassifier

FEATURE_COLS = [
    "ply_number", "material_diff", "mobility_diff",
    "white_king_attackers", "black_king_attackers", "king_safety_diff",
    "white_castling_rights_lost", "black_castling_rights_lost",
    "pawn_diff", "rating_diff", "is_check", "white_to_move",
]


def naive_baseline_win_prob(material_diff): 
    """
    The project's CURRENT approach (from stockfish_service.py), repurposed
    here using material_diff (in pawns) as a stand-in for centipawn eval,
    since we don't have real Stockfish evals for this historical dataset.
    win% = 1 / (1 + 10^(-cp/400)), cp = material_diff * 100
    """
    cp = material_diff * 100
    return 1 / (1 + np.power(10, -cp / 400))


def group_train_test_split(df, test_size=0.2, seed=42):
    splitter = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=seed)
    train_idx, test_idx = next(splitter.split(df, groups=df["game_id"]))
    return df.iloc[train_idx].reset_index(drop=True), df.iloc[test_idx].reset_index(drop=True)


def evaluate(name, y_true, y_prob):
    y_pred = (y_prob >= 0.5).astype(int)
    metrics = {
        "model": name,
        "accuracy": accuracy_score(y_true, y_pred),
        "roc_auc": roc_auc_score(y_true, y_prob),
        "brier_score": brier_score_loss(y_true, y_prob),  # lower is better
        "log_loss": log_loss(y_true, y_prob),              # lower is better
    }
    return metrics


def main():
    df = pd.read_csv("../data/chess_features.csv")
    train_df, test_df = group_train_test_split(df, test_size=0.2)

    print(f"Train: {len(train_df)} samples from {train_df['game_id'].nunique()} games")
    print(f"Test:  {len(test_df)} samples from {test_df['game_id'].nunique()} games")

    # Sanity check: no game_id should appear in both splits.
    overlap = set(train_df["game_id"]) & set(test_df["game_id"])
    assert len(overlap) == 0, f"Data leakage! {len(overlap)} games in both splits"
    print(f"Leakage check passed: 0 games shared between train/test\n")

    X_train, y_train = train_df[FEATURE_COLS], train_df["label_white_wins"]
    X_test, y_test = test_df[FEATURE_COLS], test_df["label_white_wins"]

    results = []

    # --- Baseline: the project's existing formula, no training at all ---
    baseline_prob = naive_baseline_win_prob(test_df["material_diff"].values)
    results.append(evaluate("Current formula (material->logistic, untrained)", y_test, baseline_prob))

    # --- Model 1: Logistic Regression ---
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    logreg = LogisticRegression(max_iter=1000)
    logreg.fit(X_train_scaled, y_train)
    logreg_prob = logreg.predict_proba(X_test_scaled)[:, 1]
    results.append(evaluate("Logistic Regression (trained)", y_test, logreg_prob))

    # --- Model 2: XGBoost ---
    xgb = XGBClassifier(
        n_estimators=150, max_depth=4, learning_rate=0.1,
        subsample=0.8, colsample_bytree=0.8,
        eval_metric="logloss", random_state=42,
    )
    xgb.fit(X_train, y_train)
    xgb_prob = xgb.predict_proba(X_test)[:, 1]
    results.append(evaluate("XGBoost (trained)", y_test, xgb_prob))

    print(f"{'Model':<45} {'Acc':>7} {'ROC-AUC':>9} {'Brier':>8} {'LogLoss':>8}")
    print("-" * 80)
    for r in results:
        print(f"{r['model']:<45} {r['accuracy']:>7.3f} {r['roc_auc']:>9.3f} {r['brier_score']:>8.4f} {r['log_loss']:>8.4f}")

    print("\nFeature importances (XGBoost):")
    importances = sorted(zip(FEATURE_COLS, xgb.feature_importances_), key=lambda x: -x[1])
    for feat, imp in importances:
        print(f"  {feat:<30} {imp:.4f}")

    # Persist the best model + scaler for serving.
    joblib.dump(xgb, "win_model_xgb.joblib")
    joblib.dump(logreg, "win_model_logreg.joblib")
    joblib.dump(scaler, "win_model_scaler.joblib")
    print("\nSaved win_model_xgb.joblib, win_model_logreg.joblib, win_model_scaler.joblib")

    return results


if __name__ == "__main__":
    main()
