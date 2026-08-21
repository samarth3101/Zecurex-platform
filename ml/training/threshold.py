import numpy as np
from typing import Dict, Any, Tuple
from ml.training.evaluate import evaluate_model

def select_optimal_threshold(
    y_true: np.ndarray,
    y_probs: np.ndarray,
    amounts: np.ndarray,
    min_precision: float = 0.25
) -> Tuple[float, Dict[str, Any]]:
    """
    Selects the optimal threshold based on validation data.
    Maximizes Synthetic Utility subject to Precision >= min_precision.
    If no threshold meets the precision constraint, selects the one that maximizes F1.
    """
    candidate_thresholds = np.arange(0.05, 0.95, 0.05)
    best_threshold = 0.5
    best_utility = float('-inf')
    best_metrics = None
    
    # Fallback in case precision constraint is entirely impossible
    fallback_threshold = 0.5
    fallback_f1 = -1.0
    fallback_metrics = None
    
    for t in candidate_thresholds:
        metrics = evaluate_model(y_true, y_probs, amounts, threshold=t)
        
        # Track fallback
        if metrics["f1"] > fallback_f1:
            fallback_f1 = metrics["f1"]
            fallback_threshold = t
            fallback_metrics = metrics
            
        # Optimization logic
        if metrics["precision"] >= min_precision:
            if metrics["synthetic_utility"] > best_utility:
                best_utility = metrics["synthetic_utility"]
                best_threshold = t
                best_metrics = metrics
                
    if best_metrics is None:
        print(f"WARNING: No threshold met the minimum precision constraint of {min_precision}.")
        print(f"Falling back to threshold {fallback_threshold:.2f} which maximizes F1 ({fallback_f1:.4f}).")
        return fallback_threshold, fallback_metrics
        
    return best_threshold, best_metrics
