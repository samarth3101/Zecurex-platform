import pytest
import uuid
import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.testclient import TestClient

from app.models.transaction import Transaction
from app.models.risk import RiskAssessment
from app.models.investigation import Investigation
from app.schemas.investigation import InvestigationResult, InvestigationReasoning
from app.services.investigation.investigation_service import InvestigationService
from app.agents.investigation.agent import InvestigationAgent

@pytest.mark.asyncio
async def test_evidence_collector_mock():
    # EvidenceCollector is mainly dependent on RiskAssessment and FeatureAdapter.
    # Its integration is tested in integration tests or via the service.
    pass

@pytest.mark.asyncio
async def test_investigation_agent_mock():
    from app.schemas.investigation import StructuredEvidence
    
    class MockProvider:
        async def investigate(self, prompt, evidence):
            return InvestigationResult(
                summary="Test summary",
                severity="HIGH",
                reasoning=InvestigationReasoning(
                    what_happened="Test",
                    why_flagged="Test",
                    what_changed_from_normal="Test",
                    multiple_independent_signals="Test",
                    evidence_weakening_concern="Test",
                    what_should_happen_next="Test"
                ),
                key_findings=["Test finding"],
                recommendation="REVIEW",
                confidence="HIGH"
            )
            
    agent = InvestigationAgent(provider=MockProvider())
    evidence = StructuredEvidence(
        transaction_evidence={"amount": 100, "currency": "INR", "status": "authorized", "method": "upi", "international": False, "error_reason": None, "refund_status": None},
        risk_assessment={"risk_score": 0.9, "risk_level": "HIGH", "decision": "REVIEW", "model_name": "rf", "model_version": "1.0", "top_signals": []},
        customer_behavior={"avg_amount_7d": 50, "txn_count_7d": 2, "success_rate_7d": 1.0},
        velocity_evidence={"customer_5m": 1, "customer_15m": 1, "customer_1h": 1, "merchant_1h": 1, "customer_failures_1h": 0},
        merchant_behavior={"txn_count_7d": 1, "failure_rate_7d": 0.0},
        network_evidence={"device_customer_count_7d": 1, "ip_txn_count_7d": 1},
        historical_context=["Test"],
        anomalies=[]
    )
    
    res = await agent.investigate(evidence)
    assert res.summary == "Test summary"
    assert res.recommendation == "REVIEW"


