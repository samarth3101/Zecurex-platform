from typing import Any, Dict, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.transaction import Transaction
from app.models.risk import RiskAssessment
from app.schemas.investigation import (
    StructuredEvidence,
    EvidenceItem,
    InvestigationEvidenceProvenance
)
from app.services.risk_engine.feature_adapter import FeatureAdapter
import json

class EvidenceCollector:
    @classmethod
    async def collect(
        cls, 
        transaction: Transaction, 
        risk_assessment: RiskAssessment, 
        db: AsyncSession
    ) -> StructuredEvidence:
        
        # 1. Transaction Evidence
        transaction_evidence = {
            "amount": transaction.amount,
            "currency": transaction.currency,
            "status": transaction.status,
            "method": transaction.method,
            "international": transaction.international,
            "error_reason": transaction.error_reason,
            "refund_status": transaction.refund_status
        }
        
        # 2. Risk Assessment Evidence
        top_signals = []
        if risk_assessment.risk_factors and "top_signals" in risk_assessment.risk_factors:
            top_signals = risk_assessment.risk_factors["top_signals"]
            
        risk_evidence = {
            "risk_score": risk_assessment.risk_score,
            "risk_level": risk_assessment.risk_level,
            "decision": risk_assessment.decision,
            "model_name": risk_assessment.model_name,
            "model_version": risk_assessment.model_version,
            "top_signals": top_signals
        }
        
        # 3. Recalculate deterministic features point-in-time
        # We construct the current_tx dict for FeatureAdapter
        current_tx = {
            "transaction_id": str(transaction.id),
            "timestamp": transaction.created_at,
            "amount": transaction.amount,
            "method": transaction.method,
            "international": transaction.international,
            "geo_region": transaction.geo_region,
            "customer_id": transaction.customer_id,
            "merchant_id": transaction.merchant_id,
            "device_id": transaction.device_id,
            "ip_hash": transaction.ip_hash
        }
        features = await FeatureAdapter.build_features(current_tx, db)
        
        # 4. Extract categories
        customer_behavior = {
            "avg_amount_7d": features.get("customer_avg_amount_7d", 0),
            "txn_count_7d": features.get("customer_txn_count_7d", 0),
            "success_rate_7d": features.get("customer_success_rate_7d", 0.0)
        }
        
        velocity = {
            "customer_5m": features.get("customer_txn_count_5m", 0),
            "customer_15m": features.get("customer_txn_count_15m", 0),
            "customer_1h": features.get("customer_txn_count_1h", 0),
            "merchant_1h": features.get("merchant_txn_count_1h", 0),
            "customer_failures_1h": features.get("customer_failed_txn_count_1h", 0)
        }
        
        merchant = {
            "txn_count_7d": features.get("merchant_txn_count_7d", 0),
            "failure_rate_7d": features.get("merchant_failure_rate_7d", 0.0)
        }
        
        network = {
            "device_customer_count_7d": features.get("device_customer_count_7d", 1),
            "ip_txn_count_7d": features.get("ip_txn_count_7d", 0)
        }
        
        # 5. Generate deterministic natural language historical context
        historical_context = []
        historical_context.append(f"Customer made {customer_behavior['txn_count_7d']} transactions in the previous 7 days.")
        if customer_behavior['avg_amount_7d'] > 0:
            ratio = transaction.amount / customer_behavior['avg_amount_7d']
            historical_context.append(f"Current amount is {ratio:.1f}x historical average.")
        historical_context.append(f"Device was associated with {network['device_customer_count_7d']} distinct customers in the previous 7 days.")
        
        # 6. Extract structured anomalies based on top signals
        anomalies = []
        for sig in top_signals:
            feature_name = sig.get("feature")
            val = sig.get("value")
            desc = sig.get("description")
            if feature_name and desc:
                anomalies.append(
                    EvidenceItem(
                        signal=feature_name,
                        observed_value=val,
                        description=desc,
                        provenance=InvestigationEvidenceProvenance(
                            source_type="feature",
                            source_ref=feature_name
                        )
                    )
                )
                
        return StructuredEvidence(
            transaction_evidence=transaction_evidence,
            risk_assessment=risk_evidence,
            customer_behavior=customer_behavior,
            velocity_evidence=velocity,
            merchant_behavior=merchant,
            network_evidence=network,
            historical_context=historical_context,
            anomalies=anomalies
        )
