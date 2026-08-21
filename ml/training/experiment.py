import pandas as pd
import numpy as np
import time
import json
import joblib
from pathlib import Path
import sys

repo_root = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(repo_root))

from sklearn.inspection import permutation_importance
from ml.training.preprocess import load_feature_metadata, separate_features, create_preprocessing_pipeline
from ml.training.train import get_candidate_models
from ml.training.evaluate import evaluate_model, generate_evaluation_plots
from ml.training.threshold import select_optimal_threshold

def main():
    print("=========================================")
    print("ZECURE PHASE 5D: ML RISK ENGINE TRAINING")
    print("=========================================\n")
    
    data_dir = repo_root / "data/processed"
    models_dir = repo_root / "ml/models"
    eval_dir = repo_root / "ml/evaluation"
    plots_dir = eval_dir / "plots"
    
    models_dir.mkdir(parents=True, exist_ok=True)
    eval_dir.mkdir(parents=True, exist_ok=True)
    plots_dir.mkdir(parents=True, exist_ok=True)
    
    print("1. Loading Feature Metadata...")
    feature_cols = load_feature_metadata(data_dir / "feature_metadata.json")
    print(f"Loaded {len(feature_cols)} explicit predictive features.")
    
    print("\n2. Loading Train and Validation Data...")
    train_df = pd.read_csv(data_dir / "train_features.csv")
    val_df = pd.read_csv(data_dir / "validation_features.csv")
    
    print(f"Train Rows: {len(train_df):,} | Val Rows: {len(val_df):,}")
    
    # Store amounts for utility calculation
    train_amounts = train_df["amount"].values
    val_amounts = val_df["amount"].values
    
    print("\n3. Separating Features and Ground Truth (Enforcing strict identifier exclusion)...")
    X_train_raw, y_train, _ = separate_features(train_df, feature_cols)
    X_val_raw, y_val, _ = separate_features(val_df, feature_cols)
    
    fraud_rate_train = y_train.mean() * 100
    print(f"Train Fraud Rate: {fraud_rate_train:.2f}%")
    
    print("\n4. Fitting Preprocessing Pipeline on TRAIN only...")
    preprocessor = create_preprocessing_pipeline(feature_cols)
    
    X_train = preprocessor.fit_transform(X_train_raw)
    X_val = preprocessor.transform(X_val_raw)
    
    print(f"Processed feature matrix shape: {X_train.shape}")
    
    print("\n5. Training Candidate Models...")
    candidates = get_candidate_models(random_state=42)
    
    model_evaluations = {}
    validation_probs = {}
    
    for name, model in candidates.items():
        print(f" -> Training {name}...")
        start_t = time.time()
        
        # Fit model
        model.fit(X_train, y_train)
        
        # Predict on validation
        probs = model.predict_proba(X_val)[:, 1]
        validation_probs[name] = {"probs": probs}
        
        # Initial evaluation at 0.5 (just for model comparison)
        metrics = evaluate_model(y_val, probs, val_amounts, threshold=0.5)
        metrics["runtime"] = time.time() - start_t
        model_evaluations[name] = metrics
        
    print("\n6. Comparing Models on Validation Set (Threshold = 0.5):")
    print(f"{'Model':<25} {'PR-AUC':<10} {'ROC-AUC':<10} {'F1':<10} {'Recall':<10}")
    print("-" * 65)
    for name, metrics in model_evaluations.items():
        print(f"{name:<25} {metrics['pr_auc']:<10.4f} {metrics['roc_auc']:<10.4f} {metrics['f1']:<10.4f} {metrics['recall']:<10.4f}")
        
    # Select the best model based on Validation PR-AUC (excluding the trivial baseline)
    best_model_name = max(
        [name for name in candidates.keys() if name != "Trivial_Baseline"], 
        key=lambda n: model_evaluations[n]["pr_auc"]
    )
    best_model = candidates[best_model_name]
    best_probs = validation_probs[best_model_name]["probs"]
    
    print(f"\n[WINNER]: {best_model_name} selected based on Validation PR-AUC.")
    
    print("\n7. Tuning Threshold on Validation Set...")
    opt_threshold, opt_metrics = select_optimal_threshold(
        y_val, best_probs, val_amounts, min_precision=0.25
    )
    
    print(f"Optimal Threshold selected: {opt_threshold:.2f}")
    print(f"Validation Utility at {opt_threshold:.2f}: ₹{opt_metrics['synthetic_utility']:,.2f}")
    
    print("\n8. Generating Validation Plots...")
    generate_evaluation_plots(validation_probs, y_val, plots_dir)
    
    print("\n9. Calculating Feature Importance (Permutation) on Validation Set...")
    # Compute permutation importance
    r = permutation_importance(best_model, X_val, y_val, n_repeats=5, random_state=42, n_jobs=-1, scoring='average_precision')
    
    # We need to map back the transformed feature names
    # Get feature names from column transformer
    num_features = feature_cols.copy() # Simplification: assumes same order or exact mapping
    try:
        encoded_cat = preprocessor.named_transformers_['cat'].named_steps['onehot'].get_feature_names_out()
        num_features = preprocessor.transformers_[0][2] # numerical features list
        final_feature_names = list(num_features) + list(encoded_cat)
    except:
        final_feature_names = [f"Feature_{i}" for i in range(X_val.shape[1])]
        
    importances = list(zip(final_feature_names, r.importances_mean))
    importances.sort(key=lambda x: x[1], reverse=True)
    
    print(f"Top 5 Risk Signals for {best_model_name}:")
    for feat, imp in importances[:5]:
        print(f" - {feat}: {imp:.4f}")
        
    # Save the pipeline
    model_artifact = {
        "model": best_model,
        "preprocessor": preprocessor,
        "threshold": opt_threshold,
        "model_name": best_model_name,
        "feature_columns": feature_cols
    }
    artifact_path = models_dir / "zecure_risk_model.joblib"
    joblib.dump(model_artifact, artifact_path)
    
    print("\n" + "="*50)
    print("MODEL LOCKED")
    print("FEATURE SET LOCKED")
    print("PREPROCESSING LOCKED")
    print("THRESHOLD LOCKED")
    print("TEST EVALUATION BEGINNING")
    print("="*50 + "\n")
    
    # 10. SACRED TEST EVALUATION
    test_df = pd.read_csv(data_dir / "test_features.csv")
    test_amounts = test_df["amount"].values
    X_test_raw, y_test, _ = separate_features(test_df, feature_cols)
    
    X_test = preprocessor.transform(X_test_raw)
    test_probs = best_model.predict_proba(X_test)[:, 1]
    
    test_metrics = evaluate_model(y_test, test_probs, test_amounts, threshold=opt_threshold)
    
    print("HELD-OUT TEST RESULTS:")
    print("---------------------------------")
    print(f"Model: {best_model_name}")
    print(f"Threshold: {opt_threshold:.2f}")
    print("---------------------------------")
    print(f"PR-AUC:      {test_metrics['pr_auc']:.4f}")
    print(f"ROC-AUC:     {test_metrics['roc_auc']:.4f}")
    print(f"Precision:   {test_metrics['precision']:.4f}")
    print(f"Recall:      {test_metrics['recall']:.4f}")
    print(f"F1 Score:    {test_metrics['f1']:.4f}")
    print(f"FPR:         {test_metrics['fpr']:.4f}")
    print(f"Brier Score: {test_metrics['brier_score']:.4f}")
    print("---------------------------------")
    print("Confusion Matrix (TN, FP, FN, TP):")
    print(f"{test_metrics['true_negatives']}, {test_metrics['false_positives']}, {test_metrics['false_negatives']}, {test_metrics['true_positives']}")
    print("---------------------------------")
    print(f"Total Fraud Amount:        ₹{test_metrics['total_fraud_amount']:,.2f}")
    print(f"Fraud Amount Captured:     ₹{test_metrics['fraud_amount_captured']:,.2f}")
    print(f"Fraud Capture Rate:        {test_metrics['fraud_capture_rate']*100:.1f}%")
    print(f"Legitimate Amount Flagged: ₹{test_metrics['legitimate_amount_flagged']:,.2f}")
    print(f"False Positive Cost:       ₹{test_metrics['false_positive_cost']:,.2f}")
    print(f"Synthetic Utility:         ₹{test_metrics['synthetic_utility']:,.2f}")
    print("=========================================\n")
    
    # Save test evaluation report
    test_report = {
        "experiment_id": "exp_phase5d",
        "timestamp": time.time(),
        "model_name": best_model_name,
        "threshold": opt_threshold,
        "test_metrics": test_metrics,
        "top_features": [{"feature": f, "importance": imp} for f, imp in importances[:15]]
    }
    
    with open(eval_dir / "test_evaluation.json", "w") as f:
        json.dump(test_report, f, indent=4)
        
    print(f"Artifacts saved to {models_dir}")
    print(f"Reports saved to {eval_dir}")

if __name__ == "__main__":
    main()
