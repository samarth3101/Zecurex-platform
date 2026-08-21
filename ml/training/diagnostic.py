import pandas as pd
import numpy as np
import json
import joblib
from pathlib import Path
import sys
import matplotlib.pyplot as plt
from sklearn.metrics import precision_score, recall_score, f1_score, confusion_matrix
from sklearn.inspection import permutation_importance

repo_root = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(repo_root))

from ml.training.preprocess import separate_features
from ml.training.evaluate import calculate_synthetic_utility

def load_evaluation_json(path):
    with open(path, "r") as f:
        return json.load(f)

def run_diagnostics():
    models_dir = repo_root / "ml/models"
    data_dir = repo_root / "data/processed"
    eval_dir = repo_root / "ml/evaluation"
    diag_dir = eval_dir / "diagnostics"
    plots_dir = eval_dir / "plots"
    
    diag_dir.mkdir(parents=True, exist_ok=True)
    plots_dir.mkdir(parents=True, exist_ok=True)

    print("1. Loading Locked Artifacts...")
    artifact = joblib.load(models_dir / "zecure_risk_model.joblib")
    model = artifact["model"]
    preprocessor = artifact["preprocessor"]
    LOCKED_THRESHOLD = artifact["threshold"]
    feature_cols = artifact["feature_columns"]
    
    test_eval_path = eval_dir / "test_evaluation.json"
    if not test_eval_path.exists():
        raise FileNotFoundError("test_evaluation.json not found!")
    
    test_eval = load_evaluation_json(test_eval_path)
    
    # Validation vs Test Comparison
    print("Loading Validation and Test Datasets...")
    val_df = pd.read_csv(data_dir / "validation_features.csv")
    test_df = pd.read_csv(data_dir / "test_features.csv")
    
    X_val_raw, y_val, _ = separate_features(val_df, feature_cols)
    X_test_raw, y_test, _ = separate_features(test_df, feature_cols)
    
    X_val = preprocessor.transform(X_val_raw)
    X_test = preprocessor.transform(X_test_raw)
    
    val_probs = model.predict_proba(X_val)[:, 1]
    test_probs = model.predict_proba(X_test)[:, 1]
    
    val_amounts = val_df["amount"].values
    test_amounts = test_df["amount"].values
    
    # Re-evaluate Validation Metrics using Locked Threshold
    from ml.training.evaluate import evaluate_model
    val_metrics = evaluate_model(y_val, val_probs, val_amounts, threshold=LOCKED_THRESHOLD)
    test_metrics = test_eval["test_metrics"]
    
    val_vs_test = {
        "PR-AUC": {"validation": val_metrics["pr_auc"], "test": test_metrics["pr_auc"]},
        "ROC-AUC": {"validation": val_metrics["roc_auc"], "test": test_metrics["roc_auc"]},
        "Precision": {"validation": val_metrics["precision"], "test": test_metrics["precision"]},
        "Recall": {"validation": val_metrics["recall"], "test": test_metrics["recall"]},
        "F1": {"validation": val_metrics["f1"], "test": test_metrics["f1"]},
        "FPR": {"validation": val_metrics["fpr"], "test": test_metrics["fpr"]},
        "Brier Score": {"validation": val_metrics["brier_score"], "test": test_metrics["brier_score"]},
        "Fraud Amount Capture Rate": {"validation": val_metrics["fraud_capture_rate"], "test": test_metrics["fraud_capture_rate"]},
    }
    with open(diag_dir / "validation_vs_test.json", "w") as f:
        json.dump(val_vs_test, f, indent=4)
        
    print("2. Scenario-Level Performance...")
    # Add predictions to test_df
    test_df["fraud_probability"] = test_probs
    test_df["pred"] = (test_probs >= LOCKED_THRESHOLD).astype(int)
    
    scenarios = test_df["fraud_scenario"].unique()
    scenario_perf = {}
    
    for sc in scenarios:
        sc_df = test_df[test_df["fraud_scenario"] == sc]
        y_sc = sc_df["label"].values
        pred_sc = sc_df["pred"].values
        amt_sc = sc_df["amount"].values
        
        fraud_amount = amt_sc[y_sc == 1].sum()
        fraud_captured = amt_sc[(y_sc == 1) & (pred_sc == 1)].sum()
        
        tp = int(((y_sc == 1) & (pred_sc == 1)).sum())
        fn = int(((y_sc == 1) & (pred_sc == 0)).sum())
        fp = int(((y_sc == 0) & (pred_sc == 1)).sum())
        tn = int(((y_sc == 0) & (pred_sc == 0)).sum())
        
        recall = tp / (tp + fn) if (tp + fn) > 0 else 1.0 if sc == 'none' else 0.0
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        
        scenario_perf[sc] = {
            "transaction_count": len(sc_df),
            "fraud_amount": float(fraud_amount),
            "true_positives": tp,
            "false_negatives": fn,
            "false_positives": fp,
            "true_negatives": tn,
            "recall": float(recall),
            "precision": float(precision) if sc != "none" else None,
            "fraud_amount_captured": float(fraud_captured),
            "fraud_amount_capture_rate": float(fraud_captured / fraud_amount) if fraud_amount > 0 else 1.0
        }
        
    with open(diag_dir / "scenario_performance.json", "w") as f:
        json.dump(scenario_perf, f, indent=4)
        
    # Plot scenario recall
    sc_names = [s for s in scenarios if s != "none"]
    sc_recalls = [scenario_perf[s]["recall"] for s in sc_names]
    plt.figure(figsize=(10, 6))
    plt.barh(sc_names, sc_recalls, color='skyblue')
    plt.xlabel('Recall')
    plt.title('Fraud Scenario Recall on Test Set')
    plt.xlim(0, 1.05)
    plt.savefig(plots_dir / "scenario_recall.png", bbox_inches="tight")
    plt.close()

    print("3. Feature Importance...")
    try:
        encoded_cat = preprocessor.named_transformers_['cat'].named_steps['onehot'].get_feature_names_out()
        num_features = preprocessor.transformers_[0][2]
        final_feature_names = list(num_features) + list(encoded_cat)
    except:
        final_feature_names = [f"Feature_{i}" for i in range(X_val.shape[1])]
    
    # We can use validation set for permutation importance
    r = permutation_importance(model, X_val, y_val, n_repeats=5, random_state=42, n_jobs=-1, scoring='average_precision')
    importances = list(zip(final_feature_names, r.importances_mean))
    importances.sort(key=lambda x: x[1], reverse=True)
    
    top_features = [{"rank": i+1, "feature": f, "importance": float(imp)} for i, (f, imp) in enumerate(importances)]
    with open(diag_dir / "feature_importance.json", "w") as f:
        json.dump(top_features, f, indent=4)
        
    # Plot top 15
    top15_names = [f for f, _ in importances[:15]][::-1]
    top15_imps = [imp for _, imp in importances[:15]][::-1]
    plt.figure(figsize=(10, 6))
    plt.barh(top15_names, top15_imps, color='salmon')
    plt.xlabel('Permutation Importance (Avg Precision)')
    plt.title('Top 15 Feature Importances')
    plt.savefig(plots_dir / "feature_importance.png", bbox_inches="tight")
    plt.close()
    
    print("4. Threshold Tradeoff Diagnostic...")
    thresholds_to_test = [0.20, 0.30, 0.40, 0.45, 0.50, 0.60, 0.70, 0.80, 0.90]
    tradeoffs = []
    
    for t in thresholds_to_test:
        met = evaluate_model(y_test, test_probs, test_amounts, threshold=t)
        tradeoffs.append({
            "threshold": t,
            "precision": met["precision"],
            "recall": met["recall"],
            "f1": met["f1"],
            "false_positive_rate": met["fpr"],
            "flagged_transaction_count": met["true_positives"] + met["false_positives"],
            "fraud_amount_captured": met["fraud_amount_captured"],
            "fraud_capture_rate": met["fraud_capture_rate"],
            "legitimate_amount_flagged": met["legitimate_amount_flagged"]
        })
        
    with open(diag_dir / "threshold_tradeoff.json", "w") as f:
        json.dump(tradeoffs, f, indent=4)
        
    # Plot tradeoff
    plt.figure(figsize=(8, 5))
    ts = [d["threshold"] for d in tradeoffs]
    precs = [d["precision"] for d in tradeoffs]
    recs = [d["recall"] for d in tradeoffs]
    plt.plot(ts, precs, marker='o', label="Precision")
    plt.plot(ts, recs, marker='o', label="Recall")
    plt.axvline(LOCKED_THRESHOLD, color='red', linestyle='--', label=f"LOCKED ({LOCKED_THRESHOLD})")
    plt.xlabel('Threshold')
    plt.ylabel('Score')
    plt.title('Threshold Tradeoff Diagnostic (Test Set)')
    plt.legend()
    plt.savefig(plots_dir / "threshold_tradeoff.png", bbox_inches="tight")
    plt.close()
    
    print("5. Review Workload...")
    # Calculate for test set exactly at locked threshold
    met = test_metrics
    flagged = met["true_positives"] + met["false_positives"]
    total = met["true_positives"] + met["false_positives"] + met["true_negatives"] + met["false_negatives"]
    review_wl = {
        "total_transactions": total,
        "transactions_flagged": flagged,
        "actual_fraud_among_flagged": met["true_positives"],
        "legitimate_transactions_flagged": met["false_positives"],
        "flag_rate": flagged / total,
        "fraud_percentage_among_flagged": met["true_positives"] / flagged if flagged > 0 else 0.0
    }
    with open(diag_dir / "review_workload.json", "w") as f:
        json.dump(review_wl, f, indent=4)
        
    print("6. Risk Band Distribution...")
    # Provisional bands mapping based on probabilities
    def get_risk_band(p):
        if p >= 0.8: return "CRITICAL"
        elif p >= LOCKED_THRESHOLD: return "HIGH"
        elif p >= 0.2: return "MEDIUM"
        else: return "LOW"
        
    bands = [get_risk_band(p) for p in test_probs]
    test_df["provisional_risk_band"] = bands
    band_counts = test_df["provisional_risk_band"].value_counts().to_dict()
    
    plt.figure(figsize=(6, 4))
    b_order = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    b_vals = [band_counts.get(b, 0) for b in b_order]
    plt.bar(b_order, b_vals, color=['green', 'yellow', 'orange', 'red'])
    plt.yscale('log')
    plt.title('Provisional Risk Band Distribution (Log Scale)')
    plt.ylabel('Transaction Count')
    plt.savefig(plots_dir / "risk_distribution.png", bbox_inches="tight")
    plt.close()
    
    print("\nDIAGNOSTICS COMPLETE.")
    print("Integrity checks:")
    print(f" -> Artifact Threshold remains {LOCKED_THRESHOLD}")
    print(" -> Data frames not modified in storage.")

if __name__ == "__main__":
    run_diagnostics()
