import pandas as pd
from datetime import timedelta, datetime
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, Optional

import sys
from pathlib import Path

# Add repo root to path to import ml module
repo_root = Path(__file__).resolve().parent.parent.parent.parent.parent.parent
sys.path.append(str(repo_root))

from ml.features.builder import FeatureBuilder
from ml.features.state import TimeWindowAggregator
from app.models.transaction import Transaction

class FeatureAdapter:
    """
    Adapter bridging PostgreSQL historical context and the offline FeatureBuilder.
    Ensures strict point-in-time correctness for online inference.
    """
    MAX_HISTORY_DAYS = 30
    
    @classmethod
    async def build_features(
        cls, 
        current_tx: Dict[str, Any], 
        db_session: AsyncSession
    ) -> Dict[str, Any]:
        """
        Builds the 46 point-in-time features for the current_tx.
        Retrieves exactly MAX_HISTORY_DAYS of historical context for the relevant
        entities strictly before the current_tx timestamp.
        """
        ts_now = current_tx.get("timestamp", datetime.utcnow())
        if not ts_now.tzinfo:
            from datetime import timezone
            ts_now = ts_now.replace(tzinfo=timezone.utc)
            
        ts_cutoff = ts_now - timedelta(days=cls.MAX_HISTORY_DAYS)
        
        cid = current_tx["customer_id"]
        mid = current_tx["merchant_id"]
        did = current_tx.get("device_id")
        ip = current_tx.get("ip_hash")
        
        # 1. Query historical context STRICTLY before current transaction timestamp
        conditions = [
            Transaction.customer_id == cid,
            Transaction.merchant_id == mid
        ]
        if did:
            conditions.append(Transaction.device_id == did)
        if ip:
            conditions.append(Transaction.ip_hash == ip)
            
        stmt = (
            select(Transaction)
            .where(
                and_(
                    Transaction.created_at >= ts_cutoff,
                    Transaction.created_at < ts_now,
                    or_(*conditions)
                )
            )
            .order_by(Transaction.created_at.asc(), Transaction.id.asc())
        )
        
        result = await db_session.execute(stmt)
        history_records = result.scalars().all()
        
        # 2. Build the exact state required by FeatureBuilder using only historical records
        builder = FeatureBuilder()
        
        for record in history_records:
            # We must map SQLAlchemy model to the dictionary format expected by TimeWindowAggregator
            ev = {
                "amount": record.amount,
                "status": record.status,
                "payment_method": record.method,
                "geo_region": record.geo_region,
                "device_id": record.device_id,
                "customer_id": record.customer_id,
                "is_refund": (record.refund_status == "processed" and record.amount_refunded > 0)
            }
            rec_ts = record.created_at.timestamp()
            
            # Populate state
            if record.customer_id == cid:
                builder.customer_state.add_event(cid, rec_ts, ev)
                if cid not in builder.customer_methods:
                    builder.customer_methods[cid] = set()
                builder.customer_methods[cid].add(record.method)
                
                if cid not in builder.customer_regions:
                    builder.customer_regions[cid] = set()
                if record.geo_region:
                    builder.customer_regions[cid].add(record.geo_region)
                
            if record.merchant_id == mid:
                builder.merchant_state.add_event(mid, rec_ts, ev)
                
            if did and record.device_id == did:
                builder.device_state.add_event(did, rec_ts, ev)
                
            if ip and record.ip_hash == ip:
                builder.ip_state.add_event(ip, rec_ts, ev)

        # 3. Calculate features for the current transaction
        # Convert current_tx to the pd.Series format expected by builder._build_features_for_row
        row_series = pd.Series({
            "transaction_id": current_tx.get("transaction_id", "N/A"),
            "timestamp": ts_now,
            "amount": current_tx["amount"],
            "payment_method": current_tx["method"],
            "international": current_tx["international"],
            "geo_region": current_tx.get("geo_region")
        })
        
        features = builder._build_features_for_row(
            row=row_series,
            ts=ts_now.timestamp(),
            cid=cid,
            mid=mid,
            did=did,
            ip=ip
        )
        
        return features
