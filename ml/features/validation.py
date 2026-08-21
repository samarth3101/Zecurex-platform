import pandas as pd
from typing import Tuple, List

def validate_features(
    train_df: pd.DataFrame, 
    val_df: pd.DataFrame, 
    test_df: pd.DataFrame
) -> Tuple[bool, List[str]]:
    errors = []
    
    for name, df in [("train", train_df), ("val", val_df), ("test", test_df)]:
        # 1. No label leakage in columns (except the exact ground truth columns)
        feature_cols = [c for c in df.columns if c not in ["label", "fraud_scenario", "transaction_id", "timestamp"]]
        for col in feature_cols:
            if "label" in col.lower() or "fraud" in col.lower() or "scenario" in col.lower():
                errors.append(f"{name}: Feature {col} looks like a leaked label.")
                
        # 2. No invalid negative counts (counts should be >= 0)
        count_cols = [c for c in df.columns if "count" in c.lower() or "attempts" in c.lower()]
        for col in count_cols:
            if df[col].min() < 0:
                errors.append(f"{name}: Negative count in {col}.")
                
        # 3. No impossible rates (rates should be -1.0 or between 0 and 1)
        rate_cols = [c for c in df.columns if "rate" in c.lower()]
        for col in rate_cols:
            invalid_rates = df[(df[col] < -1.0) | ((df[col] > 1.0) & (df[col] != -1.0))]
            if not invalid_rates.empty:
                errors.append(f"{name}: Invalid rates in {col}.")
                
        # 4. No NaNs or infs
        for col in feature_cols:
            if df[col].isnull().any():
                errors.append(f"{name}: NaN found in {col}.")
            if df[col].dtype in ['float64', 'float32'] and not df[col].replace([float('inf'), float('-inf')], pd.NA).notnull().all():
                errors.append(f"{name}: Inf found in {col}.")
                
    # 5. Temporal ordering preserved across splits
    train_max_ts = pd.to_datetime(train_df["timestamp"]).max()
    val_min_ts = pd.to_datetime(val_df["timestamp"]).min()
    val_max_ts = pd.to_datetime(val_df["timestamp"]).max()
    test_min_ts = pd.to_datetime(test_df["timestamp"]).min()
    
    if train_max_ts > val_min_ts:
        errors.append(f"Temporal violation: Train max ts ({train_max_ts}) > Val min ts ({val_min_ts})")
    if val_max_ts > test_min_ts:
        errors.append(f"Temporal violation: Val max ts ({val_max_ts}) > Test min ts ({test_min_ts})")

    return len(errors) == 0, errors
