import pandas as pd
from typing import Tuple

def validate_dataset(
    train_df: pd.DataFrame, 
    val_df: pd.DataFrame, 
    test_df: pd.DataFrame
) -> Tuple[bool, list]:
    errors = []
    
    # 1. No overlapping transaction IDs
    train_ids = set(train_df["transaction_id"])
    val_ids = set(val_df["transaction_id"])
    test_ids = set(test_df["transaction_id"])
    
    if len(train_ids.intersection(val_ids)) > 0:
        errors.append("Leakage: train and validation contain overlapping transaction_ids.")
    if len(train_ids.intersection(test_ids)) > 0:
        errors.append("Leakage: train and test contain overlapping transaction_ids.")
    if len(val_ids.intersection(test_ids)) > 0:
        errors.append("Leakage: validation and test contain overlapping transaction_ids.")
        
    # 2. No overlapping Razorpay Payment IDs
    train_r_ids = set(train_df["razorpay_payment_id"])
    val_r_ids = set(val_df["razorpay_payment_id"])
    test_r_ids = set(test_df["razorpay_payment_id"])
    
    if len(train_r_ids.intersection(val_r_ids)) > 0:
        errors.append("Leakage: train and validation contain overlapping razorpay_payment_ids.")
    if len(train_r_ids.intersection(test_r_ids)) > 0:
        errors.append("Leakage: train and test contain overlapping razorpay_payment_ids.")
    
    # 3. Temporal Ordering
    train_df = train_df.sort_values(by="timestamp")
    val_df = val_df.sort_values(by="timestamp")
    test_df = test_df.sort_values(by="timestamp")
    
    train_max_ts = train_df["timestamp"].max()
    val_min_ts = val_df["timestamp"].min()
    val_max_ts = val_df["timestamp"].max()
    test_min_ts = test_df["timestamp"].min()
    
    if train_max_ts > val_min_ts:
        errors.append(f"Temporal violation: Train max ts ({train_max_ts}) > Val min ts ({val_min_ts})")
    if val_max_ts > test_min_ts:
        errors.append(f"Temporal violation: Val max ts ({val_max_ts}) > Test min ts ({test_min_ts})")
        
    # 4. Check for obvious label leakage in inputs
    features_to_check = ["label", "fraud_scenario"]
    for df_name, df in [("train", train_df), ("val", val_df), ("test", test_df)]:
        for col in df.columns:
            if col not in features_to_check and "fraud" in col.lower():
                errors.append(f"Potential leakage in {df_name}: column {col} contains 'fraud'.")
                
    # 5. Missing required fields
    required = ["transaction_id", "merchant_id", "customer_id", "timestamp", "amount", "currency", "status"]
    for df_name, df in [("train", train_df), ("val", val_df), ("test", test_df)]:
        for req in required:
            if df[req].isnull().any():
                errors.append(f"Data quality: {df_name} contains nulls in required field {req}.")
                
    # 6. Duplicates in full dataset
    full_df = pd.concat([train_df, val_df, test_df])
    if full_df["transaction_id"].duplicated().any():
        errors.append("Data quality: Duplicate transaction_ids found globally.")
    if full_df["razorpay_payment_id"].duplicated().any():
        errors.append("Data quality: Duplicate razorpay_payment_id found globally.")

    return len(errors) == 0, errors
