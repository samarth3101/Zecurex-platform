import pandas as pd
import numpy as np
import datetime
import math
from typing import Dict, Any, Tuple
from .state import TimeWindowAggregator, safe_mean, safe_std, safe_rate, safe_max

# Window constants in seconds
M_5 = 5 * 60
M_15 = 15 * 60
H_1 = 3600
H_24 = 24 * 3600
D_7 = 7 * 24 * 3600
D_30 = 30 * 24 * 3600

class FeatureBuilder:
    def __init__(self):
        # We need state trackers
        self.customer_state = TimeWindowAggregator(max_window_seconds=D_30)
        self.merchant_state = TimeWindowAggregator(max_window_seconds=D_30)
        self.device_state = TimeWindowAggregator(max_window_seconds=D_30)
        self.ip_state = TimeWindowAggregator(max_window_seconds=D_30)
        
        # Track globally seen sets per customer for "is_new_*" features
        # dict of customer_id -> set of payment methods
        self.customer_methods = {}
        self.customer_regions = {}
        
    def process_dataset(self, df: pd.DataFrame) -> pd.DataFrame:
        # Use the canonical order of the input dataset
        df = df.copy()
        df["_ts_epoch"] = pd.to_datetime(df["timestamp"]).apply(lambda x: x.timestamp())
        
        features_list = []
        
        for idx, row in df.iterrows():
            ts = row["_ts_epoch"]
            cid = row["customer_id"]
            mid = row["merchant_id"]
            did = row.get("device_id")
            ip = row.get("ip_hash")
            
            # 1. Build features using strictly historical state (< ts)
            feat = self._build_features_for_row(row, ts, cid, mid, did, ip)
            
            # Pass through ground truth at the end
            feat["label"] = row["label"]
            feat["fraud_scenario"] = row["fraud_scenario"]
            
            features_list.append(feat)
            
            # 2. Update state with current row (now history for the next rows)
            ev = {
                "amount": row["amount"],
                "status": row["status"],
                "payment_method": row["payment_method"],
                "geo_region": row.get("geo_region"),
                "device_id": row.get("device_id"),
                "customer_id": cid,
                "is_refund": (row.get("refund_status") == "processed" and row.get("amount_refunded", 0) > 0)
            }
            
            self.customer_state.add_event(cid, ts, ev)
            self.merchant_state.add_event(mid, ts, ev)
            if pd.notna(did):
                self.device_state.add_event(did, ts, ev)
            if pd.notna(ip):
                self.ip_state.add_event(ip, ts, ev)
                
            if cid not in self.customer_methods:
                self.customer_methods[cid] = set()
            self.customer_methods[cid].add(row["payment_method"])
            
            if cid not in self.customer_regions:
                self.customer_regions[cid] = set()
            self.customer_regions[cid].add(row.get("geo_region"))
            
        return pd.DataFrame(features_list)

    def _build_features_for_row(self, row: pd.Series, ts: float, cid: str, mid: str, did: str, ip: str) -> Dict[str, Any]:
        f = {}
        
        # Identifiers (metadata)
        f["transaction_id"] = row["transaction_id"]
        f["timestamp"] = row["timestamp"]
        
        # --- 1. Transaction base ---
        f["amount"] = row["amount"]
        f["amount_log"] = math.log1p(row["amount"])
        f["international_flag"] = 1 if row.get("international") else 0
        f["payment_method"] = row["payment_method"]
        
        dt = pd.to_datetime(row["timestamp"])
        f["transaction_hour"] = dt.hour
        f["transaction_day_of_week"] = dt.dayofweek
        f["is_weekend"] = 1 if dt.dayofweek >= 5 else 0
        
        # --- Customer historical events ---
        c_1h = self.customer_state.get_events(cid, ts, H_1)
        c_24h = self.customer_state.get_events(cid, ts, H_24)
        c_7d = self.customer_state.get_events(cid, ts, D_7)
        c_30d = self.customer_state.get_events(cid, ts, D_30)
        
        c_24h_amounts = [e["amount"] for e in c_24h]
        c_7d_amounts = [e["amount"] for e in c_7d]
        c_24h_failed = [e for e in c_24h if e["status"] == "failed"]
        c_1h_failed = [e for e in c_1h if e["status"] == "failed"]
        c_7d_refunds = [e for e in c_7d if e["is_refund"]]
        c_30d_refunds = [e for e in c_30d if e["is_refund"]]

        # --- 2. Customer historical features ---
        f["customer_transaction_count_1h"] = len(c_1h)
        f["customer_transaction_count_24h"] = len(c_24h)
        f["customer_transaction_count_7d"] = len(c_7d)
        
        f["customer_avg_amount_24h"] = safe_mean(c_24h_amounts, default=-1.0)
        f["customer_avg_amount_7d"] = safe_mean(c_7d_amounts, default=-1.0)
        f["customer_std_amount_7d"] = safe_std(c_7d_amounts, default=-1.0)
        f["customer_max_amount_7d"] = safe_max(c_7d_amounts, default=-1.0)
        f["customer_total_spend_7d"] = sum(c_7d_amounts)
        
        f["customer_success_rate_24h"] = safe_rate(len(c_24h) - len(c_24h_failed), len(c_24h), default=-1.0)
        f["customer_failure_count_1h"] = len(c_1h_failed)
        f["customer_failure_count_24h"] = len(c_24h_failed)
        f["customer_refund_count_7d"] = len(c_7d_refunds)
        
        # --- 3. Amount anomaly ---
        if f["customer_avg_amount_7d"] > 0:
            f["amount_vs_customer_avg"] = f["amount"] / f["customer_avg_amount_7d"]
        else:
            f["amount_vs_customer_avg"] = -1.0
            
        if f["customer_std_amount_7d"] > 0:
            f["amount_zscore_customer"] = (f["amount"] - f["customer_avg_amount_7d"]) / f["customer_std_amount_7d"]
        else:
            f["amount_zscore_customer"] = 0.0 # Neutral z-score when std is 0 or no history
            
        if f["customer_max_amount_7d"] > 0:
            f["amount_vs_customer_max"] = f["amount"] / f["customer_max_amount_7d"]
        else:
            f["amount_vs_customer_max"] = -1.0
            
        # --- 4. Velocity features ---
        c_5m = self.customer_state.get_events(cid, ts, M_5)
        c_15m = self.customer_state.get_events(cid, ts, M_15)
        f["customer_txn_count_5m"] = len(c_5m)
        f["customer_txn_count_15m"] = len(c_15m)
        f["customer_failed_attempts_5m"] = len([e for e in c_5m if e["status"] == "failed"])
        
        m_5m = self.merchant_state.get_events(mid, ts, M_5)
        m_1h = self.merchant_state.get_events(mid, ts, H_1)
        f["merchant_txn_count_5m"] = len(m_5m)
        f["merchant_txn_count_1h"] = len(m_1h)
        
        # --- 5. Payment-method behavior ---
        c_24h_methods = set(e["payment_method"] for e in c_24h)
        c_7d_methods = set(e["payment_method"] for e in c_7d)
        f["customer_unique_payment_methods_7d"] = len(c_7d_methods)
        f["customer_payment_method_changes_24h"] = max(0, len(c_24h_methods) - 1)
        f["is_new_payment_method"] = 1 if row["payment_method"] not in self.customer_methods.get(cid, set()) else 0
        
        # --- 6. Merchant behavior ---
        m_24h = self.merchant_state.get_events(mid, ts, H_24)
        m_7d = self.merchant_state.get_events(mid, ts, D_7)
        m_24h_amounts = [e["amount"] for e in m_24h]
        f["merchant_transaction_count_24h"] = len(m_24h)
        f["merchant_avg_amount_24h"] = safe_mean(m_24h_amounts, default=-1.0)
        
        m_24h_failed = len([e for e in m_24h if e["status"] == "failed"])
        m_7d_refunds = len([e for e in m_7d if e["is_refund"]])
        f["merchant_failure_rate_24h"] = safe_rate(m_24h_failed, len(m_24h), default=-1.0)
        f["merchant_refund_rate_7d"] = safe_rate(m_7d_refunds, len(m_7d), default=-1.0)
        
        m_24h_custs = set(e["customer_id"] for e in m_24h)
        f["merchant_unique_customer_count_24h"] = len(m_24h_custs)
        
        # --- 7. Synthetic network/relationship features ---
        d_1h = self.device_state.get_events(did, ts, H_1) if pd.notna(did) else []
        d_7d = self.device_state.get_events(did, ts, D_7) if pd.notna(did) else []
        d_30d = self.device_state.get_events(did, ts, D_30) if pd.notna(did) else []
        
        i_1h = self.ip_state.get_events(ip, ts, H_1) if pd.notna(ip) else []
        i_24h = self.ip_state.get_events(ip, ts, H_24) if pd.notna(ip) else []
        
        f["device_unique_customers_7d"] = len(set(e["customer_id"] for e in d_7d))
        f["ip_unique_customers_24h"] = len(set(e["customer_id"] for e in i_24h))
        f["ip_transaction_count_1h"] = len(i_1h)
        f["device_transaction_count_1h"] = len(d_1h)
        
        # distinct devices used by customer in 30d
        f["customer_device_count_30d"] = len(set(e.get("device_id") for e in c_30d if e.get("device_id")))
        
        # --- 8. Geographic behavior ---
        c_30d_regions = set(e.get("geo_region") for e in c_30d if e.get("geo_region"))
        f["customer_unique_regions_30d"] = len(c_30d_regions)
        f["is_new_region"] = 1 if row.get("geo_region") and row.get("geo_region") not in self.customer_regions.get(cid, set()) else 0
        
        # international change: are they usually domestic but transacting international?
        f["international_change"] = 1 if f["international_flag"] == 1 and f["is_new_region"] == 1 else 0

        # --- 9. Error / failure behavior ---
        f["customer_failure_rate_7d"] = safe_rate(len([e for e in c_7d if e["status"] == "failed"]), len(c_7d), default=-1.0)
        
        # consecutive failures (how many failed in a row immediately before this)
        consecutive_fails = 0
        for e in reversed(c_30d):
            if e["status"] == "failed":
                consecutive_fails += 1
            else:
                break
        f["customer_consecutive_failures"] = consecutive_fails
        
        # --- 10. Refund behavior ---
        f["customer_refund_rate_30d"] = safe_rate(len(c_30d_refunds), len(c_30d), default=-1.0)
        
        return f
