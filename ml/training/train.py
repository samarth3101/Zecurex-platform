import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.dummy import DummyClassifier

def get_candidate_models(random_state: int = 42) -> dict:
    """Returns a dictionary of candidate models to evaluate."""
    return {
        "Trivial_Baseline": DummyClassifier(strategy="constant", constant=0),
        
        "Logistic_Regression": LogisticRegression(
            class_weight="balanced", 
            random_state=random_state,
            max_iter=1000
        ),
        
        "Random_Forest": RandomForestClassifier(
            n_estimators=100,
            class_weight="balanced_subsample",
            max_depth=10,
            min_samples_leaf=5,
            random_state=random_state,
            n_jobs=-1
        ),
        
        "HistGBM": HistGradientBoostingClassifier(
            learning_rate=0.05,
            max_iter=200,
            max_depth=8,
            min_samples_leaf=20,
            # class_weight is supported in newer scikit-learn for HistGBM
            class_weight="balanced",
            random_state=random_state
        )
    }
