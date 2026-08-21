
import numpy as np
from faker import Faker
from typing import List, Dict, Any
from .constants import METHODS, METHOD_PROBS

fake = Faker()

class Merchant:
    def __init__(self, rng: np.random.Generator):
        self.merchant_id = f"mer_{''.join(rng.choice(list('abcdef0123456789'), 14))}"
        self.category = fake.random_element(elements=["retail", "services", "digital_goods", "travel", "food"])
        self.size = rng.choice(["small", "medium", "large", "enterprise"], p=[0.6, 0.25, 0.1, 0.05])
        
        # Base failure and refund rates based on size/category
        base_fail = 0.05 if self.size in ["small", "medium"] else 0.02
        self.baseline_failure_rate = rng.uniform(base_fail, base_fail + 0.05)
        self.baseline_refund_rate = rng.uniform(0.01, 0.05)
        
        # Determine average transaction size for this merchant
        if self.category == "travel":
            self.avg_transaction = rng.uniform(2000, 15000)
        elif self.category == "digital_goods":
            self.avg_transaction = rng.uniform(100, 1000)
        else:
            self.avg_transaction = rng.uniform(300, 3000)

class Customer:
    def __init__(self, rng: np.random.Generator, is_fraudster: bool = False):
        self.customer_id = f"cust_{''.join(rng.choice(list('abcdef0123456789'), 14))}"
        self.is_fraudster = is_fraudster
        
        # True age of account in days
        self.age_days = int(rng.uniform(1, 1000))
        
        # Geo
        self.country = "IN" if rng.random() > 0.1 else rng.choice(["US", "UK", "AE", "SG"])
        
        # Behavior
        self.avg_amount = rng.uniform(100, 10000)
        self.amount_std = self.avg_amount * rng.uniform(0.1, 0.5)
        
        # Preferred method (can have a strong bias)
        self.preferred_method = rng.choice(METHODS, p=METHOD_PROBS)
        
        # Identifiers
        self.email_hash = fake.sha256()[:16]
        self.contact_hash = fake.sha256()[:16]
        self.card_id_hash = fake.sha256()[:16]
        self.device_id = f"dev_{fake.md5()[:12]}"
        self.ip_hash = fake.ipv4()
        
        # Fraudster specifics (but not perfectly separable)
        if self.is_fraudster:
            # Fraudsters might have slightly different average properties, but largely overlap
            if rng.random() > 0.5:
                self.avg_amount = rng.uniform(2000, 25000)

def generate_merchants(n: int, rng: np.random.Generator) -> List[Merchant]:
    return [Merchant(rng) for _ in range(n)]

def generate_customers(n: int, fraud_rate: float, rng: np.random.Generator) -> List[Customer]:
    customers = []
    num_fraudsters = int(n * fraud_rate)
    for i in range(n):
        is_fraud = i < num_fraudsters
        customers.append(Customer(rng, is_fraudster=is_fraud))
    rng.shuffle(customers)
    return customers
