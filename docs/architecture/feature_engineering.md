# Feature Engineering (Phase 5C)

Zecure uses a point-in-time correct, sequential stateful processing pipeline for feature generation.

## 1. Feature Pipeline Overview
The pipeline processes raw transactions and generates a historical context matrix for the machine learning models. The core logic uses a chronological forward-pass over the dataset, ensuring that only data occurring strictly *before* the current transaction `T` is used to build features for `T`.

## 2. Point-in-Time Correctness
To guarantee no future data leakage, the feature builder (`ml/features/builder.py`) processes transactions in canonical order (sorted by `timestamp`). 
For any transaction `t`:
1. Features are extracted using the state accumulated from `t_0` to `t-1`.
2. The current transaction `t` is then added to the state.
If two transactions have identical timestamps, the strict inequality `<` ensures they do not mistakenly influence each other.

## 3. Feature Categories
We generate approximately 45 high-quality signals across 10 categories:
1. **Transaction Features**: Basic properties (amount, log amount, international, time of day).
2. **Customer History**: Historical frequency and amounts (1h, 24h, 7d).
3. **Amount Anomalies**: Ratios comparing the current transaction to historical baselines (e.g. `amount_vs_customer_avg`).
4. **Velocity**: Burst-rate indicators across 5m and 15m windows for both customers and merchants.
5. **Payment Method**: Tracking new payment methods and frequency of method rotation.
6. **Merchant Behavior**: Baselines for merchant transaction volume and failure rates.
7. **Synthetic Network**: Device and IP reuse tracking (`device_unique_customers_7d`).
8. **Geographic Behavior**: Region switching flags.
9. **Error / Failure Behavior**: Historical failure counts and consecutive failure chains.
10. **Refund Behavior**: Historical refund ratios.

## 4. Historical Windows
Features are built across several time windows depending on the behavioral signal:
- `5m`, `15m`: High-velocity burst tracking.
- `1h`: Medium-term session tracking.
- `24h`: Daily behavioral baselines.
- `7d`, `30d`: Long-term historical profiles.

## 5. Missing-Value Strategy
Missing or "zero-history" situations are handled explicitly:
- **Counts/Frequencies**: Default to `0` when no history exists.
- **Rates and Averages**: Default to a sentinel value of `-1.0`. This explicitly allows the ML model to distinguish between a "first-time customer" and a customer with a genuine "0% success rate".
- **Categoricals**: `payment_method` is passed raw to the ML stage. No one-hot encoding or ordinal encoding is performed during feature generation, preventing artificial relationships.

## 6. Leakage Prevention
Validation scripts (`ml/features/validation.py`) check for:
- **Label Leakage**: Ensuring `label` and `fraud_scenario` do not appear in the feature columns.
- **Data Types**: Ensuring counts are non-negative and rates fall strictly within expected bounds (`-1.0` or `[0, 1]`).
- **Temporal Consistency**: Ensuring maximum timestamps in train splits never exceed minimum timestamps in validation splits.

## 7. Temporal Split Behavior
The 70/15/15 chronological split from Phase 5B is strictly preserved. 
The validation dataset builds features using state accumulated from the training dataset, which is mathematically sound for real-world deployment (a model predicting on December 1st naturally has access to historical context from November). However, December 1st validation data *never* leaks backward into the training dataset.

## 8. Synthetic Enrichment Signals
Fields such as `device_id`, `ip_hash`, and `geo_region` are treated as synthetic research signals. They simulate enrichment that would normally occur during webhook ingestion prior to risk scoring.

## 9. Reproducibility
The pipeline is fully deterministic. Rerunning:
```bash
python scripts/build_features.py
```
Will identically parse `data/synthetic/transactions.csv` and reproduce `data/processed/train_features.csv` and its accompanying splits.

## 10. Known Limitations
- The feature builder currently maintains all historical records for 30 days in memory. For 100k rows, this is extremely efficient (takes ~20 seconds). For 1B rows in production, this would require a real-time feature store (e.g., Redis or a dedicated streaming engine like Flink) to maintain the running aggregates.
