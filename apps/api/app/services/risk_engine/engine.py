import uuid
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.services.risk_engine.model_loader import ModelLoader
from app.services.risk_engine.feature_adapter import FeatureAdapter
from app.services.risk_engine.risk_policy import RiskPolicy
from app.models.transaction import Transaction
from app.models.risk import RiskAssessment
from app.models.audit import AuditEvent
from app.schemas.risk import TransactionEntity, RiskAssessmentRequest, RiskAssessmentResponse

class RiskEngine:
    @classmethod
    async def assess(cls, request: RiskAssessmentRequest, db_session: AsyncSession) -> RiskAssessment:
        loader = ModelLoader.get_instance()
        meta = loader.get_metadata()
        
        tx_data = request.transaction.model_dump()
        tx_data["timestamp"] = tx_data["timestamp"] or datetime.utcnow()
        
        # 1. Historical Context -> Feature Calculation
        # (This executes strictly on history BEFORE tx_data["timestamp"])
        features = await FeatureAdapter.build_features(tx_data, db_session)
        
        # Convert features to a 1-row DataFrame for inference
        import pandas as pd
        features_df = pd.DataFrame([features])
        
        # 2. Model Inference
        risk_score = loader.predict_proba(features_df)
        
        # 3. Apply Risk Policy
        risk_level, decision = RiskPolicy.evaluate(risk_score)
        
        # Extract top risk signals based on model meta (from Phase 5D permutation importance)
        # We will use top generic signals for the hackathon (this would normally be dynamic per prediction e.g. SHAP)
        top_signals = [
            {"feature": "transaction_hour", "value": features.get("transaction_hour"), "description": "Transaction occurred at a statistically unusual hour."},
            {"feature": "customer_txn_count_15m", "value": features.get("customer_txn_count_15m"), "description": "High transaction velocity for customer in the last 15 minutes."},
            {"feature": "amount_vs_customer_avg", "value": round(features.get("amount_vs_customer_avg", 0), 2), "description": "Transaction amount compared to customer's 7-day average."}
        ]
        
        # 4. Transaction Persistence
        # Idempotency check: see if the transaction already exists
        stmt = select(Transaction).where(Transaction.razorpay_payment_id == tx_data["razorpay_payment_id"])
        result = await db_session.execute(stmt)
        transaction = result.scalar_one_or_none()
        
        if not transaction:
            transaction = Transaction(
                razorpay_payment_id=tx_data["razorpay_payment_id"],
                amount=tx_data["amount"],
                currency=tx_data["currency"],
                status=tx_data["status"],
                method=tx_data["method"],
                international=tx_data["international"],
                customer_id=tx_data["customer_id"],
                merchant_id=tx_data["merchant_id"],
                device_id=tx_data.get("device_id"),
                ip_hash=tx_data.get("ip_hash"),
                geo_region=tx_data.get("geo_region"),
                created_at=tx_data["timestamp"]
            )
            db_session.add(transaction)
            await db_session.flush() # To get the transaction ID
            
        # 5. Risk Assessment Persistence
        assessment = RiskAssessment(
            transaction_id=transaction.id,
            risk_score=risk_score,
            risk_level=risk_level,
            model_name=meta["model_name"],
            model_version=meta["model_version"],
            decision=decision,
            risk_factors={"top_signals": top_signals}
        )
        db_session.add(assessment)
        
        # 6. Audit Trail Persistence
        audit = AuditEvent(
            transaction_id=transaction.id,
            event_type="RISK_ASSESSED",
            actor_type="SYSTEM",
            action="RISK_SCORE_GENERATED",
            details={
                "risk_score": risk_score,
                "risk_level": risk_level,
                "decision": decision,
                "model_name": meta["model_name"],
                "model_version": meta["model_version"]
            }
        )
        db_session.add(audit)
        
        # Commit all together
        await db_session.commit()
        await db_session.refresh(assessment)
        
        return assessment
