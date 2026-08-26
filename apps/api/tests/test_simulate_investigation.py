"""
Regression test for the P0 investigation trigger bug.

Bug: POST /dashboard/simulate called InvestigationService.run_investigation(str(uuid), db)
     which queries Transaction by razorpay_payment_id, not by UUID — causing a 404.

Fix: Introduced run_investigation_by_uuid(uuid, db) that queries by Transaction.id.
     dashboard/simulate now calls run_investigation_by_uuid(assessment.transaction_id, db).

This test verifies the complete simulate → risk assess → investigation trigger chain
using a mock for _run_investigation_logic so it does not require a live Gemini API key.
"""
import pytest
import uuid
import datetime
from unittest.mock import patch, AsyncMock, MagicMock
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.database import get_db
from app.services.risk_engine.model_loader import ModelLoader
from app.schemas.investigation import (
    InvestigationResult,
    InvestigationReasoning,
    InvestigationResponse,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def ensure_model_loaded():
    ModelLoader.get_instance()


@pytest.fixture(autouse=True)
def override_db(db_session):
    async def _override():
        yield db_session

    app.dependency_overrides[get_db] = _override
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def auth_cookies():
    """Simulate the zecure_admin_token cookie used by dashboard routes."""
    return {"zecure_admin_token": "dev2024"}


def _mock_investigation_result() -> InvestigationResult:
    return InvestigationResult(
        summary="Regression test investigation",
        severity="HIGH",
        reasoning=InvestigationReasoning(
            what_happened="Test transaction occurred at an unusual hour.",
            why_flagged="High risk score from ML model.",
            what_changed_from_normal="Velocity spike detected.",
            multiple_independent_signals="Transaction hour + velocity.",
            evidence_weakening_concern="Could be legitimate bulk purchase.",
            what_should_happen_next="Manual review recommended.",
        ),
        key_findings=["Unusual hour", "Velocity anomaly"],
        recommendation="REVIEW",
        confidence="HIGH",
    )


def _mock_investigation_response(tx_uuid: uuid.UUID) -> InvestigationResponse:
    """Build a realistic InvestigationResponse from mock data."""
    return InvestigationResponse(
        investigation_id=uuid.uuid4(),
        transaction_id=tx_uuid,
        risk_assessment_id=uuid.uuid4(),
        status="COMPLETED",
        risk_score=0.95,
        risk_level="HIGH",
        summary="Regression test investigation",
        severity="HIGH",
        key_findings=["Unusual hour", "Velocity anomaly"],
        recommendation="REVIEW",
        confidence="HIGH",
        agent_model="gemini-2.5-flash",
        agent_version="1.0.0",
        completed_at=datetime.datetime.now(datetime.timezone.utc),
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_simulate_investigate_uuid_regression(auth_cookies):
    """
    Regression test for P0 bug: InvestigationService.run_investigation() was
    called with a Transaction UUID, but it queried by razorpay_payment_id.

    Specifically verifies:
    1. simulate endpoint calls run_investigation_by_uuid (not run_investigation)
    2. The investigation record appears under GET /dashboard/investigations/{tx_id}
    3. The investigation is COMPLETED (not FAILED due to wrong ID lookup)

    We mock _run_investigation_logic to avoid requiring a live Gemini API key,
    and instead verify the routing/persistence contract.
    """
    payment_id = f"pay_regtest_{uuid.uuid4().hex[:10]}"
    payload = {
        "transaction": {
            "razorpay_payment_id": payment_id,
            "amount": 99999.0,
            "currency": "INR",
            "status": "authorized",
            "method": "card",
            "international": True,
            "customer_id": f"cust_regtest_{uuid.uuid4().hex[:6]}",
            "merchant_id": "merch_regtest_001",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
    }

    # Track which tx_id was passed so we can assert it was the UUID, not a string
    captured_uuid = []

    from app.models.transaction import Transaction as TxModel
    from app.services.investigation.investigation_service import InvestigationService

    original_run = InvestigationService._run_investigation_logic

    async def _mock_run(transaction: TxModel, db):
        captured_uuid.append(transaction.id)
        # Actually persist a minimal investigation record to DB so the endpoint can return it
        from app.models.investigation import Investigation
        from app.models.risk import RiskAssessment
        from sqlalchemy import select
        from sqlalchemy.ext.asyncio import AsyncSession
        from app.models.audit import AuditEvent

        ra_stmt = (
            select(RiskAssessment)
            .where(RiskAssessment.transaction_id == transaction.id)
            .order_by(RiskAssessment.created_at.desc())
        )
        ra_result = await db.execute(ra_stmt)
        ra = ra_result.scalars().first()

        inv = Investigation(
            transaction_id=transaction.id,
            risk_assessment_id=ra.id if ra else None,
            status="COMPLETED",
            agent_model="gemini-2.5-flash",
            agent_version="1.0.0",
            summary="Regression test investigation",
            severity="HIGH",
            key_findings=["Unusual hour", "Velocity anomaly"],
            recommendation="REVIEW",
            confidence="HIGH",
            completed_at=datetime.datetime.now(datetime.timezone.utc),
        )
        db.add(inv)
        await db.commit()
        await db.refresh(inv)
        return InvestigationResponse(
            investigation_id=inv.id,
            transaction_id=inv.transaction_id,
            risk_assessment_id=inv.risk_assessment_id,
            status=inv.status,
            risk_score=ra.risk_score if ra else None,
            risk_level=ra.risk_level if ra else None,
            summary=inv.summary,
            severity=inv.severity,
            key_findings=inv.key_findings,
            recommendation=inv.recommendation,
            confidence=inv.confidence,
            agent_model=inv.agent_model,
            agent_version=inv.agent_version,
            completed_at=inv.completed_at,
        )

    with (
        patch.object(ModelLoader, "predict_proba", return_value=0.95),
        patch.object(
            InvestigationService,
            "_run_investigation_logic",
            side_effect=_mock_run,
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            client.cookies.update(auth_cookies)
            response = await client.post("/api/v1/dashboard/simulate", json=payload)

    assert response.status_code == 200, response.text
    data = response.json()

    # Risk assessment returned
    assert data["decision"] == "REVIEW"
    assert data["risk_level"] in ("HIGH", "CRITICAL")

    # _run was called with the Transaction UUID object (not a string payment_id)
    assert len(captured_uuid) == 1, "Investigation was not triggered"
    # The UUID passed must match the transaction_id in the response
    tx_id = data["transaction_id"]
    assert str(captured_uuid[0]) == tx_id, (
        f"P0 REGRESSION DETECTED: _run received {captured_uuid[0]} "
        f"but expected UUID matching {tx_id}"
    )

    # Investigation must be retrievable from the dashboard endpoint
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        client.cookies.update(auth_cookies)
        inv_resp = await client.get(f"/api/v1/dashboard/investigations/{tx_id}")

    assert inv_resp.status_code == 200, (
        f"Investigation not found (status {inv_resp.status_code}). "
        "This would indicate the P0 regression is still present."
    )
    inv_data = inv_resp.json()
    assert inv_data["status"] == "COMPLETED"
    assert inv_data["recommendation"] == "REVIEW"
    assert inv_data["summary"] == "Regression test investigation"


@pytest.mark.asyncio
async def test_simulate_no_investigation_when_not_review(auth_cookies):
    """
    When the risk score is below the REVIEW threshold, no investigation should
    be triggered, but the transaction and risk assessment should still be persisted.
    """
    payment_id = f"pay_low_{uuid.uuid4().hex[:10]}"
    payload = {
        "transaction": {
            "razorpay_payment_id": payment_id,
            "amount": 100.0,
            "currency": "INR",
            "status": "authorized",
            "method": "upi",
            "international": False,
            "customer_id": f"cust_low_{uuid.uuid4().hex[:6]}",
            "merchant_id": "merch_low_001",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
    }

    with patch.object(ModelLoader, "predict_proba", return_value=0.05):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            client.cookies.update(auth_cookies)
            response = await client.post("/api/v1/dashboard/simulate", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "ALLOW"

    tx_id = data["transaction_id"]

    # Investigation endpoint should return 404 (none triggered)
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        client.cookies.update(auth_cookies)
        inv_resp = await client.get(f"/api/v1/dashboard/investigations/{tx_id}")
    assert inv_resp.status_code == 404


@pytest.mark.asyncio
async def test_simulate_audit_events_persisted(auth_cookies):
    """
    Simulate a REVIEW transaction and verify that RISK_ASSESSED is always
    present in the audit trail.
    """
    payment_id = f"pay_audit_{uuid.uuid4().hex[:10]}"
    payload = {
        "transaction": {
            "razorpay_payment_id": payment_id,
            "amount": 75000.0,
            "currency": "INR",
            "status": "authorized",
            "method": "card",
            "international": False,
            "customer_id": f"cust_audit_{uuid.uuid4().hex[:6]}",
            "merchant_id": "merch_audit_001",
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
    }

    from app.services.investigation.investigation_service import InvestigationService

    with (
        patch.object(ModelLoader, "predict_proba", return_value=0.92),
        patch.object(
            InvestigationService,
            "_run_investigation_logic",
            new_callable=AsyncMock,
            return_value=_mock_investigation_response(uuid.uuid4()),
        ),
    ):
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as client:
            client.cookies.update(auth_cookies)
            response = await client.post("/api/v1/dashboard/simulate", json=payload)

    assert response.status_code == 200
    tx_id = response.json()["transaction_id"]

    # Fetch audit trail
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        client.cookies.update(auth_cookies)
        audit_resp = await client.get(f"/api/v1/dashboard/audit/{tx_id}")

    assert audit_resp.status_code == 200
    events = audit_resp.json()
    event_types = [e["event_type"] for e in events]

    assert "RISK_ASSESSED" in event_types, f"Missing RISK_ASSESSED in {event_types}"
