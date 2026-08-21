import os
import sys
import pandas as pd
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent
sys.path.append(str(repo_root))

from ml.data.generator import build_dataset
from ml.data.validation import validate_dataset

def test_deterministic_generation():
    df1 = build_dataset(n_rows=100, fraud_rate=0.03, seed=42)
    df2 = build_dataset(n_rows=100, fraud_rate=0.03, seed=42)
    
    assert df1.equals(df2), "Dataset generation is not deterministic!"

def test_dataset_validation_passes():
    df = build_dataset(n_rows=300, fraud_rate=0.1, seed=123)
    
    train_end = int(len(df) * 0.7)
    val_end = train_end + int(len(df) * 0.15)
    
    train_df = df.iloc[:train_end]
    val_df = df.iloc[train_end:val_end]
    test_df = df.iloc[val_end:]
    
    is_valid, errors = validate_dataset(train_df, val_df, test_df)
    assert is_valid, f"Validation failed: {errors}"

def test_temporal_ordering_enforced():
    df = build_dataset(n_rows=100, fraud_rate=0.1, seed=456)
    
    # Verify sorted chronologically
    timestamps = pd.to_datetime(df["timestamp"])
    assert timestamps.is_monotonic_increasing, "Dataset is not sorted chronologically!"
