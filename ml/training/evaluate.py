import numpy as np
import pandas as pd
from sklearn.metrics import (
    precision_score, recall_score, f1_score, 
    average_precision_score, roc_auc_score,
    confusion_matrix, brier_score_loss,
    precision_recall_curve, roc_curve
)
from sklearn.calibration import calibration_curve
import matplotlib.pyplot as plt
from pathlib import Path
from typing import Dict, Any

def calculate_synthetic_utility(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    amounts: np.ndarray,
    fixed_opex: float = 50.0,
    friction_pct: float = 0.001
) -> Dict[str, float]:
    """
    Calculates synthetic business utility based on the problem statement assumptions.
    Utility = Fraud Amount Captured - False Positive Cost
    False Positive Cost = Fixed OPEX + (Friction Pct * Legitimate Amount Flagged)
    """
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    
    fraud_amount_captured = amounts[(y_true == 1) & (y_pred == 1)].sum()
    total_fraud_amount = amounts[y_true == 1].sum()
    
    legitimate_amount_flagged = amounts[(y_true == 0) & (y_pred == 1)].sum()
    
    false_positive_cost = (fp * fixed_opex) + (legitimate_amount_flagged * friction_pct)
    utility = fraud_amount_captured - false_positive_cost
    
    return {
        "fraud_amount_captured": float(fraud_amount_captured),
        "total_fraud_amount": float(total_fraud_amount),
        "fraud_capture_rate": float(fraud_amount_captured / total_fraud_amount) if total_fraud_amount > 0 else 0.0,
        "legitimate_amount_flagged": float(legitimate_amount_flagged),
        "false_positive_cost": float(false_positive_cost),
        "synthetic_utility": float(utility),
        "false_positives": int(fp),
        "true_positives": int(tp),
        "false_negatives": int(fn),
        "true_negatives": int(tn)
    }

def evaluate_model(
    y_true: np.ndarray,
    y_probs: np.ndarray,
    amounts: np.ndarray,
    threshold: float = 0.5
) -> Dict[str, Any]:
    """Evaluates the model given a probability threshold."""
    y_pred = (y_probs >= threshold).astype(int)
    
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred, labels=[0, 1]).ravel()
    fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
    
    # Probabilistic metrics
    # Handle cases where all probabilities are constant (e.g. baseline)
    if len(np.unique(y_probs)) == 1:
        pr_auc = y_true.mean()
        roc_auc = 0.5
    else:
        pr_auc = average_precision_score(y_true, y_probs)
        roc_auc = roc_auc_score(y_true, y_probs)
        
    brier = brier_score_loss(y_true, y_probs)
    
    # Hard metrics
    precision = precision_score(y_true, y_pred, zero_division=0)
    recall = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    
    business_metrics = calculate_synthetic_utility(y_true, y_pred, amounts)
    
    return {
        "threshold": threshold,
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "pr_auc": float(pr_auc),
        "roc_auc": float(roc_auc),
        "fpr": float(fpr),
        "brier_score": float(brier),
        **business_metrics
    }

def generate_evaluation_plots(
    models_dict: Dict[str, Dict[str, np.ndarray]], 
    y_true: np.ndarray, 
    out_dir: Path
):
    """
    models_dict maps model_name -> {"probs": array_of_probs}
    """
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # 1. PR Curve
    plt.figure(figsize=(8, 6))
    for name, data in models_dict.items():
        if len(np.unique(data["probs"])) > 1:
            prec, rec, _ = precision_recall_curve(y_true, data["probs"])
            plt.plot(rec, prec, label=f"{name}")
    plt.xlabel("Recall")
    plt.ylabel("Precision")
    plt.title("Precision-Recall Curve")
    plt.legend()
    plt.savefig(out_dir / "pr_curve.png")
    plt.close()
    
    # 2. ROC Curve
    plt.figure(figsize=(8, 6))
    for name, data in models_dict.items():
        if len(np.unique(data["probs"])) > 1:
            fpr, tpr, _ = roc_curve(y_true, data["probs"])
            plt.plot(fpr, tpr, label=f"{name}")
    plt.plot([0, 1], [0, 1], linestyle='--', color='gray')
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve")
    plt.legend()
    plt.savefig(out_dir / "roc_curve.png")
    plt.close()
    
    # 3. Calibration Curve
    plt.figure(figsize=(8, 6))
    plt.plot([0, 1], [0, 1], "k:", label="Perfectly calibrated")
    for name, data in models_dict.items():
        if len(np.unique(data["probs"])) > 1:
            prob_true, prob_pred = calibration_curve(y_true, data["probs"], n_bins=10)
            plt.plot(prob_pred, prob_true, marker='o', label=name)
    plt.xlabel("Mean predicted probability")
    plt.ylabel("Fraction of positives")
    plt.title("Calibration Curve")
    plt.legend()
    plt.savefig(out_dir / "calibration_curve.png")
    plt.close()
