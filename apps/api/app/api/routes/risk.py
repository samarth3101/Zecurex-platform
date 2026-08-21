from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.exc import IntegrityError
import uuid

from app.core.database import get_db
from app.schemas.risk import RiskAssessmentRequest, RiskAssessmentResponse
from app.services.risk_engine.engine import RiskEngine
from app.services.risk_engine.model_loader import ModelLoader
from app.models.transaction import Transaction
from app.models.risk import RiskAssessment

router = APIRouter(prefix="/risk", tags=["Risk"])

@router.post("/assess", response_model=RiskAssessmentResponse)
async def assess_risk(
    request: RiskAssessmentRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Assess transaction risk using the ML Risk Engine.
    Handles idempotency based on razorpay_payment_id and model_version.
    """
    try:
        loader = ModelLoader.get_instance()
        meta = loader.get_metadata()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Risk engine unavailable: {str(e)}"
        )
        
    payment_id = request.transaction.razorpay_payment_id
    model_version = meta["model_version"]

    # Check for existing assessment to handle idempotency
    stmt = select(RiskAssessment).join(Transaction).where(
        and_(
            Transaction.razorpay_payment_id == payment_id,
            RiskAssessment.model_version == model_version
        )
    )
    result = await db.execute(stmt)
    existing_assessment = result.scalar_one_or_none()
    
    if existing_assessment:
        return existing_assessment

    try:
        assessment = await RiskEngine.assess(request, db)
        return assessment
    except IntegrityError as e:
        await db.rollback()
        # If another request inserted the same transaction+model_version concurrently,
        # we catch it and fetch the assessment.
        result = await db.execute(stmt)
        existing_assessment = result.scalar_one_or_none()
        if existing_assessment:
            return existing_assessment
        raise HTTPException(status_code=400, detail="Database integrity error.")
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
