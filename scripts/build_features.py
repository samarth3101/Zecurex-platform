import argparse
import sys
import json
import datetime
import time
from pathlib import Path
import pandas as pd

# Add repo root to sys.path
repo_root = Path(__file__).resolve().parent.parent
sys.path.append(str(repo_root))

from ml.features.builder import FeatureBuilder
from ml.features.validation import validate_features

def main():
    parser = argparse.ArgumentParser(description="Generate point-in-time features.")
    parser.add_argument("--input", type=str, default="data/synthetic", help="Input directory")
    parser.add_argument("--output", type=str, default="data/processed", help="Output directory")
    args = parser.parse_args()
    
    input_dir = Path(repo_root) / args.input
    output_dir = Path(repo_root) / args.output
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Loading datasets from {input_dir}...")
    
    # We load transactions.csv to have the complete chronological dataset
    if not (input_dir / "transactions.csv").exists():
        print(f"Error: transactions.csv not found in {input_dir}")
        sys.exit(1)
        
    df = pd.read_csv(input_dir / "transactions.csv")
    train_df_orig = pd.read_csv(input_dir / "train.csv")
    val_df_orig = pd.read_csv(input_dir / "validation.csv")
    test_df_orig = pd.read_csv(input_dir / "test.csv")
    
    print(f"Loaded {len(df)} total transactions.")
    
    start_time = time.time()
    
    builder = FeatureBuilder()
    features_df = builder.process_dataset(df)
    
    runtime = time.time() - start_time
    print(f"Feature generation completed in {runtime:.2f} seconds.")
    
    # Verify we didn't lose any rows
    assert len(features_df) == len(df), "Row count mismatch after feature generation!"
    
    # Split using original lengths
    train_len = len(train_df_orig)
    val_len = len(val_df_orig)
    
    # Because both processes sort chronologically, the indices align.
    train_feat = features_df.iloc[:train_len].copy()
    val_feat = features_df.iloc[train_len:train_len+val_len].copy()
    test_feat = features_df.iloc[train_len+val_len:].copy()
    
    # Ensure IDs match perfectly
    assert all(train_feat["transaction_id"].values == train_df_orig["transaction_id"].values), "Train split IDs do not match!"
    assert all(test_feat["transaction_id"].values == test_df_orig["transaction_id"].values), "Test split IDs do not match!"
    
    print("Validating feature dataset...")
    is_valid, errors = validate_features(train_feat, val_feat, test_feat)
    if not is_valid:
        print("FEATURE VALIDATION FAILED:")
        for err in errors:
            print(f" - {err}")
        sys.exit(1)
        
    print("Validation passed. Saving feature datasets...")
    
    train_feat.to_csv(output_dir / "train_features.csv", index=False)
    val_feat.to_csv(output_dir / "validation_features.csv", index=False)
    test_feat.to_csv(output_dir / "test_features.csv", index=False)
    
    # Generate metadata
    metadata = {
        "feature_version": "1.0.0",
        "generation_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "source_dataset_dir": str(args.input),
        "row_count": len(features_df),
        "runtime_seconds": round(runtime, 2),
        "features": []
    }
    
    # Exclude metadata columns
    exclude = ["transaction_id", "timestamp", "label", "fraud_scenario"]
    feature_cols = [c for c in features_df.columns if c not in exclude]
    
    for col in feature_cols:
        metadata["features"].append({
            "feature_name": col,
            "data_type": str(features_df[col].dtype),
            "point_in_time_safe": True,
            "missing_value_strategy": "sentinel (-1.0) for rates/averages, 0 for counts"
        })
        
    with open(output_dir / "feature_metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
    print("\nZECURE FEATURE DATASET")
    print("────────────────────────────")
    print(f"Total Features:      {len(feature_cols)}")
    print(f"Train Rows:          {len(train_feat):,}")
    print(f"Validation Rows:     {len(val_feat):,}")
    print(f"Test Rows:           {len(test_feat):,}")
    print("Point-in-time Safe:  True (Verified)")

if __name__ == "__main__":
    main()
