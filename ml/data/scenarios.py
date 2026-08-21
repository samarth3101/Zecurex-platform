import datetime
import numpy as np
from typing import List, Dict, Any
from .constants import *
from .entities import Customer, Merchant
from .temporal import create_base_transaction

def apply_scenario_amount_anomaly(customer: Customer, merchant: Merchant, ts: datetime.datetime, rng: np.random.Generator) -> Dict[str, Any]:
    # Normal amount * 20
    amount = max(50000, rng.uniform(customer.avg_amount * 10, customer.avg_amount * 30))
    txn = create_base_transaction(customer, merchant, ts, rng, amount=amount, status=STATUS_CAPTURED)
    txn["label"] = FRAUD
    txn["fraud_scenario"] = SCENARIO_AMOUNT_ANOMALY
    return txn

def apply_scenario_velocity(customer: Customer, merchant: Merchant, start_ts: datetime.datetime, rng: np.random.Generator, n: int = 5) -> List[Dict[str, Any]]:
    # N transactions within 15 minutes
    events = []
    ts = start_ts
    for _ in range(n):
        txn = create_base_transaction(customer, merchant, ts, rng, status=STATUS_CAPTURED)
        txn["label"] = FRAUD
        txn["fraud_scenario"] = SCENARIO_VELOCITY_ATTACK
        events.append(txn)
        ts += datetime.timedelta(seconds=int(rng.integers(10, 120)))
    return events

def apply_scenario_repeated_failures(customer: Customer, merchant: Merchant, start_ts: datetime.datetime, rng: np.random.Generator) -> List[Dict[str, Any]]:
    events = []
    ts = start_ts
    for _ in range(rng.integers(3, 6)):
        txn = create_base_transaction(customer, merchant, ts, rng, status=STATUS_FAILED)
        txn["label"] = FRAUD
        txn["fraud_scenario"] = SCENARIO_REPEATED_FAILURES
        events.append(txn)
        ts += datetime.timedelta(seconds=int(rng.integers(30, 300)))
    
    # Final success, large amount
    amount = customer.avg_amount * rng.uniform(2, 5)
    success_txn = create_base_transaction(customer, merchant, ts, rng, amount=amount, status=STATUS_CAPTURED)
    success_txn["label"] = FRAUD
    success_txn["fraud_scenario"] = SCENARIO_REPEATED_FAILURES
    events.append(success_txn)
    return events

def apply_scenario_method_switch(customer: Customer, merchant: Merchant, start_ts: datetime.datetime, rng: np.random.Generator) -> List[Dict[str, Any]]:
    events = []
    ts = start_ts
    available_methods = METHODS.copy()
    rng.shuffle(available_methods)
    for i in range(rng.integers(3, 5)):
        method = available_methods[i % len(available_methods)]
        status = STATUS_FAILED if i < 2 else STATUS_CAPTURED
        txn = create_base_transaction(customer, merchant, ts, rng, method=method, status=status)
        txn["label"] = FRAUD
        txn["fraud_scenario"] = SCENARIO_METHOD_SWITCHING
        events.append(txn)
        ts += datetime.timedelta(seconds=int(rng.integers(60, 600)))
    return events

def apply_scenario_international(customer: Customer, merchant: Merchant, ts: datetime.datetime, rng: np.random.Generator) -> Dict[str, Any]:
    amount = customer.avg_amount * rng.uniform(2, 8)
    txn = create_base_transaction(customer, merchant, ts, rng, amount=amount, status=STATUS_CAPTURED)
    # Force international signals
    txn["international"] = True
    txn["currency"] = rng.choice(INTL_CURRENCIES)
    txn["geo_region"] = rng.choice(["RU", "NG", "BR", "VN", "TR"])
    txn["label"] = FRAUD
    txn["fraud_scenario"] = SCENARIO_INTERNATIONAL_ANOMALY
    return txn

def apply_scenario_refund_abuse(customer: Customer, merchant: Merchant, ts: datetime.datetime, rng: np.random.Generator) -> Dict[str, Any]:
    txn = create_base_transaction(customer, merchant, ts, rng, status=STATUS_CAPTURED)
    # They refund a large portion or full immediately after
    txn["amount_refunded"] = txn["amount"]
    txn["refund_status"] = "processed"
    txn["label"] = FRAUD
    txn["fraud_scenario"] = SCENARIO_REFUND_ABUSE
    return txn
