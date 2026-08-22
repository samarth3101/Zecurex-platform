from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.investigation import InvestigationResponse
from app.services.investigation.investigation_service import InvestigationService

router = APIRouter(prefix="/investigations", tags=["investigations"])

@router.post("/{transaction_id}", response_model=InvestigationResponse)
async def trigger_investigation(
    transaction_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Synchronously triggers an AI investigation for a transaction.
    Gathers point-in-time deterministic evidence, invokes the LLM InvestigationAgent,
    and returns a structured investigation reasoning and recommendation.
    """
    return await InvestigationService.run_investigation(transaction_id, db)
