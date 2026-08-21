# Zecure Synthetic Risk Dataset

This dataset simulates a temporal payment ecosystem for Zecure's AI Risk Engine. It is intended strictly for model training, feature engineering, and evaluation. It contains a mix of legitimate customer profiles and multiple injected fraud scenarios.

## Files
- `metadata.json`: Contains ground-truth counts, scenario distributions, and data quality check results.
- `train.csv`: First 70% of transactions sorted chronologically.
- `validation.csv`: Next 15% of transactions.
- `test.csv`: Final 15% of transactions (Held-out).
- `transactions.csv`: The full unsplit dataset.

## Data Dictionary
The dataset matches the Zecure domain model but includes additional ML synthetic enrichment signals.

| Field | Description | Source |
|-------|-------------|--------|
| `transaction_id` | Unique ID for the transaction | Core |
| `merchant_id` | ID of the merchant receiving payment | Core |
| `customer_id` | ID of the customer | Core |
| `timestamp` | ISO-8601 Timestamp of the event | Core |
| `amount` | Transaction value | Core |
| `currency` | ISO Currency code (e.g., INR, USD) | Core |
| `status` | `captured` or `failed` | Core |
| `payment_method` | E.g., `upi`, `card`, `netbanking` | Core |
| `international` | Boolean flag | Core |
| `device_id` | **[Enrichment]** Hardware fingerprint | Synthetic |
| `ip_hash` | **[Enrichment]** IPv4 Address | Synthetic |
| `geo_region` | **[Enrichment]** Country code | Synthetic |
| `session_id` | **[Enrichment]** Browser session | Synthetic |
| `label` | **[Ground Truth]** 0=Legit, 1=Fraud | Ground Truth |
| `fraud_scenario` | **[Ground Truth]** The specific pattern | Ground Truth |

## Fraud Scenarios
The generator simulates behavioral anomalies rather than relying on a static "is_fraudster" feature.

1. **Amount Anomaly**: Sudden spike in transaction value compared to historical behavior.
2. **Velocity Attack**: Rapid succession of transactions in a short window.
3. **Repeated Failures**: Multiple failures followed by a high-value success.
4. **Method Switching**: High frequency of changing payment methods.
5. **Abuse Ring**: Multiple distinct customers sharing a device or IP making coordinated purchases.
6. **International Anomaly**: A sudden shift to an overseas geo-region and currency.
7. **Refund Abuse**: Transactions that are immediately and repeatedly refunded.

## Preventing Data Leakage
The dataset uses a strict **temporal split**. Features must be built *only* using historical rolling windows (e.g. `customer_txn_count_24h` computed using rows occurring strictly before the current row). The `label` and `fraud_scenario` columns must be explicitly dropped before training and prediction.

## Reproducibility
The dataset was generated using deterministic seeding:
```bash
python scripts/generate_dataset.py --rows 100000 --seed 42
```
To generate a larger dataset, simply increase the `--rows` parameter.
