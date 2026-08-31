from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import uuid
import os
import json
from pathlib import Path

from app.core.database import get_db
from app.models.transaction import Transaction
from app.models.risk import RiskAssessment
from app.models.investigation import Investigation
from app.models.audit import AuditEvent

from app.schemas.transaction import TransactionResponse, DashboardTransactionResponse
from app.schemas.risk import RiskAssessmentResponse, RiskAssessmentRequest
from app.schemas.investigation import InvestigationResponse
from app.schemas.audit import AuditEventResponse

from app.services.risk_engine.engine import RiskEngine
from app.services.investigation.investigation_service import InvestigationService
from pydantic import BaseModel

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Simple Login Schema
class LoginRequest(BaseModel):
    passcode: str

# Dependency for authenticating dashboard routes
def verify_dashboard_auth(request: Request):
    token = request.cookies.get("zecure_admin_token")
    # For hackathon demo, we check against a fixed environment variable or default
    expected_token = os.getenv("ZECURE_ADMIN_KEY", "dev2024")
    if token != expected_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing authentication token")
    return True

@router.post("/auth/login")
async def login(request: LoginRequest, response: Response):
    """
    Hackathon-safe auth endpoint that sets a secure HttpOnly cookie.
    """
    expected_passcode = os.getenv("ZECURE_ADMIN_KEY", "dev2024")
    if request.passcode == expected_passcode:
        response.set_cookie(
            key="zecure_admin_token",
            value=expected_passcode,
            httponly=True,
            samesite="lax",
            secure=False, # Set to False for local dev
            max_age=3600 * 24 # 1 day
        )
        return {"status": "success"}
    raise HTTPException(status_code=401, detail="Invalid passcode")

@router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("zecure_admin_token")
    return {"status": "logged_out"}

@router.get("/transactions", response_model=list[DashboardTransactionResponse], dependencies=[Depends(verify_dashboard_auth)])
async def list_transactions(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """
    Fetch the latest transactions for the dashboard live feed.
    Joins with RiskAssessment to provide risk score and level.
    """
    # Use outer join to get risk assessment if it exists
    # We order by transaction created_at descending
    stmt = (
        select(Transaction, RiskAssessment)
        .outerjoin(RiskAssessment, RiskAssessment.transaction_id == Transaction.id)
        .order_by(desc(Transaction.created_at))
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    responses = []
    for tx, ra in rows:
        resp = DashboardTransactionResponse.model_validate(tx)
        if ra:
            resp.risk_score = ra.risk_score
            resp.risk_level = ra.risk_level
        responses.append(resp)
        
    return responses

@router.get("/transactions/{transaction_id}", response_model=TransactionResponse, dependencies=[Depends(verify_dashboard_auth)])
async def get_transaction(transaction_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Transaction).where(Transaction.id == transaction_id)
    result = await db.execute(stmt)
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx

@router.get("/risk/{transaction_id}", response_model=RiskAssessmentResponse, dependencies=[Depends(verify_dashboard_auth)])
async def get_risk_assessment(transaction_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(RiskAssessment).where(RiskAssessment.transaction_id == transaction_id).order_by(desc(RiskAssessment.created_at)).limit(1)
    result = await db.execute(stmt)
    assessment = result.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Risk assessment not found")
    return assessment

@router.get("/investigations", response_model=list[InvestigationResponse], dependencies=[Depends(verify_dashboard_auth)])
async def list_investigations(limit: int = 50, db: AsyncSession = Depends(get_db)):
    """
    List recent investigations across transactions for the Investigations queue.
    """
    stmt = (
        select(Investigation, RiskAssessment)
        .outerjoin(RiskAssessment, RiskAssessment.id == Investigation.risk_assessment_id)
        .order_by(desc(Investigation.created_at))
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.all()

    responses = []
    for inv, ra in rows:
        responses.append(InvestigationResponse(
            investigation_id=inv.id,
            transaction_id=inv.transaction_id,
            risk_assessment_id=inv.risk_assessment_id,
            status=inv.status,
            risk_score=ra.risk_score if ra else None,
            risk_level=ra.risk_level if ra else None,
            summary=inv.summary,
            severity=inv.severity,
            reasoning=inv.reasoning,
            evidence=inv.evidence,
            key_findings=inv.key_findings,
            recommendation=inv.recommendation,
            confidence=inv.confidence,
            agent_model=inv.agent_model,
            agent_version=inv.agent_version,
            completed_at=inv.completed_at,
        ))
    return responses

@router.get("/investigations/{transaction_id}", response_model=InvestigationResponse, dependencies=[Depends(verify_dashboard_auth)])
async def get_investigation(transaction_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    # Fetch investigation
    inv_stmt = select(Investigation).where(Investigation.transaction_id == transaction_id).order_by(desc(Investigation.created_at)).limit(1)
    inv_result = await db.execute(inv_stmt)
    inv = inv_result.scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    # Fetch linked risk assessment (for score/level)
    ra = None
    if inv.risk_assessment_id:
        ra_stmt = select(RiskAssessment).where(RiskAssessment.id == inv.risk_assessment_id)
        ra_result = await db.execute(ra_stmt)
        ra = ra_result.scalar_one_or_none()

    return InvestigationResponse(
        investigation_id=inv.id,
        transaction_id=inv.transaction_id,
        risk_assessment_id=inv.risk_assessment_id,
        status=inv.status,
        risk_score=ra.risk_score if ra else None,
        risk_level=ra.risk_level if ra else None,
        summary=inv.summary,
        severity=inv.severity,
        reasoning=inv.reasoning,
        evidence=inv.evidence,
        key_findings=inv.key_findings,
        recommendation=inv.recommendation,
        confidence=inv.confidence,
        agent_model=inv.agent_model,
        agent_version=inv.agent_version,
        completed_at=inv.completed_at,
    )

@router.get("/audit", response_model=list[AuditEventResponse], dependencies=[Depends(verify_dashboard_auth)])
async def list_audit_events(limit: int = 100, db: AsyncSession = Depends(get_db)):
    """
    List all recent audit events across the platform for the Audit Trail explorer.
    """
    stmt = select(AuditEvent).order_by(desc(AuditEvent.created_at)).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/audit/{transaction_id}", response_model=list[AuditEventResponse], dependencies=[Depends(verify_dashboard_auth)])
async def get_audit_trail(transaction_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(AuditEvent).where(AuditEvent.transaction_id == transaction_id).order_by(AuditEvent.created_at)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/simulate", response_model=RiskAssessmentResponse, dependencies=[Depends(verify_dashboard_auth)])
async def simulate_payment(
    request: RiskAssessmentRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Simulate a payment via the actual Zecure pipeline.
    Orchestrates the existing RiskEngine.assess() flow and optionally triggers the InvestigationService.
    """
    try:
        # Step 1: Run risk engine (handles Transaction, RiskAssessment, AuditEvent persistence internally)
        assessment = await RiskEngine.assess(request, db)
        
        # Step 2: Trigger investigation if the deterministic policy decision is REVIEW.
        # Use run_investigation_by_uuid() because we have the canonical Transaction UUID
        # from the RiskEngine output, not a razorpay_payment_id string.
        if assessment.decision == "REVIEW":
            await InvestigationService.run_investigation_by_uuid(assessment.transaction_id, db)
            
        return assessment
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/performance", dependencies=[Depends(verify_dashboard_auth)])
async def get_model_performance():
    """
    Fetch ML model performance metrics directly from the training evaluation output.
    """
    # Invariant workspace root derived from __file__
    candidate_paths = [
        Path(__file__).resolve().parents[5] / "ml/evaluation/test_evaluation.json",
        Path(__file__).resolve().parents[4] / "ml/evaluation/test_evaluation.json",
        Path("ml/evaluation/test_evaluation.json").resolve(),
        Path("../../ml/evaluation/test_evaluation.json").resolve(),
    ]
    
    eval_file = None
    for p in candidate_paths:
        if p.exists():
            eval_file = p
            break
            
    if not eval_file or not eval_file.exists():
        raise HTTPException(status_code=404, detail="Performance metrics not found")
        
    try:
        with open(eval_file, "r") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read metrics: {str(e)}")
