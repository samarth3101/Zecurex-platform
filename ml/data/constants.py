# ml/data/constants.py

import numpy as np

# Ground Truth Labels
LEGITIMATE = 0
FRAUD = 1

# Scenarios
SCENARIO_NONE = "legitimate"
SCENARIO_AMOUNT_ANOMALY = "amount_anomaly"
SCENARIO_VELOCITY_ATTACK = "velocity_attack"
SCENARIO_REPEATED_FAILURES = "repeated_failures"
SCENARIO_METHOD_SWITCHING = "payment_method_switch"
SCENARIO_ABUSE_RING = "abuse_ring"
SCENARIO_INTERNATIONAL_ANOMALY = "international_anomaly"
SCENARIO_REFUND_ABUSE = "refund_abuse"

FRAUD_SCENARIOS = [
    SCENARIO_AMOUNT_ANOMALY,
    SCENARIO_VELOCITY_ATTACK,
    SCENARIO_REPEATED_FAILURES,
    SCENARIO_METHOD_SWITCHING,
    SCENARIO_ABUSE_RING,
    SCENARIO_INTERNATIONAL_ANOMALY,
    SCENARIO_REFUND_ABUSE
]

# Payment Methods
METHODS = ["upi", "card", "netbanking", "wallet"]
METHOD_PROBS = [0.6, 0.25, 0.1, 0.05]

# Currencies
DOMESTIC_CURRENCY = "INR"
INTL_CURRENCIES = ["USD", "EUR", "GBP", "SGD", "AED"]

# Statuses
STATUS_CAPTURED = "captured"
STATUS_FAILED = "failed"
STATUS_CREATED = "created"

# Errors
ERROR_CODES = ["BAD_REQUEST_ERROR", "GATEWAY_ERROR", "INSUFFICIENT_FUNDS", "BANK_NETWORK_ERROR", "TIMEOUT"]
ERROR_SOURCES = ["customer", "bank", "internal"]
ERROR_STEPS = ["payment_authentication", "payment_authorization"]
ERROR_REASONS = ["payment_failed", "authentication_failed", "insufficient_balance"]
