import argparse
import sys
import os
import json
import datetime
from pathlib import Path

# Add repo root to sys.path so we can import ml.data
repo_root = Path(__file__).resolve().parent.parent
sys.path.append(str(repo_root))

from ml.data.generator import build_dataset
from ml.data.validation import validate_dataset

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic payment risk dataset.")
    parser.add_argument("--rows", type=int, default=100000, help="Number of rows to generate")
    parser.add_argument("--fraud-rate", type=float, default=0.03, help="Approximate fraud rate")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--output-dir", type=str, default="data/synthetic", help="Output directory")
    
    args = parser.parse_args()
    
    print(f"Generating synthetic dataset with {args.rows} rows, seed {args.seed}...")
    
    # Generate data
    df = build_dataset(
        n_rows=int(args.rows * 1.5), # Ask for more to allow safe truncation
        fraud_rate=args.fraud_rate,
        seed=args.seed
    )
    
    if len(df) > args.rows:
        df = df.head(args.rows)
    
    print(f"Dataset generated. Rows: {len(df)}")
    
    # 70/15/15 Temporal Split
    # Since it's already sorted chronologically in generator, we just slice.
    train_end = int(len(df) * 0.7)
    val_end = train_end + int(len(df) * 0.15)
    
    train_df = df.iloc[:train_end]
    val_df = df.iloc[train_end:val_end]
    test_df = df.iloc[val_end:]
    
    # Validate
    print("Validating dataset integrity...")
    is_valid, errors = validate_dataset(train_df, val_df, test_df)
    
    if not is_valid:
        print("DATASET VALIDATION FAILED:")
        for err in errors:
            print(f" - {err}")
        sys.exit(1)
    
    print("Validation passed. Saving files...")
    
    # Save
    out_dir = Path(repo_root) / args.output_dir
    out_dir.mkdir(parents=True, exist_ok=True)
    
    train_df.to_csv(out_dir / "train.csv", index=False)
    val_df.to_csv(out_dir / "validation.csv", index=False)
    test_df.to_csv(out_dir / "test.csv", index=False)
    df.to_csv(out_dir / "transactions.csv", index=False)
    
    # Analytics
    fraud_df = df[df["label"] == 1]
    legit_df = df[df["label"] == 0]
    
    scenario_counts = fraud_df["fraud_scenario"].value_counts().to_dict()
    
    metadata = {
        "dataset_version": "1.0.0",
        "generation_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "random_seed": args.seed,
        "row_count": len(df),
        "fraud_count": len(fraud_df),
        "legitimate_count": len(legit_df),
        "fraud_rate": len(fraud_df) / len(df),
        "scenario_distribution": scenario_counts,
        "train_count": len(train_df),
        "validation_count": len(val_df),
        "test_count": len(test_df),
        "feature_list": list(df.columns),
        "ground_truth_fields": ["label", "fraud_scenario"],
        "synthetic_enrichment_fields": ["device_id", "ip_hash", "geo_region", "session_id"],
        "generation_method": "deterministic_simulation"
    }
    
    with open(out_dir / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=4)
        
    print("\nZECURE SYNTHETIC DATASET")
    print("────────────────────────────")
    print(f"Transactions:       {len(df):,}")
    print(f"Legitimate:          {len(legit_df):,}")
    print(f"Fraudulent:           {len(fraud_df):,}")
    print(f"Fraud rate:             {(len(fraud_df)/len(df))*100:.2f}%")
    print("\nFraud scenarios:")
    for scenario, count in scenario_counts.items():
        print(f"  {scenario:<20} {count:>5}")
        
    print("\nSplit:")
    print(f"  Train:                {len(train_df):,}")
    print(f"  Validation:           {len(val_df):,}")
    print(f"  Test:                 {len(test_df):,}")
    
    print("\nData quality:")
    print(f"  Duplicate IDs:              0") # Passed validation
    print(f"  Missing required fields:    0")
    print(f"  Leakage violations:        0")

if __name__ == "__main__":
    main()
