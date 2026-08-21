import datetime
import pandas as pd
import numpy as np
from typing import List, Dict, Any

from .constants import *
from .entities import generate_merchants, generate_customers, fake
from .temporal import generate_legitimate_sequence, create_base_transaction
from .scenarios import (
    apply_scenario_amount_anomaly,
    apply_scenario_velocity,
    apply_scenario_repeated_failures,
    apply_scenario_method_switch,
    apply_scenario_international,
    apply_scenario_refund_abuse
)

def build_dataset(
    n_rows: int,
    fraud_rate: float,
    seed: int,
    days: int = 90
) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    fake.seed_instance(seed)
    
    # 1. Generate entities
    # Assume roughly 10 transactions per customer over the period, so n_customers = n_rows // 10
    n_customers = max(100, n_rows // 10)
    n_merchants = max(10, n_customers // 20)
    
    merchants = generate_merchants(n_merchants, rng)
    customers = generate_customers(n_customers, fraud_rate, rng)
    
    # Use a fixed end_date for true reproducibility
    end_date = datetime.datetime(2026, 8, 21, tzinfo=datetime.timezone.utc)
    start_date = end_date - datetime.timedelta(days=days)
    
    events: List[Dict[str, Any]] = []
    
    fraudsters = [c for c in customers if c.is_fraudster]
    legits = [c for c in customers if not c.is_fraudster]
    
    # 2. Generate Abuse Rings (Scenario 5) - done globally across some fraudsters
    # 10% of fraudsters participate in abuse rings
    ring_size = max(2, len(fraudsters) // 20)
    if ring_size >= 2:
        ring_members = rng.choice(fraudsters, size=ring_size, replace=False)
        shared_device = f"dev_ring_{rng.integers(1000, 9999)}"
        shared_ip = f"192.168.1.{rng.integers(1, 255)}"
        
        ring_ts = start_date + datetime.timedelta(days=int(rng.integers(1, days-2)))
        
        for member in ring_members:
            member.device_id = shared_device
            member.ip_hash = shared_ip
            merchant = rng.choice(merchants)
            
            # They each make a few rapid txns
            for _ in range(rng.integers(2, 5)):
                txn = create_base_transaction(member, merchant, ring_ts, rng, status=STATUS_CAPTURED)
                txn["label"] = FRAUD
                txn["fraud_scenario"] = SCENARIO_ABUSE_RING
                events.append(txn)
                ring_ts += datetime.timedelta(minutes=int(rng.integers(5, 60)))
                
    # 3. Generate normal + other fraud scenarios per customer
    for c in customers:
        # Base legitimate sequence (everyone has some legitimate behavior)
        # Fraudsters have fewer legit txns to make room for fraud
        legit_count = int(rng.poisson(10)) if not c.is_fraudster else int(rng.poisson(3))
        if legit_count > 0:
            events.extend(generate_legitimate_sequence(c, merchants, start_date, end_date, rng, legit_count))
            
        if c.is_fraudster and c not in (ring_members if ring_size >= 2 else []):
            scenario = rng.choice([
                SCENARIO_AMOUNT_ANOMALY,
                SCENARIO_VELOCITY_ATTACK,
                SCENARIO_REPEATED_FAILURES,
                SCENARIO_METHOD_SWITCHING,
                SCENARIO_INTERNATIONAL_ANOMALY,
                SCENARIO_REFUND_ABUSE
            ])
            
            merchant = rng.choice(merchants)
            fraud_ts = start_date + datetime.timedelta(days=int(rng.integers(1, days-1)))
            
            if scenario == SCENARIO_AMOUNT_ANOMALY:
                events.append(apply_scenario_amount_anomaly(c, merchant, fraud_ts, rng))
            elif scenario == SCENARIO_VELOCITY_ATTACK:
                events.extend(apply_scenario_velocity(c, merchant, fraud_ts, rng))
            elif scenario == SCENARIO_REPEATED_FAILURES:
                events.extend(apply_scenario_repeated_failures(c, merchant, fraud_ts, rng))
            elif scenario == SCENARIO_METHOD_SWITCHING:
                events.extend(apply_scenario_method_switch(c, merchant, fraud_ts, rng))
            elif scenario == SCENARIO_INTERNATIONAL_ANOMALY:
                events.append(apply_scenario_international(c, merchant, fraud_ts, rng))
            elif scenario == SCENARIO_REFUND_ABUSE:
                events.append(apply_scenario_refund_abuse(c, merchant, fraud_ts, rng))

    # 4. Filter to N_ROWS if necessary, but we want chronological order first
    # Sort chronologically
    events.sort(key=lambda x: x["_ts_obj"])
    
    # Remove _ts_obj
    for e in events:
        del e["_ts_obj"]
        
    df = pd.DataFrame(events)
    
    # If we generated more than needed, truncate or sample?
    # Because it's time-series, if we just truncate the end, we lose the latter part of the 90 days.
    # Better to keep all or uniformly sample if we want exactly N rows, but time-series downsampling is tricky.
    # We will just take the exact N rows. The distribution over time will be dense.
    if len(df) > n_rows:
        # To maintain time distribution, sample indices and re-sort? No, if we sample, we break velocity attacks.
        # Just truncate to the first N rows for simplicity, it will just represent a shorter time window.
        df = df.head(n_rows)
    elif len(df) < n_rows:
        # If we missed the target, it's fine for synthetic dataset, but let's warn.
        print(f"Warning: Generated {len(df)} rows, requested {n_rows}.")
        
    return df
