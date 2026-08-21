import pytest
import uuid
import datetime
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.risk_engine.model_loader import ModelLoader

@pytest.fixture(autouse=True)
def ensure_model_loaded():
    # ModelLoader will load the default joblib file
    ModelLoader.get_instance()

@pytest.mark.asyncio
async def test_risk_engine_valid_request():
    payload = {
        "transaction": {
            "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:14]}",
            "amount": 100.50,
            "currency": "INR",
            "status": "authorized",
            "method": "upi",
            "international": False,
            "customer_id": "cust_123",
            "merchant_id": "merch_123",
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
    }
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/risk/assess", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "risk_level" in data
    assert data["model_name"] == "zecure-random-forest"
    
@pytest.mark.asyncio
async def test_risk_engine_idempotency():
    tx_id = f"pay_{uuid.uuid4().hex[:14]}"
    payload = {
        "transaction": {
            "razorpay_payment_id": tx_id,
            "amount": 5000.0,
            "currency": "INR",
            "status": "authorized",
            "method": "card",
            "international": False,
            "customer_id": "cust_999",
            "merchant_id": "merch_999",
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
    }
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res1 = await client.post("/api/v1/risk/assess", json=payload)
        assert res1.status_code == 200
        data1 = res1.json()
        
        res2 = await client.post("/api/v1/risk/assess", json=payload)
        assert res2.status_code == 200
        data2 = res2.json()
    
    assert data1["id"] == data2["id"] # Should return exact same DB record

@pytest.mark.asyncio
async def test_risk_engine_velocity_attack():
    from app.core.database import AsyncSessionLocal
    from app.models.transaction import Transaction
    
    base_time = datetime.datetime.now(datetime.timezone.utc)
    
    # 1. Insert history
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
                customer_id="pytest_cust_velocity",
                merchant_id="pytest_merch_2",
                device_id="pytest_dev",
                created_at=t
            )
            db.add(tx)
        await db.commit()

    # 2. Target transaction
    payload = {
        "transaction": {
            "razorpay_payment_id": f"pay_{uuid.uuid4().hex[:14]}",
            "amount": 100.0,
            "currency": "INR",
            "status": "authorized",
            "method": "wallet",
            "international": False,
            "customer_id": "pytest_cust_velocity",
            "merchant_id": "pytest_merch_2",
            "device_id": "pytest_dev",
            "timestamp": base_time.isoformat()
        }
    }
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        res = await client.post("/api/v1/risk/assess", json=payload)
    assert res.status_code == 200
    data = res.json()
    
    # Verify that velocity signals were captured
    signals = data.get("risk_factors", {}).get("top_signals", [])
    velocity_signal_found = False
    for s in signals:
        if s["feature"] == "customer_txn_count_15m" and s["value"] == 5:
            velocity_signal_found = True
    assert velocity_signal_found, "Velocity signal not found in top signals"

@pytest.mark.asyncio
async def test_risk_engine_invalid_input():
    payload = {
        "transaction": {
            "amount": "abc", # invalid type
            "currency": "INR"
        }
    }
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/risk/assess", json=payload)
    assert response.status_code == 422
