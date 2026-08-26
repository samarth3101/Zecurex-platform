import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from pydantic import ValidationError

from app.models.transaction import Transaction
from app.models.risk import RiskAssessment
from app.models.investigation import Investigation
from app.models.audit import AuditEvent
from app.schemas.investigation import InvestigationResponse

from app.services.investigation.evidence_collector import EvidenceCollector
from app.agents.investigation.agent import InvestigationAgent
from app.agents.investigation.provider import GeminiProvider

class InvestigationService:
    @classmethod
    async def run_investigation(cls, transaction_id: str, db: AsyncSession) -> InvestigationResponse:
        # 1. Retrieve transaction
        tx_stmt = select(Transaction).where(Transaction.razorpay_payment_id == transaction_id)
        tx_result = await db.execute(tx_stmt)
        transaction = tx_result.scalars().first()
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        return await cls._run_investigation_logic(transaction, db)

    @classmethod
    async def run_investigation_by_uuid(cls, transaction_uuid: uuid.UUID, db: AsyncSession) -> InvestigationResponse:
        # 1. Retrieve transaction
        tx_stmt = select(Transaction).where(Transaction.id == transaction_uuid)
        tx_result = await db.execute(tx_stmt)
        transaction = tx_result.scalars().first()
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
            
        return await cls._run_investigation_logic(transaction, db)

    @classmethod
    async def _run_investigation_logic(cls, transaction: Transaction, db: AsyncSession) -> InvestigationResponse:
        # 2. Retrieve RiskAssessment
        ra_stmt = select(RiskAssessment).where(RiskAssessment.transaction_id == transaction.id).order_by(RiskAssessment.created_at.desc())
        ra_result = await db.execute(ra_stmt)
        risk_assessment = ra_result.scalars().first()
        
        if not risk_assessment:
            raise HTTPException(status_code=400, detail="Transaction has no RiskAssessment")
            
        # 3. Verify investigation trigger
        # (For the purpose of hackathon, we can investigate anything, but ideally we check if it needs investigation)
        # We will proceed anyway if explicitly called.
        
        # Check idempotency
        # If an investigation already exists for this risk_assessment and agent_version, return it.
        agent_version = "1.0.0"
        inv_stmt = select(Investigation).where(
            Investigation.risk_assessment_id == risk_assessment.id,
            Investigation.agent_version == agent_version
        )
        inv_result = await db.execute(inv_stmt)
        existing_investigation = inv_result.scalars().first()
        if existing_investigation and existing_investigation.status == "COMPLETED":
            return cls._to_response(existing_investigation, risk_assessment, transaction)
            
        # Initialize new Investigation
        investigation = Investigation(
            transaction_id=transaction.id,
            risk_assessment_id=risk_assessment.id,
            status="PENDING",
            agent_model="gemini-2.5-flash",
            agent_version=agent_version
        )
        db.add(investigation)
        # Flush to get the investigation ID
        await db.flush()
        
        # Log AuditEvent - Started
        audit_started = AuditEvent(
            transaction_id=transaction.id,
            event_type="INVESTIGATION_STARTED",
            actor_type="SYSTEM",
            action="INVESTIGATION_TRIGGERED",
            details={"investigation_id": str(investigation.id)}
        )
        db.add(audit_started)
        
        try:
            # 4. Collect deterministic evidence
            evidence = await EvidenceCollector.collect(transaction, risk_assessment, db)
            
            # 5. Invoke InvestigationAgent
            provider = GeminiProvider(model_name="gemini-2.5-flash")
            agent = InvestigationAgent(provider=provider)
            
            # Allow 1 retry on validation error
            max_retries = 1
            result = None
            for attempt in range(max_retries + 1):
                try:
                    result = await agent.investigate(evidence)
                    break
                except ValidationError as e:
                    if attempt == max_retries:
                        raise e
                        
            # 6. Update Investigation Record
            if result:
                investigation.status = "COMPLETED"
                investigation.summary = result.summary
                investigation.severity = result.severity
                investigation.reasoning = result.reasoning.model_dump()
                investigation.key_findings = result.key_findings # Note: need to add this to the DB model or store in reasoning if we didn't add it
                investigation.recommendation = result.recommendation
                investigation.confidence = result.confidence
                investigation.evidence = evidence.model_dump()
                investigation.completed_at = datetime.now(timezone.utc)
            else:
                investigation.status = "FAILED"
                
        except Exception as e:
            investigation.status = "FAILED"
            investigation.summary = f"Investigation failed: {str(e)}"
            
        # 7. Persist AuditEvent
        audit_completed = AuditEvent(
            transaction_id=transaction.id,
            event_type="INVESTIGATION_COMPLETED" if investigation.status == "COMPLETED" else "INVESTIGATION_FAILED",
            actor_type="SYSTEM",
            action="INVESTIGATION_GENERATED",
            details={
                "investigation_id": str(investigation.id),
                "status": investigation.status,
                "recommendation": investigation.recommendation
            }
        )
        db.add(audit_completed)
        
        await db.commit()
        await db.refresh(investigation)
        
        return cls._to_response(investigation, risk_assessment, transaction)
        
    @staticmethod
    def _to_response(inv: Investigation, ra: RiskAssessment, tx: Transaction) -> InvestigationResponse:
        return InvestigationResponse(
            investigation_id=inv.id,
            transaction_id=tx.id,
            risk_assessment_id=ra.id,
            status=inv.status,
            risk_score=ra.risk_score,
            risk_level=ra.risk_level,
            summary=inv.summary,
            severity=inv.severity,
            key_findings=inv.key_findings,
            recommendation=inv.recommendation,
            confidence=inv.confidence,
            agent_model=inv.agent_model,
            agent_version=inv.agent_version,
            completed_at=inv.completed_at
        )
