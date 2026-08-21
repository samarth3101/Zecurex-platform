import asyncio
import sys
import pandas as pd
from pathlib import Path
from datetime import datetime, timezone

repo_root = Path(__file__).resolve().parent.parent
sys.path.append(str(repo_root))
sys.path.append(str(repo_root / "apps" / "api"))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.services.risk_engine.feature_adapter import FeatureAdapter
from app.models.transaction import Transaction

async def run_parity_test():
    # 1. Load offline test dataset features
    offline_features_path = repo_root / "data" / "processed" / "test_features.csv"
    if not offline_features_path.exists():
        print(f"Error: {offline_features_path} not found.")
        return
        
    offline_df = pd.read_csv(offline_features_path)
    
    # 2. Select 10 transactions
    sample_df = offline_df.head(10).copy()
    
    # We also need the raw transaction data to pass to the FeatureAdapter
    # Actually, the FeatureAdapter expects current_tx dict.
    # Where can we get the raw transaction data?
    # From the database! We can query the database for the transactions with these transaction_ids.
    
    # Load raw transactions
    raw_tx_path = repo_root / "data" / "synthetic" / "transactions.csv"
    raw_df = pd.read_csv(raw_tx_path)
    # Parse timestamp
    raw_df["timestamp"] = pd.to_datetime(raw_df["timestamp"])
    
    async with AsyncSessionLocal() as db:
        results = []
        for _, row in sample_df.iterrows():
            tx_id = row["transaction_id"]
            
            # Find the raw transaction
            tx_raw = raw_df[raw_df["transaction_id"] == tx_id].iloc[0]
            
            # Find historical context (e.g. up to 90 days before)
            # To ensure full parity, we insert all historical transactions for this customer/merchant
            cid = tx_raw["customer_id"]
            mid = tx_raw["merchant_id"]
            did = tx_raw.get("device_id")
            ip = tx_raw.get("ip_hash")
            ts = tx_raw["timestamp"]
            
            # Build query for raw_df to get historical records
            # Actually, to make it simple, let's just grab all transactions for this customer and merchant that occurred before ts
            mask = (
                (raw_df["timestamp"] < ts) &
                ((raw_df["customer_id"] == cid) | (raw_df["merchant_id"] == mid))
            )
            history_df = raw_df[mask]
            
            # Insert historical records into DB
            for _, h_row in history_df.iterrows():
                # Check if exists first
                stmt = select(Transaction).where(Transaction.razorpay_payment_id == h_row["transaction_id"])
                res = await db.execute(stmt)
                if not res.scalar_one_or_none():
                    h_tx = Transaction(
                        razorpay_payment_id=h_row["transaction_id"],
                        amount=h_row["amount"],
                        currency="INR",
                        status=h_row["status"],
                        method=h_row["payment_method"],
                        international=h_row.get("international", False),
                        customer_id=h_row["customer_id"],
                        merchant_id=h_row["merchant_id"],
                        device_id=h_row.get("device_id") if pd.notna(h_row.get("device_id")) else None,
                        ip_hash=h_row.get("ip_hash") if pd.notna(h_row.get("ip_hash")) else None,
                        geo_region=h_row.get("geo_region") if pd.notna(h_row.get("geo_region")) else None,
                        created_at=h_row["timestamp"]
                    )
                    db.add(h_tx)
            await db.commit()
            
            # Convert to dict format expected by FeatureAdapter
            current_tx = {
                "transaction_id": tx_raw["transaction_id"],
                "amount": tx_raw["amount"],
                "currency": "INR",
                "status": tx_raw["status"],
                "method": tx_raw["payment_method"],
                "international": tx_raw.get("international", False),
                "customer_id": tx_raw["customer_id"],
                "merchant_id": tx_raw["merchant_id"],
                "device_id": tx_raw.get("device_id") if pd.notna(tx_raw.get("device_id")) else None,
                "ip_hash": tx_raw.get("ip_hash") if pd.notna(tx_raw.get("ip_hash")) else None,
                "geo_region": tx_raw.get("geo_region") if pd.notna(tx_raw.get("geo_region")) else None,
                "timestamp": tx_raw["timestamp"]
            }
            
            # 3. Generate online features
            online_features = await FeatureAdapter.build_features(current_tx, db)
            
            # 4. Compare features
            mismatches = []
            for col in sample_df.columns:
                if col in ["label", "fraud_scenario", "transaction_id", "timestamp"]:
                    continue
                    
                offline_val = row[col]
                online_val = online_features.get(col)
                
                if online_val is None:
                    mismatches.append(f"{col}: offline={offline_val}, online=None")
                    continue
                    
                # Float comparison
                if isinstance(offline_val, float):
                    if pd.isna(offline_val) and pd.isna(online_val):
                        continue
                    if abs(offline_val - online_val) > 1e-5:
                        mismatches.append(f"{col}: offline={offline_val}, online={online_val}")
                else:
                    if offline_val != online_val:
                        mismatches.append(f"{col}: offline={offline_val}, online={online_val}")
                        
            results.append({
                "transaction_id": tx_id,
                "mismatches": mismatches
            })
            
        # Print parity report
        print("\n--- Offline vs Online Feature Parity Test ---")
        for res in results:
            if not res["mismatches"]:
                print(f"Transaction {res['transaction_id']}: PERFECT MATCH")
            else:
                print(f"Transaction {res['transaction_id']}: MISMATCHES FOUND")
                for m in res["mismatches"]:
                    print(f"  - {m}")
                    
    # Latency Benchmark
    print("\n--- Latency Benchmark ---")
    import time
    from app.services.risk_engine.engine import RiskEngine
    from app.schemas.risk import RiskAssessmentRequest, TransactionEntity
    import uuid
    
    # 100 requests for latency
    latencies = []
    
    async with AsyncSessionLocal() as db:
        for i in range(100):
            tx_id = f"pay_{uuid.uuid4().hex[:14]}"
            req = RiskAssessmentRequest(
                transaction=TransactionEntity(
                    razorpay_payment_id=tx_id,
                    amount=500.0,
                    currency="INR",
                    status="authorized",
                    method="upi",
                    international=False,
                    customer_id=f"cust_bench_{i}",
                    merchant_id="merch_bench",
                    timestamp=datetime.now(timezone.utc).isoformat()
                )
            )
            
            t0 = time.time()
            await RiskEngine.assess(req, db)
            t1 = time.time()
            
            latencies.append((t1 - t0) * 1000)
            
    import numpy as np
    
    print(f"Total Requests: {len(latencies)}")
    print(f"Average:  {np.mean(latencies):.2f} ms")
    print(f"Cold Start: {latencies[0]:.2f} ms")
    print(f"P50:      {np.percentile(latencies, 50):.2f} ms")
    print(f"P95:      {np.percentile(latencies, 95):.2f} ms")
    print(f"P99:      {np.percentile(latencies, 99):.2f} ms")

if __name__ == "__main__":
    asyncio.run(run_parity_test())
