# Zecure Phase 5D: Locked Model Diagnostic Review

This document provides a post-hoc diagnostic review of the locked Zecure ML Risk Engine evaluated on the held-out test set. 

**IMPORTANT**: Zecure’s current performance is measured exclusively on synthetic data and should not be interpreted as real-world fraud detection performance. The evaluation pipeline enforces a strict train/validation/test protocol to prevent data leakage.

## 1. Locked Model Specifications
- **Model**: Random Forest
- **Locked Threshold**: 0.45
- **Official Test Metrics**:
  - **PR-AUC**: 0.9160
  - **Precision**: 29.97%
  - **Recall**: 96.08%
  - **F1 Score**: 0.4569
  - **FPR**: 1.54%
  - **Brier Score**: 0.0077

## 2. Scenario-Level Performance
Analysis of the test set predictions broken down by synthetic fraud scenario:

| Scenario | Transactions | Fraud Amount (₹) | Captured (₹) | Recall |
|----------|-------------|------------------|--------------|--------|
| **Repeated Failures** | 40 | 960,386 | 947,089 | 97.5% |
| **Payment Method Switch** | 25 | 153,209 | 130,709 | 92.0% |
| **Velocity Attack** | 15 | 185,299 | 177,099 | 93.3% |
| **Refund Abuse** | 9 | 100,748 | 100,748 | 100.0% |
| **International Anomaly** | 8 | 266,574 | 266,574 | 100.0% |
| **Amount Anomaly** | 5 | 1,091,530 | 1,091,530 | 100.0% |
| **Legitimate** | 14,898 | N/A | N/A | N/A |

*Note: The model incorrectly flagged 229 out of 14,898 Legitimate transactions (1.5% False Positive Rate).*

## 3. Top 15 Feature Importances
Calculated via Permutation Importance (Average Precision) on the validation set. *Note: Importance implies predictive utility in this specific ensemble, not strict real-world causality.*

| Rank | Feature | Importance | Category |
|------|---------|------------|----------|
| 1 | `transaction_hour` | 0.5178 | Transaction Base |
| 2 | `customer_txn_count_15m` | 0.0918 | Velocity |
| 3 | `merchant_txn_count_1h` | 0.0569 | Merchant Behavior |
| 4 | `amount_log` | 0.0506 | Transaction Base |
| 5 | `amount` | 0.0317 | Transaction Base |
| 6 | `ip_transaction_count_1h` | 0.0129 | Synthetic Network |
| 7 | `is_new_region` | 0.0092 | Geographic |
| 8 | `device_transaction_count_1h` | 0.0090 | Synthetic Network |
| 9 | `customer_transaction_count_1h` | 0.0053 | Customer Behavior |
| 10 | `is_new_payment_method` | 0.0048 | Payment Method |
| 11 | `merchant_unique_customer_count_24h` | 0.0032 | Synthetic Network |
| 12 | `amount_vs_customer_max` | 0.0025 | Amount Anomaly |
| 13 | `international_change` | 0.0019 | Geographic |
| 14 | `x0_upi` (Payment Method) | 0.0019 | Payment Method |
| 15 | `merchant_txn_count_5m` | 0.0017 | Merchant Behavior |

## 4. Synthetic Shortcut-Risk Observations
An analysis of the feature importances reveals extremely heavy reliance on **`transaction_hour`** (0.51), dwarfing all other features. 
- **Risk**: The synthetic data generator likely concentrated fraud attacks heavily into specific hours (e.g., night-time bursts), allowing the model to learn a "time-of-day" shortcut rule. While time of day is predictive in real-world fraud, a 0.51 importance suggests synthetic overfitting to the generator's temporal distribution.
- **Validation**: Velocity features (ranks 2, 3, 6, 8) accurately captured the injected abuse rings, velocity attacks, and repeated failures. The model successfully reverse-engineered the logic used to create the synthetic data.

## 5. Validation vs Test Comparison
The performance on the final held-out test set closely mirrored the validation set, showing no catastrophic degradation.

| Metric | Validation | Test | Status |
|--------|------------|------|--------|
| **PR-AUC** | 0.8936 | 0.9160 | Strong Agreement |
| **ROC-AUC** | 0.9975 | 0.9984 | Strong Agreement |
| **Precision** | 30.54% | 29.97% | Strong Agreement |
| **Recall** | 94.64% | 96.08% | Strong Agreement |
| **F1 Score** | 0.4619 | 0.4569 | Strong Agreement |
| **FPR** | 1.61% | 1.54% | Strong Agreement |
| **Fraud Capture**| 99.5% | 98.4% | Strong Agreement |

**Conclusion**: The chronological split strategy proved robust. The behavioral patterns learned in the training period successfully generalized to the future test period.

## 6. Review Workload & The Role of the AI Agent
At the locked operating threshold of **0.45**, applying the model to the 15,000 transaction test set yields:
- **Total Transactions**: 15,000
- **Flag Rate**: 2.18% (327 transactions flagged)
- **True Fraud in Flags**: 98
- **Legitimate in Flags**: 229
- **Precision**: 29.97%

**Operational Workflow**:
Instead of reviewing 15,000 transactions, the AI Investigation Agent will only be invoked **327 times**. Of those, roughly **1 in 3** will be genuine fraud. The AI Agent will be responsible for synthesizing the top signals (e.g., *“Customer had 5 failures in the last 15m and switched from UPI to Card”*) and presenting an explanation to a human analyst or policy engine.

## 7. Limitations & Concerns Before Productionizing
1. **Shortcut Learning**: The model's extreme reliance on `transaction_hour` indicates that our synthetic data lacks sufficient temporal diversity for legitimate transactions. In a real-world setting, this model might falsely flag legitimate night-time activity.
2. **Missing Real-World Noise**: The precision of ~30% is likely overly optimistic. Real-world payment data contains significantly more behavioral noise that blurs the line between a "velocity attack" and a "determined customer trying to buy tickets".
3. **Threshold Calibration**: The raw probability outputs are clustered. Recalibration (e.g., Isotonic Regression) may be required to smoothly map scores between `[0, 1]` for the downstream policy engine.
