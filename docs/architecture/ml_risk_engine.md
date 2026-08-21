# ML Risk Engine (Phase 5D)

## 1. Problem Definition
Zecure requires a predictive ML Risk Engine to assess transaction risk in real-time. Because of the extremely low fraud rate (approx. 0.74%), standard accuracy metrics are irrelevant. The model must produce a calibrated `fraud_probability` used by a downstream AI Investigation Agent and Policy Engine.

## 2. Dataset & Temporal Evaluation Strategy
- **Temporal Split**: We use a strict chronological split established in Phase 5B (70% Train, 15% Validation, 15% Test). 
- **The Sacred Test Set**: The test set was locked away during model training, tuning, and threshold selection. It was evaluated exactly once after the model artifact and parameters were completely locked.

## 3. Feature Set & Preprocessing
The engine consumes 46 point-in-time correct features generated in Phase 5C.
- **Strict Identifier Exclusion**: Fields such as `transaction_id`, `customer_id`, `merchant_id`, `label`, and `fraud_scenario` are explicitly isolated during data loading and are mathematically incapable of entering the predictive model.
- **Categorical Processing**: `payment_method`, `status`, `currency`, and `geo_region` are transformed using `OneHotEncoder(handle_unknown='ignore')`.
- **Numerical Processing**: Passed through `SimpleImputer(strategy='median')` and `StandardScaler` (required for Logistic Regression baselines).

## 4. Models Evaluated
We compared three candidate algorithms alongside a "trivial baseline" (all-legitimate classifier):
1. **Logistic Regression**: Linear baseline with `class_weight="balanced"`.
2. **Random Forest**: Non-linear tree ensemble with `class_weight="balanced_subsample"`.
3. **HistGradientBoostingClassifier**: Efficient gradient boosting algorithm suitable for tabular data.

### Validation Metrics (Threshold = 0.5)
| Model                     | PR-AUC     | ROC-AUC    | F1         | Recall    |
|---------------------------|------------|------------|------------|-----------|
| Trivial_Baseline          | 0.0075     | 0.5000     | 0.0000     | 0.0000    |
| Logistic_Regression       | 0.8923     | 0.9976     | 0.3294     | 1.0000    |
| Random_Forest             | 0.8936     | 0.9975     | 0.5553     | 0.9196    |
| HistGBM                   | 0.8717     | 0.9971     | 0.5391     | 0.8929    |

**Model Selection**: **Random Forest** was selected due to achieving the highest Validation PR-AUC and strong F1, balancing precision and recall.

## 5. Class Imbalance & Threshold Methodology
Due to the 0.74% fraud rate, we tuned the classification threshold on the validation set. We optimized for a **synthetic business utility function** subject to a hard constraint of `Precision >= 0.25`.

### Business-Cost Assumptions
*These assumptions are purely synthetic logic for the hackathon threshold optimization and do not reflect real Razorpay economics.*
- **Fixed OPEX**: ₹50 per manual review (false positive base cost).
- **Friction Cost**: 0.1% of the legitimate transaction amount flagged (represents user friction / drop-off risk).
- **Fraud Capture Utility**: 100% of the fraudulent transaction value intercepted.

**Optimal Threshold Selected**: `0.45` (Maximized Validation Utility).

## 6. Final Held-Out Test Results (Evaluated ONCE)
After locking the model, preprocessing, and threshold (0.45), the pipeline evaluated the test set:
- **PR-AUC**: 0.9160
- **ROC-AUC**: 0.9984
- **Precision**: 29.97%
- **Recall**: 96.08%
- **F1 Score**: 0.4569
- **False Positive Rate (FPR)**: 1.54%
- **Brier Score (Calibration)**: 0.0077

### Financial Impact (Synthetic)
- **Total Fraud Amount**: ₹2,757,749.08
- **Fraud Amount Captured**: ₹2,713,751.63 (98.4% Capture Rate)
- **Legitimate Amount Flagged**: ₹1,169,480.95
- **False Positive Cost**: ₹12,619.48
- **Synthetic Utility**: ₹2,701,132.15

## 7. Top Risk Features (Permutation Importance)
1. `transaction_hour`
2. `customer_txn_count_15m`
3. `merchant_txn_count_1h`
4. `amount_log`
5. `amount`

*(Note: Feature importance measures statistical predictive power in the ensemble, not necessarily direct causality).*

## 8. Limitations
1. The synthetic data heavily emphasizes volume/velocity spikes (e.g. `customer_txn_count_15m`), which Random Forest correctly learns, but real fraud patterns evolve dynamically.
2. The calibration relies on default Scikit-Learn Platt scaling/Isotonic logic implicitly; explicit recalibration (e.g. `CalibratedClassifierCV`) may be required if raw probabilities are mapped tightly to Policy bands.

## 9. Reproducibility
To fully reproduce this pipeline, ensure `scikit-learn` and `matplotlib` are installed, and run:
```bash
python -m ml.training.experiment
```
The resulting model artifact and `ColumnTransformer` are serialized using `joblib` in `ml/models/zecure_risk_model.joblib`.
