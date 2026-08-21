
import datetime
import numpy as np
from typing import List, Dict, Any, Tuple
from .constants import *
from .entities import Customer, Merchant

def create_base_transaction(
    customer: Customer, 
    merchant: Merchant, 
    ts: datetime.datetime, 
    rng: np.random.Generator,
    amount: float = None,
    method: str = None,
    status: str = None
) -> Dict[str, Any]:
    if amount is None:
        amount = max(10, rng.normal(customer.avg_amount, customer.amount_std))
    if method is None:
        method = rng.choice([customer.preferred_method] + METHODS, p=[0.7] + [0.3/len(METHODS)]*len(METHODS))
    if status is None:
        status = STATUS_CAPTURED if rng.random() > merchant.baseline_failure_rate else STATUS_FAILED
        
    error_code = None
    error_source = None
    error_step = None
    error_reason = None
    
    if status == STATUS_FAILED:
        error_code = rng.choice(ERROR_CODES)
        error_source = rng.choice(ERROR_SOURCES)
        error_step = rng.choice(ERROR_STEPS)
        error_reason = rng.choice(ERROR_REASONS)

    is_international = customer.country != "IN"
    currency = DOMESTIC_CURRENCY if not is_international else rng.choice(INTL_CURRENCIES)

    return {
        "transaction_id": f"txn_{''.join(rng.choice(list('abcdef0123456789'), 32))}",
        "merchant_id": merchant.merchant_id,
        "customer_id": customer.customer_id,
        "razorpay_payment_id": f"pay_{''.join(rng.choice(list('abcdef0123456789'), 14))}",
        "razorpay_order_id": f"order_{''.join(rng.choice(list('abcdef0123456789'), 14))}" if rng.random() > 0.2 else None,
        "timestamp": ts.isoformat(),
        "_ts_obj": ts, # For sorting, removed later
        "amount": round(amount, 2),
        "currency": currency,
        "status": status,
        "payment_method": method,
        "international": is_international,
        "email_hash": customer.email_hash,
        "contact_hash": customer.contact_hash,
        "card_id_hash": customer.card_id_hash if method == "card" else None,
        "bank": "HDFC" if method == "netbanking" else None,
        "wallet": "Paytm" if method == "wallet" else None,
        "amount_refunded": 0.0,
        "refund_status": None,
        "error_code": error_code,
        "error_source": error_source,
        "error_step": error_step,
        "error_reason": error_reason,
        "device_id": customer.device_id,
        "ip_hash": customer.ip_hash,
        "geo_region": customer.country,
        "session_id": f"sess_{''.join(rng.choice(list('abcdef0123456789'), 8))}",
        "label": LEGITIMATE,
        "fraud_scenario": SCENARIO_NONE
    }

def generate_legitimate_sequence(
    customer: Customer, 
    merchants: List[Merchant], 
    start_time: datetime.datetime, 
    end_time: datetime.datetime, 
    rng: np.random.Generator,
    count: int
) -> List[Dict[str, Any]]:
    # Random timestamps between start and end
    total_seconds = int((end_time - start_time).total_seconds())
    offsets = sorted([rng.integers(0, total_seconds) for _ in range(count)])
    timestamps = [start_time + datetime.timedelta(seconds=int(off)) for off in offsets]
    
    events = []
    for ts in timestamps:
        merchant = rng.choice(merchants)
        txn = create_base_transaction(customer, merchant, ts, rng)
        events.append(txn)
        
    return events
