import asyncio
import uuid
import time
import datetime
import sys
from pathlib import Path
import json

repo_root = Path(__file__).resolve().parent.parent
sys.path.append(str(repo_root / "apps" / "api"))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.schemas.risk import RiskAssessmentRequest, TransactionEntity
from app.services.risk_engine.engine import RiskEngine
from app.models.transaction import Transaction

async def run_demo():
    print("Initializing Zecure Risk Engine Demo...")
    # Generate 5 examples
    base_time = datetime.datetime.utcnow()
    
    examples = [
        {
            "name": "1. Clearly Legitimate",
            "tx": {
                "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:14]}",
                "amount": 500.0,
                "currency": "INR",
                "status": "authorized",
                "method": "upi",
                "international": False,
                "customer_id": "demo_cust_good",
                "merchant_id": "demo_merch_1",
                "timestamp": base_time.isoformat()
            }
        },
        {
            "name": "2. Amount Anomaly",
            "tx": {
                "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:14]}",
                "amount": 950000.0,
                "currency": "INR",
                "status": "authorized",
                "method": "card",
                "international": False,
                "customer_id": "demo_cust_good", # same customer, huge amount
                "merchant_id": "demo_merch_1",
                "timestamp": (base_time + datetime.timedelta(hours=1)).isoformat()
            }
        },
        {
            "name": "3. Velocity Attack (Rapid successive)",
            "tx": {
                "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:14]}",
                "amount": 100.0,
                "currency": "INR",
                "status": "authorized",
                "method": "wallet",
                "international": False,
                "customer_id": "demo_cust_velocity",
                "merchant_id": "demo_merch_2",
                "timestamp": base_time.isoformat()
            }
        }
    ]
    
    # Insert history for velocity attack
    async with AsyncSessionLocal() as db:
        for i in range(5):
            t = base_time - datetime.timedelta(minutes=2 * (5 - i))
            tx = Transaction(
                razorpay_payment_id=f"pay_hist_{uuid.uuid4().hex[:10]}",
                amount=100.0,
                currency="INR",
                status="authorized",
                method="wallet",
                international=False,
                customer_id="demo_cust_velocity",
                merchant_id="demo_merch_2",
                device_id="dev_velocity",
                ip_hash="192.168.1.1",
                created_at=t.replace(tzinfo=datetime.timezone.utc) if not t.tzinfo else t
            )
            db.add(tx)
        await db.commit()
    
    # We need to simulate history for the velocity attack to actually trigger it.
    # To do that, we would need to insert historical transactions into the DB for `demo_cust_velocity`.
    # For latency benchmarking, we will just run inference on the examples.
    
    latencies = []
    
    async with AsyncSessionLocal() as db:
        for ex in examples:
            print(f"\n--- {ex['name']} ---")
            req = RiskAssessmentRequest(transaction=TransactionEntity(**ex["tx"]))
            
            t0 = time.time()
            assessment = await RiskEngine.assess(req, db)
            t1 = time.time()
            latencies.append((t1 - t0) * 1000)
            
            print(f"Transaction ID: {assessment.transaction_id}")
            print(f"Risk Score:     {assessment.risk_score:.4f}")
            print(f"Risk Level:     {assessment.risk_level}")
            print(f"Decision:       {assessment.decision}")
            print(f"Top Signals:    {json.dumps(assessment.risk_factors, indent=2)}")
            print(f"Latency:        {(t1 - t0) * 1000:.2f} ms")
            
    # Calculate Latency Stats
    if latencies:
        import numpy as np
        print("\n--- Latency Benchmark ---")
        print(f"Total Requests: {len(latencies)}")
        print(f"Average: {np.mean(latencies):.2f} ms")
        print(f"P50:     {np.percentile(latencies, 50):.2f} ms")
        print(f"P95:     {np.percentile(latencies, 95):.2f} ms")
        print(f"P99:     {np.percentile(latencies, 99):.2f} ms")

if __name__ == "__main__":
    asyncio.run(run_demo())
