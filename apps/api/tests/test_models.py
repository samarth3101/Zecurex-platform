import pytest
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

from app.models import WebhookEvent, Transaction, RiskAssessment, Investigation, AuditEvent

@pytest.mark.asyncio
async def test_webhook_event_creation(db_session: AsyncSession):
    event = WebhookEvent(
        event_id="evt_test_123",
        event_type="payment.captured",
        payload={"foo": "bar"},
        received_at=datetime.now(timezone.utc)
    )
    db_session.add(event)
    await db_session.commit()
    
    stmt = select(WebhookEvent).where(WebhookEvent.event_id == "evt_test_123")
    result = await db_session.execute(stmt)
    fetched_event = result.scalar_one_or_none()
    
    assert fetched_event is not None
    assert fetched_event.event_type == "payment.captured"
    assert fetched_event.processing_status == "RECEIVED"

@pytest.mark.asyncio
async def test_webhook_event_unique_id(db_session: AsyncSession):
    event1 = WebhookEvent(
        event_id="evt_duplicate",
        event_type="payment.captured",
        payload={},
        received_at=datetime.now(timezone.utc)
    )
    db_session.add(event1)
    await db_session.commit()
    
    event2 = WebhookEvent(
        event_id="evt_duplicate",
        event_type="payment.failed",
        payload={},
        received_at=datetime.now(timezone.utc)
    )
    db_session.add(event2)
    
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()

@pytest.mark.asyncio
async def test_transaction_and_relationships(db_session: AsyncSession):
    # 1. Create Transaction
    tx = Transaction(
        razorpay_payment_id="pay_test_123",
        razorpay_order_id="order_test_123",
        amount=500.0,
        currency="INR",
        status="captured",
        method="card",
        customer_id="cust_test_1",
        merchant_id="merch_test_1"
    )
    db_session.add(tx)
    await db_session.commit()
    await db_session.refresh(tx)
    
    assert tx.id is not None
    
    # 2. Create RiskAssessment referencing Transaction
    risk = RiskAssessment(
        transaction_id=tx.id,
        risk_score=0.15,
        risk_level="LOW",
        decision="ALLOW"
    )
    db_session.add(risk)
    await db_session.commit()
    await db_session.refresh(risk)
    
    assert risk.id is not None
    
    # 3. Create Investigation referencing Transaction and RiskAssessment
    inv = Investigation(
        transaction_id=tx.id,
        risk_assessment_id=risk.id,
        recommendation="No action needed."
    )
    db_session.add(inv)
    await db_session.commit()
    await db_session.refresh(inv)
    
    assert inv.id is not None
    
    # 4. Create AuditEvent referencing Transaction
    audit = AuditEvent(
        transaction_id=tx.id,
        event_type="RISK_ASSESSED",
        actor_type="SYSTEM",
        action="RECORDED"
    )
    db_session.add(audit)
    await db_session.commit()
    await db_session.refresh(audit)
    
    assert audit.id is not None
    
    # Verify relations
    stmt = select(Transaction).where(Transaction.id == tx.id)
    result = await db_session.execute(stmt)
    fetched_tx = result.unique().scalar_one_or_none() # unique() due to potential joins later if eager loaded, safe here.
    
    # Alternatively we can lazy load but since it's async we should use selectinload if we wanted eager load.
    # We will just verify they exist in db with direct queries to show FKs worked.
    
    # Check FK constraints
    stmt = select(Investigation).where(Investigation.transaction_id == tx.id)
    result = await db_session.execute(stmt)
    fetched_inv = result.scalar_one_or_none()
    assert fetched_inv is not None
    assert fetched_inv.recommendation == "No action needed."
