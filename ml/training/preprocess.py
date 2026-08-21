import pandas as pd
from typing import List, Tuple
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
import json
from pathlib import Path

# High-cardinality IDs and targets that MUST NOT be used as predictive features
GROUND_TRUTH_COLUMNS = [
    "label",
    "fraud_scenario"
]

METADATA_COLUMNS = [
    "transaction_id",
    "customer_id",
    "merchant_id",
    "razorpay_payment_id",
    "razorpay_order_id",
    "timestamp",
    "ip_hash",         # Handled securely inside features, raw hash shouldn't be passed to model
    "device_id"
]

CATEGORICAL_FEATURES = [
    "payment_method",
    "status",          # Captured vs failed
    "geo_region",
    "currency"
]

def load_feature_metadata(metadata_path: str) -> List[str]:
    """Load the feature names generated in Phase 5C."""
    with open(metadata_path, 'r') as f:
        meta = json.load(f)
        return [f["feature_name"] for f in meta["features"]]

def separate_features(df: pd.DataFrame, feature_columns: List[str]) -> Tuple[pd.DataFrame, pd.Series, pd.DataFrame]:
    """
    Safely separates the raw dataframe into:
    X: Only allowed model features.
    y: Ground truth labels.
    meta: High-cardinality IDs and timestamps.
    """
    # Ensure no leakage
    for col in GROUND_TRUTH_COLUMNS + METADATA_COLUMNS:
        if col in feature_columns:
            raise ValueError(f"Leakage detected! {col} is marked as a predictive feature.")
            
    # X contains ONLY the explicitly defined feature columns
    available_features = [c for c in feature_columns if c in df.columns]
    X = df[available_features].copy()
    
    # y contains the target
    y = df["label"].copy() if "label" in df.columns else None
    
    # Meta contains the metadata for auditing/evaluation
    available_meta = [c for c in METADATA_COLUMNS if c in df.columns]
    meta = df[available_meta].copy() if available_meta else None
    
    return X, y, meta

def create_preprocessing_pipeline(feature_columns: List[str]) -> ColumnTransformer:
    """Creates a Scikit-Learn preprocessing pipeline."""
    # Identify which of our features are categorical vs numerical
    cat_cols = [c for c in feature_columns if c in CATEGORICAL_FEATURES]
    num_cols = [c for c in feature_columns if c not in CATEGORICAL_FEATURES]
    
    # Numerical pipeline: Impute NaN with median (though our feature builder uses -1.0 sentinels, 
    # it's safe to have this) and scale.
    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    # Categorical pipeline: Impute with 'unknown' and OneHotEncode
    cat_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='constant', fill_value='unknown')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_pipeline, num_cols),
            ('cat', cat_pipeline, cat_cols)
        ],
        remainder='drop'  # Drop anything not explicitly specified
    )
    
    return preprocessor
