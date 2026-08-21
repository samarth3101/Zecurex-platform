import pytest
import pandas as pd
import numpy as np
import datetime
import sys
from pathlib import Path

repo_root = Path(__file__).resolve().parent.parent
sys.path.append(str(repo_root))

from ml.features.builder import FeatureBuilder

def create_mock_row(ts, cid, mid, amount, status, method, did, ip):
    return pd.Series({
        "transaction_id": f"txn_{np.random.randint(1000)}",
        "timestamp": ts.isoformat(),
        "_ts_epoch": ts.timestamp(),
        "customer_id": cid,
        "merchant_id": mid,
        "amount": amount,
        "status": status,
        "payment_method": method,
        "device_id": did,
        "ip_hash": ip,
        "geo_region": "IN",
        "international": False,
        "refund_status": None,
        "amount_refunded": 0,
        "label": 0,
        "fraud_scenario": "none"
    })

def test_point_in_time_correctness():
    builder = FeatureBuilder()
    
    t1 = datetime.datetime(2026, 8, 20, 10, 0, 0, tzinfo=datetime.timezone.utc)
    t2 = datetime.datetime(2026, 8, 20, 10, 5, 0, tzinfo=datetime.timezone.utc)
    t3 = datetime.datetime(2026, 8, 20, 10, 10, 0, tzinfo=datetime.timezone.utc)
    
    r1 = create_mock_row(t1, "c1", "m1", 100, "captured", "upi", "d1", "ip1")
    r2 = create_mock_row(t2, "c1", "m1", 200, "captured", "upi", "d1", "ip1")
    r3 = create_mock_row(t3, "c1", "m1", 500, "captured", "upi", "d1", "ip1")
    
    df = pd.DataFrame([r1, r2, r3])
    df["_ts_epoch"] = pd.to_datetime(df["timestamp"]).apply(lambda x: x.timestamp())
    
    # Process dataset
    res = builder.process_dataset(df)
    
    # Check first row (no history)
    assert res.iloc[0]["customer_transaction_count_1h"] == 0
    assert res.iloc[0]["customer_avg_amount_24h"] == -1.0 # Sentinel for empty history
    
    # Check second row (sees r1)
    assert res.iloc[1]["customer_transaction_count_1h"] == 1
    assert res.iloc[1]["customer_avg_amount_24h"] == 100.0
    
    # Check third row (sees r1, r2)
    assert res.iloc[2]["customer_transaction_count_1h"] == 2
    assert res.iloc[2]["customer_avg_amount_24h"] == 150.0

def test_future_leakage():
    builder = FeatureBuilder()
    t1 = datetime.datetime(2026, 8, 20, 10, 0, 0, tzinfo=datetime.timezone.utc)
    t2 = datetime.datetime(2026, 8, 20, 10, 10, 0, tzinfo=datetime.timezone.utc)
    t3 = datetime.datetime(2026, 8, 20, 10, 15, 0, tzinfo=datetime.timezone.utc)
    
    r1 = create_mock_row(t1, "c1", "m1", 100, "captured", "upi", "d1", "ip1")
    r2 = create_mock_row(t2, "c1", "m1", 200, "captured", "upi", "d1", "ip1")
    r3 = create_mock_row(t3, "c1", "m1", 50000, "captured", "upi", "d1", "ip1") # Massive future txn
    
    df = pd.DataFrame([r1, r2, r3])
    df["_ts_epoch"] = pd.to_datetime(df["timestamp"]).apply(lambda x: x.timestamp())
    
    res = builder.process_dataset(df)
    
    # The feature for r2 must NOT include r3
    assert res.iloc[1]["customer_avg_amount_24h"] == 100.0
    
def test_velocity_boundaries():
    builder = FeatureBuilder()
    
    t1 = datetime.datetime(2026, 8, 20, 10, 0, 0, tzinfo=datetime.timezone.utc)
    t2 = datetime.datetime(2026, 8, 20, 10, 6, 0, tzinfo=datetime.timezone.utc)
    
    r1 = create_mock_row(t1, "c1", "m1", 100, "captured", "upi", "d1", "ip1")
    r2 = create_mock_row(t2, "c1", "m1", 200, "captured", "upi", "d1", "ip1")
    
    df = pd.DataFrame([r1, r2])
    df["_ts_epoch"] = pd.to_datetime(df["timestamp"]).apply(lambda x: x.timestamp())
    
    res = builder.process_dataset(df)
    
    # 6 minutes apart, so r2 should see r1 in 15m but NOT in 5m
    assert res.iloc[1]["customer_txn_count_15m"] == 1
    assert res.iloc[1]["customer_txn_count_5m"] == 0

def test_new_payment_method():
    builder = FeatureBuilder()
    
    t1 = datetime.datetime(2026, 8, 20, 10, 0, 0, tzinfo=datetime.timezone.utc)
    t2 = datetime.datetime(2026, 8, 20, 10, 5, 0, tzinfo=datetime.timezone.utc)
    
    r1 = create_mock_row(t1, "c1", "m1", 100, "captured", "upi", "d1", "ip1")
    r2 = create_mock_row(t2, "c1", "m1", 200, "captured", "card", "d1", "ip1") # Switched method
    
    df = pd.DataFrame([r1, r2])
    df["_ts_epoch"] = pd.to_datetime(df["timestamp"]).apply(lambda x: x.timestamp())
    
    res = builder.process_dataset(df)
    
    assert res.iloc[0]["is_new_payment_method"] == 1
    assert res.iloc[1]["is_new_payment_method"] == 1
