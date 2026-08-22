import asyncio
import os
import sys
import uuid
import datetime
import json
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent
sys.path.append(str(repo_root / "apps" / "api"))

from app.core.database import AsyncSessionLocal
from app.services.risk_engine.engine import RiskEngine
from app.services.investigation.investigation_service import InvestigationService
from app.schemas.risk import RiskAssessmentRequest, TransactionEntity
from app.models.transaction import Transaction

async def setup_history(db, scenario_type, customer_id, merchant_id, base_time):
    if scenario_type == "Velocity Attack":
        for i in range(5):
            t = base_time - datetime.timedelta(minutes=2 * (5 - i))
            tx = Transaction(
                razorpay_payment_id=f"pay_hist_{uuid.uuid4().hex[:10]}",
                amount=100.0,
                currency="INR",
                status="authorized",
                method="wallet",
                international=False,
                customer_id=customer_id,
                merchant_id=merchant_id,
                created_at=t.replace(tzinfo=datetime.timezone.utc)
            )
            db.add(tx)
    elif scenario_type == "Repeated Failures":
        for i in range(4):
            t = base_time - datetime.timedelta(hours=1, minutes=i*5)
            tx = Transaction(
                razorpay_payment_id=f"pay_hist_{uuid.uuid4().hex[:10]}",
                amount=5000.0,
                currency="INR",
                status="failed",
                error_code="BAD_REQUEST_ERROR",
                method="card",
                international=False,
                customer_id=customer_id,
                merchant_id=merchant_id,
                created_at=t.replace(tzinfo=datetime.timezone.utc)
            )
            db.add(tx)
    elif scenario_type == "Payment Method Switching":
        methods = ["card", "upi", "netbanking", "wallet"]
        for i in range(4):
            t = base_time - datetime.timedelta(minutes=30 - i*5)
            tx = Transaction(
                razorpay_payment_id=f"pay_hist_{uuid.uuid4().hex[:10]}",
                amount=2000.0,
                currency="INR",
                status="failed",
                error_code="BAD_REQUEST_ERROR",
                method=methods[i],
                international=False,
                customer_id=customer_id,
                merchant_id=merchant_id,
                created_at=t.replace(tzinfo=datetime.timezone.utc)
            )
            db.add(tx)
    elif scenario_type == "Refund Abuse":
        for i in range(3):
            t = base_time - datetime.timedelta(days=i*2)
            tx = Transaction(
                razorpay_payment_id=f"pay_hist_{uuid.uuid4().hex[:10]}",
                amount=3000.0,
                amount_refunded=3000.0,
                currency="INR",
                status="refunded",
                refund_status="full",
                method="upi",
                international=False,
                customer_id=customer_id,
                merchant_id=merchant_id,
                created_at=t.replace(tzinfo=datetime.timezone.utc)
            )
            db.add(tx)
    elif scenario_type == "Amount Anomaly":
        for i in range(10):
            t = base_time - datetime.timedelta(days=i)
            tx = Transaction(
                razorpay_payment_id=f"pay_hist_{uuid.uuid4().hex[:10]}",
                amount=500.0,
                currency="INR",
                status="captured",
                method="upi",
                international=False,
                customer_id=customer_id,
                merchant_id=merchant_id,
                created_at=t.replace(tzinfo=datetime.timezone.utc)
            )
            db.add(tx)
    
    await db.commit()

async def run_demo():
    print("--- Zecure Phase 5F AI Investigation Agent Demo ---")
    if not os.environ.get("GEMINI_API_KEY"):
        print("Error: GEMINI_API_KEY is not set.")
        return
        
    base_time = datetime.datetime.utcnow()
    
    scenarios = [
        {
            "name": "1. Legitimate",
            "type": "Legitimate",
            "tx": {
                "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:14]}",
                "amount": 500.0,
                "currency": "INR",
                "status": "authorized",
                "method": "upi",
                "international": False,
                "customer_id": "cust_legit_1",
                "merchant_id": "merch_1",
                "timestamp": base_time.isoformat()
            }
        },
        {
            "name": "2. Amount Anomaly",
            "type": "Amount Anomaly",
            "tx": {
                "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:14]}",
                "amount": 50000.0,
                "currency": "INR",
                "status": "authorized",
                "method": "card",
                "international": False,
                "customer_id": "cust_anomaly_1",
                "merchant_id": "merch_1",
                "timestamp": base_time.isoformat()
            }
        },
        {
            "name": "3. Velocity Attack",
            "type": "Velocity Attack",
            "tx": {
                "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:14]}",
                "amount": 100.0,
                "currency": "INR",
                "status": "authorized",
                "method": "wallet",
                "international": False,
                "customer_id": "cust_velocity_1",
                "merchant_id": "merch_2",
                "timestamp": base_time.isoformat()
            }
        },
        {
            "name": "4. Repeated Failures",
            "type": "Repeated Failures",
            "tx": {
                "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:14]}",
                "amount": 5000.0,
                "currency": "INR",
                "status": "authorized",
                "method": "card",
                "international": False,
                "customer_id": "cust_fails_1",
                "merchant_id": "merch_3",
                "timestamp": base_time.isoformat()
            }
        },
        {
            "name": "5. Payment Method Switching",
            "type": "Payment Method Switching",
            "tx": {
                "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:14]}",
                "amount": 2000.0,
                "currency": "INR",
                "status": "authorized",
                "method": "emi",
                "international": False,
                "customer_id": "cust_switch_1",
                "merchant_id": "merch_3",
                "timestamp": base_time.isoformat()
            }
        },
        {
            "name": "6. Abuse Ring",
            "type": "Abuse Ring",
            "tx": {
                "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:14]}",
                "amount": 999.0,
                "currency": "INR",
                "status": "authorized",
                "method": "upi",
                "international": False,
                "customer_id": "cust_ring_1",
                "merchant_id": "merch_4",
                "device_id": "dev_ring_shared",
                "timestamp": base_time.isoformat()
            }
        },
        {
            "name": "7. International Anomaly",
            "type": "International Anomaly",
            "tx": {
                "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:14]}",
                "amount": 15000.0,
                "currency": "INR",
                "status": "authorized",
                "method": "card",
                "international": True,
                "customer_id": "cust_intl_1",
                "merchant_id": "merch_local_only",
                "timestamp": base_time.isoformat()
            }
        },
        {
            "name": "8. Refund Abuse",
            "type": "Refund Abuse",
            "tx": {
                "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:14]}",
                "amount": 3000.0,
                "currency": "INR",
                "status": "authorized",
                "method": "upi",
                "international": False,
                "customer_id": "cust_refund_1",
                "merchant_id": "merch_5",
                "timestamp": base_time.isoformat()
            }
        }
    ]

    # Setup shared device history for Abuse Ring
    async with AsyncSessionLocal() as db:
        for i in range(10):
            t = base_time - datetime.timedelta(hours=i)
            tx = Transaction(
                razorpay_payment_id=f"pay_hist_{uuid.uuid4().hex[:10]}",
                amount=999.0,
                currency="INR",
                status="authorized",
                method="upi",
                international=False,
                customer_id=f"cust_ring_other_{i}",
                merchant_id="merch_4",
                device_id="dev_ring_shared",
                created_at=t.replace(tzinfo=datetime.timezone.utc)
            )
            db.add(tx)
        await db.commit()

    eval_results = []

    for ex in scenarios:
        async with AsyncSessionLocal() as db:
            await setup_history(db, ex["type"], ex["tx"]["customer_id"], ex["tx"]["merchant_id"], base_time)
            
            print(f"\n======================================")
            print(f"Executing Scenario: {ex['name']}")
            print(f"======================================")
            
            req = RiskAssessmentRequest(transaction=TransactionEntity(**ex["tx"]))
            assessment = await RiskEngine.assess(req, db)
            
            print(f"Risk Engine output -> Score: {assessment.risk_score:.4f}, Level: {assessment.risk_level}, Decision: {assessment.decision}")
            
            response = await InvestigationService.run_investigation(ex["tx"]["razorpay_payment_id"], db)
            
            print(f"Investigation Status: {response.status}")
            if response.status == "COMPLETED":
                print(f"Severity: {response.severity}")
                print(f"Confidence: {response.confidence}")
                print(f"Recommendation: {response.recommendation}")
                print(f"Summary: {response.summary}")
                print("Key Findings:")
                findings_list = []
                if response.key_findings:
                    for finding in response.key_findings:
                        print(f"  - {finding}")
                        findings_list.append(finding)
                
                eval_results.append({
                    "scenario": ex["name"],
                    "transaction_id": ex["tx"]["razorpay_payment_id"],
                    "risk_score": assessment.risk_score,
                    "risk_level": assessment.risk_level,
                    "decision": assessment.decision,
                    "investigation": {
                        "status": response.status,
                        "severity": response.severity,
                        "confidence": response.confidence,
                        "recommendation": response.recommendation,
                        "summary": response.summary,
                        "key_findings": findings_list
                    }
                })
            else:
                print(f"Failed Summary: {response.summary}")
                eval_results.append({
                    "scenario": ex["name"],
                    "transaction_id": ex["tx"]["razorpay_payment_id"],
                    "risk_score": assessment.risk_score,
                    "risk_level": assessment.risk_level,
                    "investigation": {
                        "status": response.status,
                        "error": getattr(response, 'summary', 'Unknown error')
                    }
                })

    eval_path = repo_root / "ml" / "evaluation" / "investigation_evaluation.json"
    eval_path.parent.mkdir(parents=True, exist_ok=True)
    with open(eval_path, "w") as f:
        json.dump(eval_results, f, indent=2)
    print(f"\nSaved evaluation results to {eval_path}")

if __name__ == "__main__":
    asyncio.run(run_demo())
